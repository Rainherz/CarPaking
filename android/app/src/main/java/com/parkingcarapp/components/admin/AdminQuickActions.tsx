import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ThemedView } from "../common/ThemedView";
import { ThemedText } from "../common/ThemedText";
import { adminStyles as styles } from "../../styles/AdminScreen.styles";

export default function AdminQuickActions({ 
  onReports, 
  onOperators, 
  onSettings 
}: { 
  onReports: () => void; 
  onOperators: () => void; 
  onSettings: () => void; 
}) {
  return (
    <ThemedView style={styles.actionsContainer}>
      <ThemedText style={styles.sectionTitle}>Gestión Administrativa</ThemedText>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.reportButton]} onPress={onReports}>
          <Text style={{ fontSize: 20}}>📈</Text>
          <ThemedText style={styles.actionButtonText}>Reportes y{"\n"}Estadísticas</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.operatorButton]} onPress={onOperators}>
          <Text style={{ fontSize: 20}}>👨‍💼</Text>
          <ThemedText style={styles.actionButtonText}>Gestión de{"\n"}Operadores</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.settingsButton]} onPress={onSettings}>
          <Text style={{ fontSize: 20}}>⚙️</Text>
          <ThemedText style={styles.actionButtonText}>Configuración{"\n"}del Sistema</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}