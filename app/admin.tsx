import React from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import ScreenContainer from "@/components/ScreenContainer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useBusinessRequests, useCompanies, usePermissions, useThemeColor } from "@/hooks";

export default function AdminScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { isAdmin } = usePermissions();
  const { companyLimit, companies } = useCompanies();
  const { requests, fetchRequests, loading } = useBusinessRequests();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const tintColor = useThemeColor({}, "tint");

  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const approvedCount = requests.filter((request) => request.status === "approved").length;
  const rejectedCount = requests.filter((request) => request.status === "rejected").length;

  if (!isAdmin) {
    return (
      <ScreenContainer>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />
        <View style={styles.centerState}>
          <Feather name="shield-off" size={36} color={mutedTextColor} />
          <ThemedText style={styles.emptyTitle}>Admin access required</ThemedText>
          <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
            This area is only available to admin accounts.
          </ThemedText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Admin</ThemedText>
        <View style={styles.headerSpacer} />
      </ThemedView>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              void fetchRequests();
            }}
            tintColor={tintColor}
            colors={[tintColor]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ThemedView
          style={[
            styles.summaryCard,
            { borderColor, backgroundColor: backgroundSecondary },
          ]}
        >
          <ThemedText style={styles.sectionTitle}>Admin Workspace</ThemedText>
          <ThemedText style={[styles.summaryText, { color: mutedTextColor }]}>
            Review business account requests and seed the app with up to {companyLimit} managed companies for launch content.
          </ThemedText>
          <ThemedText style={[styles.summaryText, { color: mutedTextColor }]}>
            Current managed companies: {companies.length}
          </ThemedText>
          <TouchableOpacity
            style={[styles.primaryAction, { borderColor }]}
            onPress={() => router.push("/profile/CompanyManagement")}
          >
            <Feather name="plus" size={16} color={tintColor} />
            <ThemedText style={[styles.primaryActionText, { color: tintColor }]}>
              Create Company
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Request Queues</ThemedText>
          <ThemedText style={[styles.sectionCount, { color: mutedTextColor }]}>
            {requests.length}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.queueCard, { borderColor, backgroundColor: backgroundSecondary }]}
          onPress={() => router.push("/admin/pending-requests")}
        >
          <View style={styles.queueHeader}>
            <View style={[styles.queueIconWrap, { backgroundColor: `${tintColor}18` }]}>
              <Feather name="clock" size={18} color={tintColor} />
            </View>
            <View style={styles.queueBody}>
              <ThemedText style={styles.queueTitle}>Pending Requests</ThemedText>
              <ThemedText style={[styles.queueText, { color: mutedTextColor }]}>
                New business applications waiting for review.
              </ThemedText>
            </View>
            <View style={[styles.queueCountPill, { backgroundColor: `${tintColor}18` }]}>
              <ThemedText style={[styles.queueCountText, { color: tintColor }]}>
                {pendingCount}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.queueCard, { borderColor, backgroundColor: backgroundSecondary }]}
          onPress={() => router.push("/admin/approved-requests")}
        >
          <View style={styles.queueHeader}>
            <View style={[styles.queueIconWrap, { backgroundColor: "#10b98118" }]}>
              <Feather name="check-circle" size={18} color="#10b981" />
            </View>
            <View style={styles.queueBody}>
              <ThemedText style={styles.queueTitle}>Approved Requests</ThemedText>
              <ThemedText style={[styles.queueText, { color: mutedTextColor }]}>
                Review accounts that have already been granted business access.
              </ThemedText>
            </View>
            <View style={[styles.queueCountPill, { backgroundColor: "#10b98118" }]}>
              <ThemedText style={[styles.queueCountText, { color: "#10b981" }]}>
                {approvedCount}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.queueCard, { borderColor, backgroundColor: backgroundSecondary }]}
          onPress={() => router.push("/admin/rejected-requests")}
        >
          <View style={styles.queueHeader}>
            <View style={[styles.queueIconWrap, { backgroundColor: "#ef444418" }]}>
              <Feather name="x-circle" size={18} color="#ef4444" />
            </View>
            <View style={styles.queueBody}>
              <ThemedText style={styles.queueTitle}>Rejected Requests</ThemedText>
              <ThemedText style={[styles.queueText, { color: mutedTextColor }]}>
                See declined applications and the reasons shared with users.
              </ThemedText>
            </View>
            <View style={[styles.queueCountPill, { backgroundColor: "#ef444418" }]}>
              <ThemedText style={[styles.queueCountText, { color: "#ef4444" }]}>
                {rejectedCount}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
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
    gap: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryAction: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  queueCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  queueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  queueIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  queueBody: {
    flex: 1,
    gap: 4,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  queueText: {
    fontSize: 13,
    lineHeight: 18,
  },
  queueCountPill: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  queueCountText: {
    fontSize: 13,
    fontWeight: "700",
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
