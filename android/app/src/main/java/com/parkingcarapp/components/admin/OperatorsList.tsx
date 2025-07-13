import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { ThemedView } from "../common/ThemedView";
import { ThemedText } from "../common/ThemedText";
import { adminSharedStyles as styles } from "../../styles/AdminShared.styles";

type Operator = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  isActive: boolean;
  lastLogin?: string;
  totalVehiclesProcessed: number;
  totalEarnings: number;
};

type OperatorsListProps = {
  operators: Operator[];
  onEdit: (operator: Operator) => void;
  onToggleStatus: (operatorId: string) => void;
  onViewStats: (operator: Operator) => void;
};

export default function OperatorsList({
  operators,
  onEdit,
  onToggleStatus,
  onViewStats
}: OperatorsListProps) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.sectionTitle}>
        Lista de Operadores ({operators.length})
      </ThemedText>

      {operators.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No hay operadores registrados
          </ThemedText>
        </ThemedView>
      ) : (
        <ScrollView style={{ maxHeight: 500 }}>
          {operators.map((operator) => (
            <ThemedView key={operator.id} style={styles.listItem}>
              <ThemedView style={styles.listItemContent}>
                <ThemedText style={styles.listItemTitle}>
                  {operator.name}
                  {!operator.isActive && (
                    <ThemedText style={{ color: "#FF6B35", fontSize: 12 }}> (Inactivo)</ThemedText>
                  )}
                </ThemedText>
                
                {operator.phone && (
                  <ThemedText style={styles.listItemSubtitle}>
                    Teléfono: {operator.phone}
                  </ThemedText>
                )}
                <ThemedText style={styles.listItemSubtitle}>
                  Vehículos procesados: {operator.totalVehiclesProcessed || 0} 
                </ThemedText>
                
              </ThemedView>

              <ThemedView style={styles.listItemActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onViewStats(operator)}
                  disabled={false}
                >
                  <Text style={{ fontSize: 12}}> 📈</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(operator)}
                >
                  <Text style={{ fontSize: 12 }}> ✏️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onToggleStatus(operator.id)}
                >
                  <Text style={{ fontSize: 12 }}>
                    {operator.isActive ? "❌" : "✅"}
                  </Text>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}