import AuthScreenShell from "@/components/ui/AuthScreenShell";
import { ThemedText } from "@/components/ThemedText";
import { useFlashToast } from "@/components/ui/Flash";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks";
import { useAppContext } from "@/utils/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function LoginScreen() {
  const { signIn, isLoading } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const toast = useFlashToast();
  const router = useRouter();
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];
  const disableSubmit = isLoading || !email.trim() || !password.trim();

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setInlineError("Enter both your email and password.");
      toast.show({
        type: "danger",
        title: "Missing fields",
        message: "Please enter both email and password.",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setInlineError("Enter a valid email address.");
      return;
    }

    setInlineError(null);
    const { error } = await signIn(normalizedEmail, password);
    if (error) {
      setInlineError(error.message || "Check your credentials and try again.");
      toast.show({
        type: "danger",
        title: "Login failed",
        message: error.message || "Check your credentials and try again.",
      });
    }
  };

  return (
    <AuthScreenShell
      title="Sign in to GROWORK"
      subtitle="Continue to your jobs, saved content, and profile tools."
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
          <ThemedText style={styles.footerText}>
            New here?
          </ThemedText>
          <Pressable onPress={() => router.replace("/auth/email")}>
            <ThemedText style={[styles.footerLink, { color: color.text }]}>Create an account</ThemedText>
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
          returnKeyType="next"
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Password</ThemedText>
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
            placeholder="Enter your password"
            placeholderTextColor={color.mutedText}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (inlineError) setInlineError(null);
            }}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
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

      <Pressable
        style={[styles.inlineLinkRow, { borderColor: color.border }]}
        onPress={() => router.push("/auth/forgot-password")}
      >
        <ThemedText style={[styles.inlineLinkText, { color: color.text }]}>
          Forgot your password?
        </ThemedText>
      </Pressable>

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
        onPress={handleLogin}
        disabled={disableSubmit}
      >
        <ThemedText style={[styles.primaryButtonText, { color: color.background }]}>
          {isLoading ? "Signing in..." : "Sign In"}
        </ThemedText>
      </Pressable>
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
  inlineLinkRow: {
    alignSelf: "flex-end",
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  inlineLinkText: {
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
    fontWeight: "600",
    fontSize: 16,
    color: "#ffffff",
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

