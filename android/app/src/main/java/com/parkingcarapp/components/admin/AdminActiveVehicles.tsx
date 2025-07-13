import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { ThemedView } from "../common/ThemedView";
import { ThemedText } from "../common/ThemedText";
import { adminStyles as styles } from "../../styles/AdminScreen.styles";

export default function AdminActiveVehicles({
  vehicles = [],
  onViewDetails = () => {},
}: {
  vehicles?: any[];
  onViewDetails?: (vehicle: any) => void;
}) {
  return (
    <ThemedView style={styles.vehiclesContainer}>
      <ThemedView style={styles.vehiclesHeader}>
        <ThemedText style={styles.sectionTitle}>
          Vehículos Activos ({vehicles.length})
        </ThemedText>
      </ThemedView>
      <ScrollView style={{ maxHeight: 300 }}>
        {vehicles.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Text style={{ fontSize: 30}}>🚗</Text>
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
              <TouchableOpacity 
                style={{ padding: 8 }} 
                onPress={() => onViewDetails(vehicle)}
              >
              </TouchableOpacity>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}