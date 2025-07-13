import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { ThemedView } from "../common/ThemedView";
import { ThemedText } from "../common/ThemedText";
import { operatorStyles as styles } from "../../styles/OperatorScreen.styles";

export default function OperatorActiveVehicles({
  vehicles = [],
  onExit = () => {},
}: {
  vehicles?: any[];
  onExit?: (plateNumber: string) => void;
}) {
  return (
    <ThemedView style={styles.vehiclesContainer}>
      <ThemedView style={styles.vehiclesHeader}>
        <ThemedText style={styles.sectionTitle}>
          Vehículos Activos ({vehicles.length})
        </ThemedText>
      </ThemedView>
      <ScrollView>
        {vehicles.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Text style={{ fontSize: 30 }}>🚗</Text>
            <ThemedText style={styles.emptyText}>No hay vehículos activos</ThemedText>
          </ThemedView>
        ) : (
          vehicles.map((vehicle) => (
            <ThemedView key={vehicle.id} style={styles.vehicleCard}>
              <ThemedView style={styles.vehicleInfo}>
                <ThemedView style={styles.plateContainer}>
                  <ThemedText style={styles.plateNumber}>{vehicle.plateNumber}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.vehicleDetails}>
                  <ThemedText style={styles.vehicleTime}>{vehicle.entryTime}</ThemedText>
                  <ThemedText style={styles.vehicleDuration}>{vehicle.duration}</ThemedText>
                </ThemedView>
              </ThemedView>
              <TouchableOpacity style={styles.exitVehicleButton} onPress={() => onExit(vehicle.plateNumber)}>
                <Text style={{ fontSize: 10 }}> ❌ </Text>
              </TouchableOpacity>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}