import ScreenContainer from "@/components/ScreenContainer";
import { ThemedText } from "@/components/ThemedText";
import { useAuth, useThemeColor } from "@/hooks";
import MyPostsList from "@/components/profile/MyPostsList";
import { useBottomSheetManager } from "@/components/content/BottomSheetManager";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function PublishingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const borderColor = useThemeColor({}, "border");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const tintColor = useThemeColor({}, "tint");
  const accentContrast = useThemeColor({}, "accentContrast");
  const { openCreatePostSheet } = useBottomSheetManager();

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
            router.push("/(tabs)/applications");
          }}
        >
          <Feather name="arrow-left" size={18} color={textColor} />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </Pressable>
        <ThemedText style={styles.title}>Publishing</ThemedText>
        <ThemedText style={[styles.subtitle, { color: mutedTextColor }]}>
          Create new job posts, keep current listings active, and manage your publishing flow from one place.
        </ThemedText>
      </View>

      {user ? (
        <>
          <View
            style={[
              styles.heroCard,
              { borderColor, backgroundColor: backgroundSecondary },
            ]}
          >
            <View style={styles.heroText}>
              <ThemedText style={styles.heroTitle}>Create a new listing</ThemedText>
              <ThemedText style={[styles.heroSubtitle, { color: mutedTextColor }]}>
                Open the publishing composer to share a job opportunity or company update.
              </ThemedText>
            </View>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: tintColor }]}
              onPress={() => openCreatePostSheet()}
            >
              <Feather name="plus" size={16} color={accentContrast} />
              <ThemedText style={[styles.primaryButtonText, { color: accentContrast }]}>
                Create Post
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Your published content</ThemedText>
            <ThemedText style={[styles.sectionSubtitle, { color: mutedTextColor }]}>
              Review, pause, or remove posts you have already published.
            </ThemedText>
          </View>

          <MyPostsList />
        </>
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Sign in to start publishing</ThemedText>
          <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
            Your publishing tools and current listings will appear here once you are signed in.
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
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 16,
  },
  heroText: {
    gap: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
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
