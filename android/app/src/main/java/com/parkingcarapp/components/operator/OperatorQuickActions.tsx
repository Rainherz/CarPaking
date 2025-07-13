import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ThemedView } from "../common/ThemedView";
import { ThemedText } from "../common/ThemedText";
import { operatorStyles as styles } from "../../styles/OperatorScreen.styles";

export default function OperatorQuickActions({ onEntry, onExit }: { onEntry: () => void; onExit: () => void }) {
  return (
    <ThemedView style={styles.actionsContainer}>
      <ThemedText style={styles.sectionTitle}>Acciones Rápidas</ThemedText>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.entryButton]} onPress={onEntry}>
          <Text style={{ fontSize: 20 }}>➕</Text>
          <ThemedText style={styles.actionButtonText}>Registrar{"\n"}Entrada</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.exitButton]} onPress={onExit}>
          <Text style={{ fontSize: 20 }}>➖</Text>
          <ThemedText style={styles.actionButtonText}>Procesar{"\n"}Salida</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}