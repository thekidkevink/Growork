import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";

import ScreenContainer from "@/components/ScreenContainer";
import UniversalHeader from "@/components/ui/UniversalHeader";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks";
import { Spacing } from "@/constants/DesignSystem";

const buildViewerUrl = (sourceUrl: string) =>
  `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
    sourceUrl.trim()
  )}`;

export default function DocumentViewerScreen() {
  const params = useLocalSearchParams<{
    url?: string;
    title?: string;
    type?: string;
  }>();
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const borderColor = useThemeColor({}, "border");
  const [viewerFailed, setViewerFailed] = useState(false);

  const documentUrl = typeof params.url === "string" ? decodeURIComponent(params.url) : "";
  const documentTitle =
    typeof params.title === "string" ? decodeURIComponent(params.title) : "Document";
  const documentType =
    typeof params.type === "string" ? decodeURIComponent(params.type) : "";

  const viewerUrl = useMemo(
    () => (documentUrl ? buildViewerUrl(documentUrl) : ""),
    [documentUrl]
  );

  const handleOpenExternally = async () => {
    if (!documentUrl) {
      Alert.alert("Unavailable", "This document is not available right now.");
      return;
    }

    try {
      await Linking.openURL(documentUrl);
    } catch {
      Alert.alert("Unavailable", "We could not open this document externally.");
    }
  };

  if (!documentUrl) {
    return (
      <ScreenContainer>
        <UniversalHeader
          title="Document Viewer"
          showBackButton={true}
          showNotifications={false}
        />
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
            No document found
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
            This file is missing a valid document link.
          </ThemedText>
        </View>
      </ScreenContainer>
    );
  }

  if (viewerFailed) {
    return (
      <ScreenContainer>
        <UniversalHeader
          title={documentTitle}
          subtitle={documentType ? documentType.replace(/_/g, " ").toUpperCase() : undefined}
          showBackButton={true}
          showNotifications={false}
          rightAction={{
            text: "Open",
            onPress: handleOpenExternally,
          }}
        />
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
            We couldn&apos;t preview this document here
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
            Use Open to view it in the browser or another installed document app.
          </ThemedText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <UniversalHeader
        title={documentTitle}
        subtitle={documentType ? documentType.replace(/_/g, " ").toUpperCase() : undefined}
        showBackButton={true}
        showNotifications={false}
        rightAction={{
          text: "Open",
          onPress: handleOpenExternally,
        }}
      />
      <View style={[styles.viewerContainer, { borderTopColor: borderColor }]}>
        <WebView
          source={{ uri: viewerUrl }}
          startInLoadingState={true}
          setSupportMultipleWindows={false}
          allowsBackForwardNavigationGestures
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          onError={() => setViewerFailed(true)}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  viewerContainer: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 20,
  },
});
