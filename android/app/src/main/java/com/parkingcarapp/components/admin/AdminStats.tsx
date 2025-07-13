import React from "react";
import { ThemedView } from "../common/ThemedView";
import { ThemedText } from "../common/ThemedText";
import { adminStyles as styles } from "../../styles/AdminScreen.styles.ts";
import { Text } from "react-native";

export default function AdminStats({ dailySummary }: { dailySummary: any }) {
  return (
    <ThemedView style={styles.statsContainer}>
      <ThemedText style={styles.sectionTitle}>Resumen del Día</ThemedText>
      <ThemedView style={styles.statsGrid}>
        <ThemedView style={styles.statCard}>
          <Text style={{ fontSize: 20 }}>🚘</Text>
          <ThemedText style={styles.statNumber}>{dailySummary.vehiclesParked}</ThemedText>
          <ThemedText style={styles.statLabel}>Vehículos Activos</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <Text style={{ fontSize: 20 }}>⬇️</Text>
          <ThemedText style={styles.statNumber}>{dailySummary.totalVehicles}</ThemedText>
          <ThemedText style={styles.statLabel}>Entradas Total</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <Text style={{ fontSize: 20 }}>💰</Text>
          <ThemedText style={styles.statNumber}>S/ {dailySummary.totalEarnings?.toFixed(2)}</ThemedText>
          <ThemedText style={styles.statLabel}>Ingresos del Día</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <Text style={{ fontSize: 20 }}>⏰</Text>
          <ThemedText style={styles.statNumber}>{dailySummary.averageStay}</ThemedText>
          <ThemedText style={styles.statLabel}>Tiempo Promedio</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}