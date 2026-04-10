import AuthScreenShell from "@/components/ui/AuthScreenShell";
import DatePickerField from "@/components/ui/DatePickerField";
import { ThemedText } from "@/components/ThemedText";
import { useFlashToast } from "@/components/ui/Flash";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks";
import {
  buildSignupResult,
  mapSignupPayload,
  signupRoutes,
} from "@/src/features/auth/services/signupFlow";
import { useAppContext } from "@/utils/AppContext";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

const DOB_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOfBirth(value: string) {
  if (!DOB_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return false;
  }

  return date <= new Date();
}

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
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];

  const disableSubmit = useMemo(
    () =>
      isLoading ||
      submitting ||
      !name.trim() ||
      !surname.trim() ||
      !dateOfBirth.trim() ||
      !contactNumber.trim(),
    [contactNumber, dateOfBirth, isLoading, name, submitting, surname]
  );

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

    if (!name.trim() || !surname.trim() || !dateOfBirth.trim() || !contactNumber.trim()) {
      const message = "Please complete all required fields.";
      setFormError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Missing details",
        message,
      });
      return;
    }

    if (!isValidDateOfBirth(dateOfBirth.trim())) {
      const message = "Enter Date Of Birth in YYYY-MM-DD format.";
      setFormError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Invalid date of birth",
        message,
      });
      return;
    }

    const normalizedPhone = contactNumber.trim();
    const digitsOnly = normalizedPhone.replace(/\D/g, "");
    if (digitsOnly.length < 7) {
      const message = "Enter a valid contact number.";
      setFormError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        type: "danger",
        title: "Invalid contact number",
        message,
      });
      return;
    }

    setSubmitting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const payload = mapSignupPayload(
        { email, password },
        {
          firstName: name,
          surname,
          dateOfBirth,
          contactNumber: normalizedPhone,
        }
      );

      const { error, data } = await signUp(
        payload.email,
        payload.password,
        payload.metadata.name,
        payload.metadata.surname,
        payload.metadata.date_of_birth,
        payload.metadata.phone
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

  return (
    <AuthScreenShell
      title="Finish your profile"
      subtitle="Add your required personal details to complete account setup."
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
            <ThemedText style={[styles.footerLink, { color: color.text }]}>
              Log in instead
            </ThemedText>
          </Pressable>
        </View>
      }
    >
      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Name *</ThemedText>
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
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (formError) setFormError(null);
          }}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Surname *</ThemedText>
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
          value={surname}
          onChangeText={(value) => {
            setSurname(value);
            if (formError) setFormError(null);
          }}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Date Of Birth *</ThemedText>
        <DatePickerField
          value={dateOfBirth}
          onChange={(value) => {
            setDateOfBirth(value);
            if (formError) setFormError(null);
          }}
          placeholder="Select your date of birth"
          maximumDate={new Date()}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Contact Number *</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: color.background,
              borderColor: color.border,
              color: color.text,
            },
          ]}
          placeholder="Enter your contact number"
          placeholderTextColor={color.mutedText}
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={(value) => {
            setContactNumber(value);
            if (formError) setFormError(null);
          }}
        />
      </View>

      {formError ? (
        <ThemedText style={styles.inlineError}>{formError}</ThemedText>
      ) : null}

      {signupError ? (
        <ThemedText style={styles.inlineError}>{signupError}</ThemedText>
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
        {submitting ? (
          <ActivityIndicator color={color.background} />
        ) : (
          <ThemedText
            style={[styles.primaryButtonText, { color: color.background }]}
          >
            Create account
          </ThemedText>
        )}
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
    backgroundColor: "#fff",
    borderColor: "#ddd",
    color: "#000",
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
