import AuthScreenShell from "@/components/ui/AuthScreenShell";
import { ThemedText } from "@/components/ThemedText";
import { useFlashToast } from "@/components/ui/Flash";
import { Colors } from "@/constants/Colors";
import { useColorScheme, useThemeColor } from "@/hooks";
import {
  buildSignupResult,
  mapSignupPayload,
  signupRoutes,
} from "@/src/features/auth/services/signupFlow";
import { useAppContext } from "@/utils/AppContext";
import { supabase } from "@/utils/supabase";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

export default function UsernameStep() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email: string;
    password: string;
  }>();
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const password = Array.isArray(params.password)
    ? params.password[0]
    : params.password;
  const { isLoading, signUp } = useAppContext();
  const toast = useFlashToast();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [isUnique, setIsUnique] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | number | null>(null);
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];
  const errorColor = "#e53935";

  useEffect(() => {
    const candidate = username.trim();
    if (!candidate) {
      setIsUnique(null);
      setFormError(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    setIsUnique(null);
    setFormError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from("legacy_public_profiles")
        .select("id")
        .eq("username", candidate)
        .maybeSingle();

      setChecking(false);
      if (error) {
        setFormError("We could not check that username right now.");
        setIsUnique(null);
        return;
      }

      if (data) {
        setIsUnique(false);
        setFormError("That username is already taken.");
      } else {
        setIsUnique(true);
        setFormError(null);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  const handleNext = async () => {
    setFormError(null);
    setSignupError(null);

    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Missing account details",
        message: "Go back and enter your email and password again.",
      });
      return;
    }

    if (!username.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Missing username",
        message: "Please choose a username.",
      });
      return;
    }

    if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(username.trim())) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Invalid username",
        message: "Use 3-20 letters, numbers, dots, dashes, or underscores.",
      });
      return;
    }

    if (isUnique === false) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Username taken",
        message: "Please choose a different username.",
      });
      return;
    }

    if (!name.trim() || !surname.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Missing name",
        message: "Please enter both your first name and surname.",
      });
      return;
    }

    setSubmitting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const payload = mapSignupPayload(
        { email, password },
        {
          username,
          firstName: name,
          surname,
        }
      );

      const { error, data } = await signUp(
        payload.email,
        payload.password,
        payload.metadata.username,
        payload.metadata.name,
        payload.metadata.surname
      );

      if (error) {
        const message =
          typeof error === "object" && error && "message" in error
            ? String(error.message)
            : String(error);
        setSignupError(message);
        toast.show({
          type: "danger",
          title: "Registration failed",
          message,
        });
        return;
      }

      const userId = data?.user?.id;
      if (!userId) {
        const message = "Could not complete account setup.";
        setSignupError(message);
        toast.show({
          type: "danger",
          title: "Signup incomplete",
          message,
        });
        return;
      }

      buildSignupResult(userId);
      router.push({
        pathname: signupRoutes.success,
        params: {
          email: payload.email,
          userId,
          username: payload.metadata.username,
          firstName: payload.metadata.name,
        },
      });
    } catch (error: any) {
      const message = error?.message || "Unknown error";
      setSignupError(message);
      toast.show({
        type: "danger",
        title: "Registration error",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const disableSubmit =
    isLoading ||
    submitting ||
    checking ||
    isUnique === false ||
    !name.trim() ||
    !surname.trim() ||
    !username.trim();

  return (
    <AuthScreenShell
      title="Finish your profile"
      subtitle="Choose a username and add the name you want shown on your account."
      footer={
        <View style={styles.footerRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <ThemedText style={styles.footerLink}>Back</ThemedText>
          </Pressable>
          <ThemedText style={styles.footerText}>or</ThemedText>
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
        <ThemedText style={styles.label}>Username</ThemedText>
        <View style={styles.usernameWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: color.background,
                borderColor: formError ? errorColor : color.border,
                color: color.text,
              },
            ]}
            placeholder="Choose a username"
            placeholderTextColor={color.mutedText}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          {checking ? (
            <ActivityIndicator size="small" color={color.iconSecondary} style={styles.spinner} />
          ) : null}
        </View>
        {isUnique === false && username.trim().length > 0 ? (
          <ThemedText style={[styles.helperText, { color: errorColor }]}>
            That username is already taken.
          </ThemedText>
        ) : null}
        {isUnique === true && username.trim().length > 0 ? (
          <ThemedText style={[styles.helperText, { color: color.text }]}>
            Username is available.
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>First name</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: color.background,
              borderColor: color.border,
              color: color.text,
            },
          ]}
          placeholder="Enter your first name"
          placeholderTextColor={color.mutedText}
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Surname</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: color.background,
              borderColor: color.border,
              color: color.text,
            },
          ]}
          placeholder="Enter your surname"
          placeholderTextColor={color.mutedText}
          autoCapitalize="words"
          value={surname}
          onChangeText={setSurname}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: color.text },
          disableSubmit && styles.primaryButtonDisabled,
          pressed && !disableSubmit && styles.primaryButtonPressed,
        ]}
        onPress={handleNext}
        disabled={disableSubmit}
      >
        <ThemedText style={[styles.primaryButtonText, { color: color.background }]}>
          {submitting || isLoading ? "Creating account..." : "Create Account"}
        </ThemedText>
      </Pressable>

      {signupError ? (
        <ThemedText style={styles.signupError}>{signupError}</ThemedText>
      ) : null}

      <ThemedText style={[styles.supportText, { color: color.mutedText }]}>
        Business tools can be unlocked later when you create or manage a company.
      </ThemedText>
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
  usernameWrapper: {
    width: "100%",
    position: "relative",
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
  spinner: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -10,
  },
  helperText: {
    width: "100%",
    marginTop: -4,
    marginBottom: 2,
  },
  signupError: {
    color: "#e53935",
    textAlign: "center",
  },
  supportText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#6e6e6e",
  },
  primaryButton: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#525252",
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

