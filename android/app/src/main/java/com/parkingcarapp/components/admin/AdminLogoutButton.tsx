import React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function AdminLogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <TouchableOpacity
      style={{ position: "absolute", top: 30, right: 20 }}
      onPress={onLogout}
    >
      <Text style={{ fontSize: 16, color: "#FF6B35" }}>❌</Text>
    </TouchableOpacity>
  );
}