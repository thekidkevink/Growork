import AuthScreenShell from "@/components/ui/AuthScreenShell";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks";
import { supabase } from "@/utils/supabase";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const disableSubmit = submitting || !password.trim() || !confirmPassword.trim();

  const handleUpdatePassword = async () => {
    if (password.trim().length < 6) {
      setInlineError("Use at least 6 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setInlineError("Passwords do not match.");
      return;
    }

    setInlineError(null);
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setInlineError(error.message || "Could not update password.");
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/auth/login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreenShell
      title="Choose a new password"
      subtitle="Set a fresh password for your account, then sign back in."
      footer={
        <View style={styles.footerRow}>
          <Pressable onPress={() => router.replace("/auth/login")}>
            <ThemedText style={[styles.footerLink, { color: color.text }]}>Back to login</ThemedText>
          </Pressable>
        </View>
      }
    >
      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>New password</ThemedText>
        <View style={styles.passwordRow}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              {
                backgroundColor: color.background,
                borderColor: color.border,
                color: color.text,
              },
            ]}
            placeholder="Use at least 6 characters"
            placeholderTextColor={color.mutedText}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (inlineError) setInlineError(null);
            }}
          />
          <Pressable
            style={[styles.passwordToggle, { borderColor: color.border }]}
            onPress={() => setShowPassword((current) => !current)}
          >
            <ThemedText style={[styles.passwordToggleText, { color: color.text }]}>
              {showPassword ? "Hide" : "Show"}
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Confirm password</ThemedText>
        <View style={styles.passwordRow}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              {
                backgroundColor: color.background,
                borderColor: color.border,
                color: color.text,
              },
            ]}
            placeholder="Repeat your new password"
            placeholderTextColor={color.mutedText}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (inlineError) setInlineError(null);
            }}
            returnKeyType="go"
            onSubmitEditing={handleUpdatePassword}
          />
          <Pressable
            style={[styles.passwordToggle, { borderColor: color.border }]}
            onPress={() => setShowConfirmPassword((current) => !current)}
          >
            <ThemedText style={[styles.passwordToggleText, { color: color.text }]}>
              {showConfirmPassword ? "Hide" : "Show"}
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {inlineError ? <ThemedText style={styles.inlineError}>{inlineError}</ThemedText> : null}

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: color.text },
          disableSubmit && styles.primaryButtonDisabled,
          pressed && !disableSubmit && styles.primaryButtonPressed,
        ]}
        onPress={handleUpdatePassword}
        disabled={disableSubmit}
      >
        <ThemedText style={[styles.primaryButtonText, { color: color.background }]}>
          {submitting ? "Updating..." : "Update password"}
        </ThemedText>
      </Pressable>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  passwordInput: {
    flex: 1,
  },
  passwordToggle: {
    minWidth: 72,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordToggleText: {
    fontSize: 13,
    fontWeight: "700",
  },
  inlineError: {
    fontSize: 13,
    color: "#e53935",
  },
  primaryButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonPressed: {
    opacity: 0.86,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
