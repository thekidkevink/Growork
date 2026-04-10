import AuthScreenShell from "@/components/ui/AuthScreenShell";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks";
import { signupRoutes } from "@/src/features/auth/services/signupFlow";
import { useAuth } from "@/app/_layout";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function SuccessScreen() {
  const params = useLocalSearchParams<{
    email?: string;
    firstName?: string;
  }>();
  const router = useRouter();
  const firstName = Array.isArray(params.firstName)
    ? params.firstName[0]
    : params.firstName;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const displayName = firstName || "there";
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];
  const { session } = useAuth();
  const canContinueToApp = Boolean(session?.user);

  return (
    <AuthScreenShell
      title={`Welcome, ${displayName}`}
      subtitle="Your account has been created successfully. Continue to grow with us."
      footer={
        <View style={styles.footerRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace(signupRoutes.email);
            }}
          >
            <ThemedText style={[styles.footerLink, { color: color.text }]}>Start over</ThemedText>
          </Pressable>
          <ThemedText style={styles.footerText}>or</ThemedText>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace("/(tabs)");
            }}
          >
            <ThemedText style={[styles.footerLink, { color: color.text }]}>
              Go to app
            </ThemedText>
          </Pressable>
        </View>
      }
    >
      <View
        style={[
          styles.badge,
          { backgroundColor: color.backgroundTertiary, borderColor: color.border },
        ]}
      >
        <ThemedText style={[styles.badgeText, { color: color.text }]}>Account ready</ThemedText>
      </View>

      <ThemedText style={[styles.body, { color: color.mutedText }]}>
        {email
          ? `Your account for ${email} is ready. Explore jobs, save posts, and continue setting up your profile from inside the app.`
          : "Your account is ready. Explore jobs, save posts, and continue setting up your profile from inside the app."}
      </ThemedText>

      <View
        style={[
          styles.highlights,
          {
            borderColor: color.border,
            backgroundColor: color.backgroundTertiary,
          },
        ]}
      >
        <ThemedText style={styles.highlightTitle}>What you can do next</ThemedText>
        <ThemedText style={[styles.highlightItem, { color: color.mutedText }]}>
          Browse jobs and updates from Home
        </ThemedText>
        <ThemedText style={[styles.highlightItem, { color: color.mutedText }]}>
          Save posts and track applications
        </ThemedText>
        <ThemedText style={[styles.highlightItem, { color: color.mutedText }]}>
          Complete your profile when you're ready
        </ThemedText>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: color.text },
          pressed && styles.primaryButtonPressed,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.replace("/(tabs)");
        }}
      >
        <ThemedText style={[styles.primaryButtonText, { color: color.background }]}>
          Continue to grow with us
        </ThemedText>
      </Pressable>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4B5563",
  },
  highlights: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  highlightItem: {
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#525252",
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

