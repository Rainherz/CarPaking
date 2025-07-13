import { Image, Platform } from 'react-native';
import PhotoManipulator, { MimeType } from 'react-native-photo-manipulator';
import TextRecognition from '@react-native-ml-kit/text-recognition';

interface OCRResult {
  plateNumber: string;
  confidence: number;
  success: boolean;
  error?: string;
  allText?: string;
  processingTime?: number;
}

interface TextBlock {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

class OCRService {
  private platePatterns = [
    /([A-Z]{3}[-\s]?\d{3})/g,
    /([A-Z]\d{2}[-\s]?\d{3})/g,
    /([A-Z]{2}\d{4})/g,
    /([A-Z]{3}\d{3})/g,
  ];

  private async getImageSize(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        reject
      );
    });
  }

  async detectPlate(imageUri: string): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      const processedImage = await this.preprocessImage(imageUri);
      const result = await TextRecognition.recognize(processedImage.uri);

      const processingTime = Date.now() - startTime;
      const plateInfo = this.extractPlateFromMLKitResult(result);

      return {
        plateNumber: plateInfo.plateNumber,
        confidence: plateInfo.confidence,
        success: plateInfo.plateNumber.length > 0,
        allText: result.text,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        plateNumber: '',
        confidence: 0,
        success: false,
        error: `Error procesando imagen: ${error instanceof Error ? error.message : String(error)}`,
        processingTime
      };
    }
  }

  private async preprocessImage(imageUri: string, isAlreadyCropped: boolean = false) {
    try {
      const cleanUri = imageUri.replace('file://', '');
      const { width, height } = await this.getImageSize(cleanUri);

      console.log(`🖼️ Procesando imagen: ${width}x${height}`);

      // ✅ Si ya está croppeada, usar tamaño óptimo para placas
      let targetWidth = 1024;
      let targetHeight = Math.round((height * targetWidth) / width);
      
      if (isAlreadyCropped) {
        // Para imágenes croppeadas de placas, usar dimensiones específicas
        targetWidth = 800;  // Ancho óptimo para OCR de placas
        targetHeight = 360; // Alto proporcional para placas peruanas
        console.log('✂️ Optimizando imagen croppeada de placa');
      }

      const resultUri = await PhotoManipulator.batch(
        cleanUri,
        [
          // ✅ AGREGAR: Filtros para mejorar OCR de placas
          // Opcional: aumentar contraste para mejor reconocimiento
        ],
        { x: 0, y: 0, width, height },
        { width: targetWidth, height: targetHeight },
        95, // ✅ Mayor calidad para OCR de placas croppeadas
        MimeType.JPEG
      );

      console.log('✅ Imagen optimizada para OCR');
      return { uri: resultUri };
    } catch (error) {
      console.warn('⚠️ Error optimizando imagen:', error);
      return { uri: imageUri };
    }
  }

  async detectPlateFromCroppedImage(imageUri: string): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      console.log('🔍 Analizando imagen croppeada de placa...');

      // Usar preprocessImage optimizado para croppeadas
      const processedImage = await this.preprocessImage(imageUri, true);
      
      // ✅ CONFIGURAR: OCR con parámetros optimizados para placas
      const result = await TextRecognition.recognize(processedImage.uri);

      const processingTime = Date.now() - startTime;
      const plateInfo = this.extractPlateFromMLKitResult(result);

      console.log(`✅ OCR completado en imagen croppeada: ${processingTime}ms`);
      console.log(`🎯 Texto detectado: "${result.text}"`);
      console.log(`🚗 Placa extraída: "${plateInfo.plateNumber}" (${Math.round(plateInfo.confidence * 100)}%)`);

      return {
        plateNumber: plateInfo.plateNumber,
        confidence: plateInfo.confidence,
        success: plateInfo.plateNumber.length > 0,
        allText: result.text,
        processingTime
      };

    } catch (error) {
      console.error('❌ Error en OCR de imagen croppeada:', error);
      const processingTime = Date.now() - startTime;
      
      return {
        plateNumber: '',
        confidence: 0,
        success: false,
        error: `Error procesando imagen croppeada: ${error instanceof Error ? error.message : String(error)}`,
        processingTime
      };
    }
  }

  async preprocessPlateArea(imageUri: string, cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): Promise<{ uri: string }> {
    try {
      const cleanUri = imageUri.replace('file://', '');
      const { width, height } = await this.getImageSize(cleanUri);

      const region = cropArea ?? { x: 0, y: 0, width, height };
      const targetWidth = 1024;
      const aspectRatio = region.height / region.width;
      const targetHeight = Math.round(targetWidth * aspectRatio);

      const resultUri = await PhotoManipulator.batch(
        cleanUri,
        [],
        region,
        { width: targetWidth, height: targetHeight },
        80,
        MimeType.JPEG
      );

      return { uri: resultUri };
    } catch (error) {
      return { uri: imageUri };
    }
  }

  private extractPlateFromMLKitResult(result: any): { plateNumber: string; confidence: number } {
    const fullText = result.text || '';
    let bestMatch = this.extractPlateFromText(fullText);

    if (result.blocks) {
      for (const block of result.blocks) {
        const blockMatch = this.extractPlateFromText(block.text || '');
        const blockConfidence = (block.confidence ?? 1) * blockMatch.confidence;

        if (blockConfidence > bestMatch.confidence) {
          bestMatch = blockMatch;
          bestMatch.confidence = blockConfidence;
        }

        for (const line of block.lines || []) {
          const lineMatch = this.extractPlateFromText(line.text || '');
          const lineConfidence = (line.confidence ?? 1) * lineMatch.confidence;

          if (lineConfidence > bestMatch.confidence) {
            bestMatch = lineMatch;
            bestMatch.confidence = lineConfidence;
          }
        }
      }
    }

    return bestMatch;
  }

  private extractPlateFromText(text: string): { plateNumber: string; confidence: number } {
    if (!text) return { plateNumber: '', confidence: 0 };

    console.log('🔍 Analizando texto para extraer placa:', text);

    // ✅ Limpiar texto con mayor agresividad para imágenes croppeadas
    const cleanText = text
      .toUpperCase()
      .replace(/[^A-Z0-9\s\-]/g, '') // Solo letras, números, espacios, guiones
      .replace(/\s+/g, ' ')
      .replace(/[O]/g, '0') // ✅ AGREGAR: Corregir OCR común O->0
      .replace(/[I]/g, '1') // ✅ AGREGAR: Corregir OCR común I->1
      .trim();

    console.log('🧹 Texto limpio:', cleanText);

    let bestMatch = { plateNumber: '', confidence: 0 };

    // ✅ MEJORAR: Patrones más específicos para placas peruanas
    const peruPlatePatterns = [
      /([A-Z]{3}[-\s]?\d{3})/g,     // ABC-123 (más común)
      /([A-Z]{3}\d{3})/g,           // ABC123 (sin separador)
      /([A-Z]\d{2}[-\s]?\d{3})/g,   // A12-345 (taxis)
      /([A-Z]{2}\d{4})/g,           // AB1234 (motos)
    ];

    // Buscar con patrones específicos
    for (const pattern of peruPlatePatterns) {
      const matches = [...cleanText.matchAll(pattern)];
      
      for (const match of matches) {
        const candidate = match[1].replace(/[\s-]/g, '');
        const confidence = this.calculatePlateConfidence(candidate, cleanText);
        
        console.log(`🎯 Candidato encontrado: "${candidate}" (confianza: ${Math.round(confidence * 100)}%)`);
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            plateNumber: this.formatPlateNumber(candidate),
            confidence
          };
        }
      }
    }

    // ✅ MEJORAR: Mayor confianza base para imágenes croppeadas
    if (bestMatch.confidence > 0) {
      bestMatch.confidence = Math.min(bestMatch.confidence * 1.2, 1.0); // Bonus por crop
      console.log(`🎯 Placa final: "${bestMatch.plateNumber}" (confianza ajustada: ${Math.round(bestMatch.confidence * 100)}%)`);
    }

    return bestMatch;
  }


  private calculatePlateConfidence(plateCandidate: string, fullText: string): number {
    let confidence = 0.4; // ✅ Base más alta para imágenes croppeadas

    // Verificar longitud de placa peruana
    if (plateCandidate.length >= 6 && plateCandidate.length <= 8) {
      confidence += 0.3;
    }

    // Verificar formato específico peruano
    if (this.validatePlateFormat(plateCandidate)) {
      confidence += 0.3;
    }

    // Verificar que tenga letras Y números
    const hasLetters = /[A-Z]/.test(plateCandidate);
    const hasNumbers = /[0-9]/.test(plateCandidate);
    if (hasLetters && hasNumbers) {
      confidence += 0.1;
    }

    // ✅ BONUS: Si el texto es corto (imagen croppeada), más confianza
    if (fullText.length < 20) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  public validatePlateFormat(plateNumber: string): boolean {
    const clean = plateNumber.replace(/[\s-]/g, '').toUpperCase();
    const patterns = [/^[A-Z]{3}\d{3}$/, /^[A-Z]\d{5}$/, /^[A-Z]{2}\d{4}$/];
    return patterns.some(p => p.test(clean));
  }

  public formatPlateNumber(plateNumber: string): string {
    const clean = plateNumber.replace(/[\s-]/g, '').toUpperCase();
    return /^[A-Z]{3}\d{3}$/.test(clean) ? `${clean.slice(0, 3)}-${clean.slice(3)}` : clean;
  }

  async testOCRBasic(): Promise<OCRResult> {
    const startTime = Date.now();
    await new Promise(res => setTimeout(res, 1000));

    const plates = ['ABC-123', 'XYZ-789', 'DEF-456'];
    const plate = plates[Math.floor(Math.random() * plates.length)];

    return {
      plateNumber: plate,
      confidence: 0.92,
      success: true,
      allText: `REPUBLICA DEL PERU\n${plate}`,
      processingTime: Date.now() - startTime
    };
  }

  async detectPlateFromProcessedImage(imageUri: string, isAlreadyProcessed = false): Promise<OCRResult> {
    return isAlreadyProcessed
      ? this.detectPlate(imageUri)
      : this.detectPlate((await this.preprocessImage(imageUri)).uri);
  }

  async detectPlateFromCamera(imageUri: string): Promise<OCRResult> {
    const result = await TextRecognition.recognize(imageUri);
    const plateInfo = this.extractPlateFromMLKitResult(result);

    return {
      plateNumber: plateInfo.plateNumber,
      confidence: plateInfo.confidence,
      success: plateInfo.plateNumber.length > 0,
      allText: result.text,
      processingTime: 0
    };
  }

  cleanup(): void {
    console.log('🧹 Limpieza final de OCR');
  }
}

export const ocrService = new OCRService();
