import React from "react";
import { ThemedView } from "../common/ThemedView";
import { ThemedText } from "../common/ThemedText";
import { operatorStyles as styles } from "../../styles/OperatorScreen.styles";

type OperatorHeaderProps = {
  onRefresh: () => void;
};

export default function OperatorHeader({ onRefresh }: OperatorHeaderProps) {
  return (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.headerTextContainer}>
        <ThemedText style={styles.headerTitle}>AutoParking Control</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Sistema de Control de Estacionamiento</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}