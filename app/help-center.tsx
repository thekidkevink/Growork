import ScreenContainer from "@/components/ScreenContainer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const SUPPORT_EMAIL = "support@growork.app";

const HELP_TOPICS = [
  {
    id: "account",
    question: "How do I update my profile details?",
    answer:
      "Open Profile, tap Edit Profile, then update your personal information, contact details, and profile photo.",
  },
  {
    id: "documents",
    question: "How do I upload or manage my documents?",
    answer:
      "Go to Profile, open Documents, then upload, rename, re-categorize, or delete your CV, cover letters, qualifications, national ID, driver's licence, and other documents.",
  },
  {
    id: "applications",
    question: "Where can I track my job applications?",
    answer:
      "Open the Jobs & Applications tab to review your submitted applications, check statuses, and withdraw an application when needed.",
  },
  {
    id: "business",
    question: "How do business tools work?",
    answer:
      "Business features are only available after business access is enabled for your account. Once active, extra publishing and applicant-management options appear across the app.",
  },
  {
    id: "notifications",
    question: "Why am I not receiving notifications?",
    answer:
      "Check your device notification permissions first, then open Settings in the app to confirm your notification preferences are still enabled.",
  },
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const borderColor = useThemeColor({}, "border");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const tintColor = useThemeColor({}, "tint");
  const [expandedId, setExpandedId] = React.useState<string | null>(
    HELP_TOPICS[0]?.id ?? null
  );

  const handleContactSupport = React.useCallback(async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      "GROWORK Support"
    )}`;
    await Linking.openURL(url);
  }, []);

  return (
    <ScreenContainer>
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Help Center</ThemedText>
        <View style={styles.headerSpacer} />
      </ThemedView>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <ThemedText style={styles.title}>Support and common questions</ThemedText>
          <ThemedText style={[styles.subtitle, { color: mutedTextColor }]}>
            Start with the answers below. If you still need help, you can contact
            our team directly.
          </ThemedText>
        </View>

        <View style={styles.topicList}>
          {HELP_TOPICS.map((topic) => {
            const expanded = expandedId === topic.id;

            return (
              <TouchableOpacity
                key={topic.id}
                activeOpacity={0.9}
                style={[
                  styles.topicCard,
                  { borderColor, backgroundColor: backgroundSecondary },
                ]}
                onPress={() => setExpandedId(expanded ? null : topic.id)}
              >
                <View style={styles.topicHeader}>
                  <ThemedText style={styles.topicQuestion}>
                    {topic.question}
                  </ThemedText>
                  <Feather
                    name={expanded ? "minus" : "plus"}
                    size={18}
                    color={tintColor}
                  />
                </View>
                {expanded ? (
                  <ThemedText
                    style={[styles.topicAnswer, { color: mutedTextColor }]}
                  >
                    {topic.answer}
                  </ThemedText>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <ThemedView
          style={[
            styles.supportCard,
            { borderColor, backgroundColor: backgroundSecondary },
          ]}
        >
          <View style={styles.supportHeader}>
            <Feather name="life-buoy" size={18} color={tintColor} />
            <ThemedText style={styles.supportTitle}>Still need help?</ThemedText>
          </View>
          <ThemedText style={[styles.supportText, { color: mutedTextColor }]}>
            Contact our support team at {SUPPORT_EMAIL} and include screenshots or
            the steps that led to the issue if possible.
          </ThemedText>
          <TouchableOpacity
            style={[styles.contactButton, { borderColor }]}
            onPress={() => {
              void handleContactSupport();
            }}
          >
            <Feather name="mail" size={16} color={tintColor} />
            <ThemedText style={[styles.contactButtonText, { color: tintColor }]}>
              Contact Support
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 18,
    paddingBottom: 32,
  },
  hero: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  topicList: {
    gap: 12,
  },
  topicCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  topicQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  topicAnswer: {
    fontSize: 14,
    lineHeight: 21,
  },
  supportCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  supportHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  supportText: {
    fontSize: 14,
    lineHeight: 21,
  },
  contactButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
