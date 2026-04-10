import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";
import ScreenContainer from "../ScreenContainer";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

interface AuthScreenShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerContent?: React.ReactNode;
  scrollViewProps?: ScrollViewProps;
}

export default function AuthScreenShell({
  title,
  subtitle,
  children,
  footer,
  headerContent,
  scrollViewProps,
}: AuthScreenShellProps) {
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          {...scrollViewProps}
        >
          <ThemedView style={styles.container}>
            {headerContent ? <View style={styles.headerContent}>{headerContent}</View> : null}
            <View style={styles.hero}>
              <ThemedText style={styles.title}>{title}</ThemedText>
              <ThemedText style={[styles.subtitle, { color: color.mutedText }]}>
                {subtitle}
              </ThemedText>
            </View>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: color.backgroundSecondary,
                  borderColor: color.border,
                  shadowColor: color.shadow,
                },
              ]}
            >
              {children}
            </View>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 28,
    gap: 20,
  },
  hero: {
    gap: 10,
  },
  headerContent: {
    alignItems: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 420,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 14,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  footer: {
    gap: 12,
  },
});
