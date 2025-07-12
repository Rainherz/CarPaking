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

  private async preprocessImage(imageUri: string) {
    try {
      const cleanUri = imageUri.replace('file://', '');
      const { width, height } = await this.getImageSize(cleanUri);

      const targetWidth = 1024;
      const targetHeight = Math.round((height * targetWidth) / width);

      const resultUri = await PhotoManipulator.batch(
        cleanUri,
        [],
        { x: 0, y: 0, width, height },
        { width: targetWidth, height: targetHeight },
        80,
        MimeType.JPEG
      );

      return { uri: resultUri };
    } catch (error) {
      return { uri: imageUri };
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
    const cleanText = text.toUpperCase()
      .replace(/[^A-Z0-9\s\-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    let bestMatch = { plateNumber: '', confidence: 0 };

    for (const pattern of this.platePatterns) {
      const matches = [...cleanText.matchAll(pattern)];
      for (const match of matches) {
        const candidate = match[1].replace(/[\s-]/g, '');
        const confidence = this.calculatePlateConfidence(candidate);

        if (confidence > bestMatch.confidence) {
          bestMatch = {
            plateNumber: this.formatPlateNumber(candidate),
            confidence
          };
        }
      }
    }

    if (bestMatch.confidence === 0) {
      const fallbackMatches = [...cleanText.matchAll(/([A-Z]{2,3}\d{3,4})/g)];
      for (const match of fallbackMatches) {
        const candidate = match[1];
        const confidence = this.calculatePlateConfidence(candidate) * 0.7;
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            plateNumber: this.formatPlateNumber(candidate),
            confidence
          };
        }
      }
    }

    return bestMatch;
  }

  private calculatePlateConfidence(plateCandidate: string): number {
    let confidence = 0.3;

    if (plateCandidate.length >= 6 && plateCandidate.length <= 8) confidence += 0.3;
    if (this.validatePlateFormat(plateCandidate)) confidence += 0.3;
    if (/[A-Z]/.test(plateCandidate) && /[0-9]/.test(plateCandidate)) confidence += 0.1;

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
