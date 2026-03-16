import ScreenContainer from "@/components/ScreenContainer";
import { ThemedText } from "@/components/ThemedText";
import { useAuth, useThemeColor } from "@/hooks";
import MyPostsList from "@/components/profile/MyPostsList";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function ListingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.push("/(tabs)/profile");
          }}
        >
          <Feather name="arrow-left" size={18} color={textColor} />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </Pressable>
        <ThemedText style={styles.title}>Manage Listings</ThemedText>
        <ThemedText style={[styles.subtitle, { color: mutedTextColor }]}>
          Review your live posts, pause openings, and jump straight into applicants.
        </ThemedText>
      </View>

      {user ? (
        <MyPostsList />
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Sign in to manage listings</ThemedText>
          <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
            Your business posts and applicants will appear here once you are signed in.
          </ThemedText>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 6,
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
