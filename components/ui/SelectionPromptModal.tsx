import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks";

interface SelectionPromptOption {
  label: string;
  onPress: () => void;
}

interface SelectionPromptModalProps {
  visible: boolean;
  title: string;
  message?: string;
  options: SelectionPromptOption[];
  cancelLabel?: string;
  onCancel: () => void;
}

export default function SelectionPromptModal({
  visible,
  title,
  message,
  options,
  cancelLabel = "Cancel",
  onCancel,
}: SelectionPromptModalProps) {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "backgroundSecondary");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View
          style={[
            styles.card,
            {
              backgroundColor: cardColor,
              borderColor,
              shadowColor: textColor,
            },
          ]}
        >
          <ThemedText style={styles.title}>{title}</ThemedText>
          {message ? (
            <ThemedText style={[styles.message, { color: mutedTextColor }]}>
              {message}
            </ThemedText>
          ) : null}

          <View style={styles.options}>
            {options.map((option) => (
              <Pressable
                key={option.label}
                style={[
                  styles.optionButton,
                  { backgroundColor, borderColor },
                ]}
                onPress={option.onPress}
              >
                <ThemedText style={styles.optionText}>{option.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.cancelButton, { borderColor }]}
            onPress={onCancel}
          >
            <ThemedText style={styles.cancelText}>{cancelLabel}</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  options: {
    gap: 10,
  },
  optionButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
