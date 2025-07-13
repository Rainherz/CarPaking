import React from "react";
import { ThemedView } from "../common/ThemedView";
import { ThemedText } from "../common/ThemedText";
import { adminStyles as styles } from "../../styles/AdminScreen.styles";

type AdminHeaderProps = {
  onRefresh: () => void;
  userName: string;
};

export default function AdminHeader({ onRefresh, userName }: AdminHeaderProps) {
  return (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.headerTextContainer}>
        <ThemedText style={styles.headerTitle}>Panel de Administración</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Bienvenido {userName}</ThemedText>
      </ThemedView>
      {/* <Text style={{ fontSize: 14 }} onPress={onRefresh}>🔄</Text> */}
    </ThemedView>
  );
}