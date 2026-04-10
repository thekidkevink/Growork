import AuthScreenShell from "@/components/ui/AuthScreenShell";
import { ThemedText } from "@/components/ThemedText";
import { useFlashToast } from "@/components/ui/Flash";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks";
import {
  buildSignupFlow,
  signupRoutes,
} from "@/src/features/auth/services/signupFlow";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function EmailStep() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const toast = useFlashToast();
  const router = useRouter();
  const flow = buildSignupFlow();
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];
  const disableSubmit = !email.trim() || !password.trim();

  const handleNext = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setInlineError("Enter both your email and password.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Missing fields",
        message: "Please enter both email and password.",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setInlineError("Enter a valid email address.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Invalid email",
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (password.trim().length < 6) {
      setInlineError("Use at least 6 characters for your password.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Password too short",
        message: "Use at least 6 characters for your password.",
      });
      return;
    }

    setInlineError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: flow.steps[1].route,
      params: { email: normalizedEmail, password },
    });
  };

  return (
    <AuthScreenShell
      title="Create your account"
      subtitle="Start with your email and password. We'll ask for your basic profile details next."
      headerContent={
        <Pressable
          style={[styles.backButton, { borderColor: color.border, backgroundColor: color.background }]}
          onPress={() => router.replace("/auth")}
        >
          <Ionicons name="arrow-back" size={18} color={color.text} />
        </Pressable>
      }
      footer={
        <View style={styles.footerRow}>
          <ThemedText style={styles.footerText}>Already have an account?</ThemedText>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace(signupRoutes.login);
            }}
          >
            <ThemedText style={[styles.footerLink, { color: color.text }]}>Log in instead</ThemedText>
          </Pressable>
        </View>
      }
    >
      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Email *</ThemedText>
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
          returnKeyType="next"
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Password *</ThemedText>
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
            returnKeyType="done"
            onSubmitEditing={handleNext}
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

      {inlineError ? (
        <ThemedText style={styles.inlineError}>{inlineError}</ThemedText>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: color.text },
          disableSubmit && styles.primaryButtonDisabled,
          pressed && styles.primaryButtonPressed,
        ]}
        onPress={handleNext}
        disabled={disableSubmit}
      >
        <ThemedText style={[styles.primaryButtonText, { color: color.background }]}>
          Continue
        </ThemedText>
      </Pressable>

      <ThemedText style={[styles.supportText, { color: color.mutedText }]}>
        Every public signup starts as a normal user account. Company tools can be unlocked later.
      </ThemedText>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
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
    backgroundColor: "#fff",
    borderColor: "#ddd",
    color: "#000",
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
    marginTop: -2,
  },
  primaryButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#525252",
  },
  primaryButtonPressed: {
    opacity: 0.86,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#ffffff",
  },
  supportText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#6e6e6e",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: "#6e6e6e",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});

