import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/ui/useThemeColor";

interface CompanyContactProps {
  website?: string | null;
  hasPhone: boolean;
  onWebsitePress?: () => void;
  onPhonePress?: () => void;
}

export const CompanyContact: React.FC<CompanyContactProps> = ({
  website,
  hasPhone,
  onWebsitePress,
  onPhonePress,
}) => {
  const tintColor = useThemeColor({}, "tint");

  if (!website && !hasPhone) {
    return null;
  }

  return (
    <ThemedView style={styles.contactSection}>
      <View style={styles.contactRow}>
        {website && (
          <TouchableOpacity style={styles.contactLink} onPress={onWebsitePress}>
            <Feather name="globe" size={16} color={tintColor} />
            <ThemedText style={[styles.linkText, { color: tintColor }]}>
              Website
            </ThemedText>
          </TouchableOpacity>
        )}
        {hasPhone && (
          <TouchableOpacity style={styles.contactLink} onPress={onPhonePress}>
            <Feather name="phone" size={16} color={tintColor} />
            <ThemedText style={[styles.linkText, { color: tintColor }]}>
              Contact
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  contactSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactRow: {
    flexDirection: "row",
    gap: 24,
  },
  contactLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
