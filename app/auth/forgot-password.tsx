import AuthScreenShell from "@/components/ui/AuthScreenShell";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks";
import { supabase } from "@/utils/supabase";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const disableSubmit = submitting || !email.trim();

  const handleSendReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setInlineError("Enter a valid email address.");
      return;
    }

    setInlineError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const redirectTo = Linking.createURL("auth/reset-password", {
        scheme: "growork",
      });
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo,
        },
      );

      if (error) {
        setInlineError(error.message || "Could not send reset email.");
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessage(
        "We sent a reset link to your email. Open it on this device to choose a new password.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreenShell
      title="Reset your password"
      subtitle="Enter the email linked to your account and we'll send you a secure reset link."
      footer={
        <View style={styles.footerRow}>
          <Pressable onPress={() => router.replace("/auth/login")}>
            <ThemedText style={[styles.footerLink, { color: color.text }]}>
              Back to login
            </ThemedText>
          </Pressable>
        </View>
      }
    >
      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: color.background,
              borderColor: color.border,
              color: color.text,
            },
          ]}
          placeholder="you@example.com"
          placeholderTextColor={color.mutedText}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (inlineError) setInlineError(null);
          }}
          returnKeyType="send"
          onSubmitEditing={handleSendReset}
        />
      </View>

      {inlineError ? (
        <ThemedText style={styles.inlineError}>{inlineError}</ThemedText>
      ) : null}
      {message ? (
        <ThemedText style={[styles.message, { color: color.mutedText }]}>
          {message}
        </ThemedText>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: color.text },
          disableSubmit && styles.primaryButtonDisabled,
          pressed && !disableSubmit && styles.primaryButtonPressed,
        ]}
        onPress={handleSendReset}
        disabled={disableSubmit}
      >
        <ThemedText
          style={[styles.primaryButtonText, { color: color.background }]}
        >
          {submitting ? "Sending..." : "Send poop reset link"}
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
  inlineError: {
    fontSize: 13,
    color: "#e53935",
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
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
