import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

export default function AuthLandingScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: color.backgroundSecondary,
            borderColor: color.border,
            shadowColor: color.shadow,
          },
        ]}
      >
        <View style={[styles.logoWrap, { backgroundColor: color.text }]}>
          <Image source={require("@/assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.copyBlock}>
          <ThemedText style={styles.eyebrow}>Welcome to GROWORK</ThemedText>
          <ThemedText style={styles.title}>Find work, grow your network, and move faster.</ThemedText>
          <ThemedText style={[styles.subtitle, { color: color.mutedText }]}>
            Discover jobs, follow companies, save opportunities, and manage your profile from one place.
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: color.text },
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/auth/email")}
          >
            <ThemedText style={[styles.primaryButtonText, { color: color.background }]}>
              Create account
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: color.border, backgroundColor: color.background },
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/auth/login")}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: color.text }]}>
              Sign in
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    justifyContent: "center",
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 28,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 34,
    height: 34,
    tintColor: "#ffffff",
  },
  copyBlock: {
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
