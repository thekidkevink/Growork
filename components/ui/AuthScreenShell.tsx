import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks";
import React from "react";
import { StyleSheet, View } from "react-native";
import ScreenContainer from "../ScreenContainer";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

interface AuthScreenShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthScreenShell({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenShellProps) {
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 20,
  },
  hero: {
    gap: 10,
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
