import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { ThemedView } from "../common/ThemedView";
import { ThemedText } from "../common/ThemedText";
import { adminSharedStyles as styles } from "../../styles/AdminShared.styles";

type AdminScreenHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
  rightAction?: () => void;
  rightIcon?: string;
};

export default function AdminScreenHeader({ 
  title, 
  subtitle, 
  onBack, 
  rightAction, 
  rightIcon = "refresh" 
}: AdminScreenHeaderProps) {
  return (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.headerTextContainer}> 
        <ThemedText style={styles.headerTitle}>{title}</ThemedText>
        <ThemedText style={styles.headerSubtitle}>{subtitle}</ThemedText>
      </ThemedView>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={{ fontSize: 15, color: "black" }}> ❌ </Text>
        
      </TouchableOpacity>
    </ThemedView>
  );
}