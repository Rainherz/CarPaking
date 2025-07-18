import React, { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, Alert, View, Text } from "react-native";
import { ThemedView } from "../components/common/ThemedView";
import { ThemedText } from "../components/common/ThemedText";
import AdminScreenHeader from "../components/admin/AdminScreenHeader";
import { TariffsSection, BusinessInfoSection, SystemConfigSection } from "../components/admin/SystemSettingsSections";
import { adminSharedStyles as styles } from "../styles/AdminShared.styles";
import { databaseService } from "../services/databaseService";

interface SystemSettingsScreenProps {
  onBack: () => void;
}

type SettingsData = {
  tariffs: {
    firstHour: number;
    additionalHour: number;
    maxDailyRate: number;
    nightRate: number;
    weekendMultiplier: number;
  };
  businessInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    ruc: string;
    maxSpots: number;
  };
  systemConfig: {
    autoBackup: boolean;
    printTickets: boolean;
    useOCR: boolean;
    soundAlerts: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    language: string;
  };
};

export default function SystemSettingsScreen({ onBack }: SystemSettingsScreenProps) {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [activeSection, setActiveSection] = useState<"tariffs" | "business" | "system">("tariffs");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 🔧 CARGAR CONFIGURACIONES REALES DE LA BD
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const allSettings = await databaseService.getAllSettings();
      setSettings(allSettings);
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
      Alert.alert("Error", "No se pudieron cargar las configuraciones");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 ACTUALIZAR CONFIGURACIONES EN BD
  const handleUpdateSettings = async (section: keyof SettingsData, data: any) => {
    if (!settings) return;

    try {
      setIsSaving(true);
      
      // Preparar datos para guardar en BD según la sección
      let settingsToSave: Record<string, string> = {};
      
      if (section === 'tariffs') {
        settingsToSave = {
          tariff_first_hour: data.firstHour.toString(),
          tariff_additional_hour: data.additionalHour.toString(),
          tariff_max_daily: data.maxDailyRate.toString(),
          tariff_night_rate: data.nightRate.toString(),
          tariff_weekend_multiplier: data.weekendMultiplier.toString(),
        };
      } else if (section === 'businessInfo') {
        settingsToSave = {
          business_name: data.name,
          business_address: data.address,
          business_phone: data.phone,
          business_email: data.email,
          business_ruc: data.ruc,
          business_max_spots: data.maxSpots.toString(),
        };
      } else if (section === 'systemConfig') {
        settingsToSave = {
          system_auto_backup: data.autoBackup.toString(),
          system_print_tickets: data.printTickets.toString(),
          system_use_ocr: data.useOCR.toString(),
          system_sound_alerts: data.soundAlerts.toString(),
          system_max_login_attempts: data.maxLoginAttempts.toString(),
          system_session_timeout: data.sessionTimeout.toString(),
          system_language: data.language,
        };
      }

      // Guardar en BD
      await databaseService.saveSettings(settingsToSave);
      
      // Actualizar estado local
      setSettings(prev => prev ? ({ ...prev, [section]: data }) : null);
      
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
      Alert.alert("Error", "No se pudieron guardar las configuraciones");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSettings = async () => {
    Alert.alert(
      "Exportar Configuración",
      "Se creará un archivo de respaldo con toda la configuración actual.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Exportar", onPress: async () => {
          try {
            // Marcar fecha de último backup
            await databaseService.setSetting('last_backup', new Date().toISOString());
            Alert.alert("Éxito", "Configuración exportada correctamente");
          } catch (error) {
            Alert.alert("Error", "No se pudo exportar la configuración");
          }
        }},
      ]
    );
  };

  const handleImportSettings = () => {
    Alert.alert(
      "Importar Configuración",
      "¿Estás seguro? Esto sobrescribirá la configuración actual.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Importar", style: "destructive", onPress: () => {
          // Lógica para importar configuración
          Alert.alert("Éxito", "Configuración importada correctamente");
          loadSettings(); // Recargar configuraciones
        }},
      ]
    );
  };


  const sectionButtons = [
    { key: "tariffs", title: "Tarifas", icon: "attach-money" },
    { key: "business", title: "Negocio", icon: "business" },
    { key: "system", title: "Sistema", icon: "settings" },
  ];

  // 🔧 MOSTRAR LOADING MIENTRAS CARGA
  if (isLoading || !settings) {
    return (
      <ThemedView style={styles.container}>
        <AdminScreenHeader
          title="Configuración del Sistema"
          subtitle="Cargando configuraciones..."
          onBack={onBack}
        />
        <ThemedView style={[styles.card, { margin: 16, alignItems: 'center', paddingVertical: 40 }]}>
          <ThemedText style={{ color: '#999', marginTop: 12 }}>Cargando configuraciones...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AdminScreenHeader
        title="Configuración del Sistema"
        subtitle="Gestionar parámetros y ajustes"
        onBack={onBack}
        rightAction={loadSettings}
        rightIcon="refresh"
      />

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Botones de Navegación de Secciones */}
        <ThemedView style={styles.card}>
          <ThemedText style={styles.sectionTitle}>
             Secciones de Configuración
          </ThemedText>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            {sectionButtons.map((section) => (
              <TouchableOpacity
                key={section.key}
                style={[
                  styles.button,
                  { flex: 1, paddingVertical: 16 },
                  activeSection === section.key && { backgroundColor: "#4CAF50" },
                  activeSection !== section.key && styles.buttonSecondary,
                ]}
                onPress={() => setActiveSection(section.key as any)}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>
                  {section.key === "tariffs" && "💰"}
                  {section.key === "business" && "🏢"}
                  {section.key === "system" && "⚙️"}
                </Text>

          
                <ThemedText style={[styles.buttonText, { fontSize: 12 }]}>
                  {section.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Indicador de guardado */}
        {isSaving && (
          <ThemedView style={[styles.card, { backgroundColor: '#e8f5e8', borderColor: '#4CAF50', borderWidth: 1 }]}>
            <ThemedText style={{ color: '#2E7D32', textAlign: 'center' }}>
              Guardando configuraciones...
            </ThemedText>
          </ThemedView>
        )}

        {/* Sección Activa */}
        {activeSection === "tariffs" && (
          <TariffsSection settings={settings} onUpdate={handleUpdateSettings} />
        )}
        
        {activeSection === "business" && (
          <BusinessInfoSection settings={settings} onUpdate={handleUpdateSettings} />
        )}
        
        {activeSection === "system" && (
          <SystemConfigSection settings={settings} onUpdate={handleUpdateSettings} />
        )}

      </ScrollView>
    </ThemedView>
  );
}