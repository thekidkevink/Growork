import React from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import ScreenContainer from "@/components/ScreenContainer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useBusinessRequests, usePermissions, useThemeColor } from "@/hooks";
import { BusinessRequestStatus } from "@/types";
import { useFlashToast } from "@/components/ui/Flash";

type Props = {
  status: BusinessRequestStatus;
};

export default function BusinessRequestsQueueScreen({ status }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { isAdmin } = usePermissions();
  const { requests, reviewRequest, fetchRequests, loading, submitting } =
    useBusinessRequests();
  const toast = useFlashToast();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const tintColor = useThemeColor({}, "tint");

  const [pendingRejectRequestId, setPendingRejectRequestId] = React.useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  useFocusEffect(
    React.useCallback(() => {
      void fetchRequests(status);
    }, [fetchRequests, status])
  );

  const filteredRequests = React.useMemo(() => {
    const scoped = requests.filter((request) => request.status === status);
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return scoped;
    }

    return scoped.filter((request) =>
      [
        request.full_name,
        request.company_name,
        request.email,
        request.phone,
        request.profession,
        request.industry,
        request.location,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [requests, searchQuery, status]);

  const handleReview = async (
    requestId: string,
    reviewStatus: "approved" | "rejected"
  ) => {
    const adminNotes =
      reviewStatus === "rejected"
        ? rejectionReason.trim() || "No reason provided."
        : undefined;

    const { error } = await reviewRequest(requestId, reviewStatus, adminNotes);
    if (error) {
      toast.show({
        type: "danger",
        title: "Review failed",
        message: error,
      });
      return;
    }

    toast.show({
      type: "success",
      title: reviewStatus === "approved" ? "Request approved" : "Request rejected",
      message:
        reviewStatus === "approved"
          ? "The user can now access business tools."
          : "The request has been rejected.",
    });

    setPendingRejectRequestId(null);
    setRejectionReason("");
    void fetchRequests(status);
  };

  const headerTitle =
    status === "pending"
      ? "Pending Requests"
      : status === "approved"
      ? "Approved Requests"
      : "Rejected Requests";

  const emptyMessage =
    status === "pending"
      ? "New business account applications will appear here for review."
      : status === "approved"
      ? "Approved business requests will appear here."
      : "Rejected business requests will appear here.";

  const chipColor =
    status === "pending" ? tintColor : status === "approved" ? "#10b981" : "#ef4444";
  const chipBackground =
    status === "pending"
      ? `${tintColor}18`
      : status === "approved"
      ? "#10b98118"
      : "#ef444418";

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
        <ThemedText style={styles.headerTitle}>{headerTitle}</ThemedText>
        <View style={styles.headerSpacer} />
      </ThemedView>

      <Modal
        visible={!!pendingRejectRequestId}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPendingRejectRequestId(null);
          setRejectionReason("");
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setPendingRejectRequestId(null);
              setRejectionReason("");
            }}
          />
          <View
            style={[
              styles.modalCard,
              { borderColor, backgroundColor: backgroundSecondary },
            ]}
          >
            <ThemedText style={styles.modalTitle}>Reject Request</ThemedText>
            <ThemedText style={[styles.modalText, { color: mutedTextColor }]}>
              Add a reason so the applicant understands why the business request was rejected.
            </ThemedText>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Explain why the request was not approved"
              placeholderTextColor={mutedTextColor}
              multiline
              numberOfLines={4}
              style={[
                styles.reasonInput,
                {
                  color: textColor,
                  borderColor,
                  backgroundColor: "transparent",
                },
              ]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.secondaryAction, { borderColor }]}
                onPress={() => {
                  setPendingRejectRequestId(null);
                  setRejectionReason("");
                }}
              >
                <ThemedText style={[styles.secondaryActionText, { color: textColor }]}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryActionSolid, { backgroundColor: tintColor }]}
                onPress={() => {
                  if (pendingRejectRequestId) {
                    void handleReview(pendingRejectRequestId, "rejected");
                  }
                }}
                disabled={submitting}
              >
                <ThemedText style={styles.primaryActionSolidText}>Reject</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.searchWrap}>
        <View
          style={[
            styles.searchInputWrap,
            { borderColor, backgroundColor: backgroundSecondary },
          ]}
        >
          <Feather name="search" size={18} color={mutedTextColor} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, company, email, phone..."
            placeholderTextColor={mutedTextColor}
            style={[styles.searchInput, { color: textColor }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color={mutedTextColor} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              void fetchRequests(status);
            }}
            tintColor={tintColor}
            colors={[tintColor]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{headerTitle}</ThemedText>
          <ThemedText style={[styles.sectionCount, { color: mutedTextColor }]}>
            {filteredRequests.length}
          </ThemedText>
        </View>

        {filteredRequests.length === 0 ? (
          <ThemedView
            style={[
              styles.emptyCard,
              { borderColor, backgroundColor: backgroundSecondary },
            ]}
          >
            <Feather
              name={status === "pending" ? "inbox" : "archive"}
              size={28}
              color={mutedTextColor}
            />
            <ThemedText style={styles.emptyTitle}>
              {searchQuery ? "No matches found" : "No records yet"}
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
              {searchQuery
                ? "Try a different search term."
                : emptyMessage}
            </ThemedText>
          </ThemedView>
        ) : (
          filteredRequests.map((request) => (
            <ThemedView
              key={request.id}
              style={[
                styles.requestCard,
                { borderColor, backgroundColor: backgroundSecondary },
              ]}
            >
              <View style={styles.requestHeader}>
                <View style={styles.requestHeaderText}>
                  <ThemedText style={styles.requestName}>
                    {request.full_name}
                  </ThemedText>
                  <ThemedText style={[styles.requestMeta, { color: mutedTextColor }]}>
                    {request.company_name || "No company name provided"}
                  </ThemedText>
                </View>
                <View style={[styles.statusChip, { backgroundColor: chipBackground }]}>
                  <ThemedText style={[styles.statusChipText, { color: chipColor }]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.requestDetails}>
                <ThemedText style={[styles.requestMeta, { color: mutedTextColor }]}>
                  Email: {request.email || "Not provided"}
                </ThemedText>
                <ThemedText style={[styles.requestMeta, { color: mutedTextColor }]}>
                  Phone: {request.phone || "Not provided"}
                </ThemedText>
                {request.profession ? (
                  <ThemedText style={[styles.requestMeta, { color: mutedTextColor }]}>
                    Profession: {request.profession}
                  </ThemedText>
                ) : null}
                {request.industry ? (
                  <ThemedText style={[styles.requestMeta, { color: mutedTextColor }]}>
                    Industry: {request.industry}
                  </ThemedText>
                ) : null}
                {request.location ? (
                  <ThemedText style={[styles.requestMeta, { color: mutedTextColor }]}>
                    Location: {request.location}
                  </ThemedText>
                ) : null}
                <ThemedText style={[styles.requestMeta, { color: mutedTextColor }]}>
                  Submitted: {new Date(request.created_at).toLocaleDateString()}
                </ThemedText>
                {request.reviewed_at ? (
                  <ThemedText style={[styles.requestMeta, { color: mutedTextColor }]}>
                    Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}
                  </ThemedText>
                ) : null}
                {request.message ? (
                  <ThemedText style={[styles.requestMessage, { color: mutedTextColor }]}>
                    {request.message}
                  </ThemedText>
                ) : null}
                {request.admin_notes ? (
                  <ThemedText style={[styles.requestMessage, { color: mutedTextColor }]}>
                    Admin note: {request.admin_notes}
                  </ThemedText>
                ) : null}
              </View>

              {status === "pending" ? (
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.detailAction, { borderColor }]}
                    onPress={() =>
                      router.push(`/admin/request-details?id=${request.id}`)
                    }
                  >
                    <ThemedText style={[styles.secondaryActionText, { color: textColor }]}>
                      View Details
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryAction, { borderColor }]}
                    onPress={() => {
                      setPendingRejectRequestId(request.id);
                    }}
                    disabled={submitting}
                  >
                    <ThemedText style={[styles.secondaryActionText, { color: textColor }]}>
                      Reject
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryActionSolid, { backgroundColor: tintColor }]}
                    onPress={() => {
                      void handleReview(request.id, "approved");
                    }}
                    disabled={submitting}
                  >
                    <ThemedText style={styles.primaryActionSolidText}>Approve</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.detailActionSingle, { borderColor }]}
                  onPress={() => router.push(`/admin/request-details?id=${request.id}`)}
                >
                  <ThemedText style={[styles.secondaryActionText, { color: textColor }]}>
                    View Details
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          ))
        )}
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
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  searchInputWrap: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
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
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
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
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  requestCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  requestHeaderText: {
    flex: 1,
    gap: 4,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "700",
  },
  requestMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  requestDetails: {
    gap: 6,
  },
  requestMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
  },
  detailAction: {
    flex: 1.2,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  detailActionSingle: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryActionSolid: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryActionSolidText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
  },
  reasonInput: {
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlignVertical: "top",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
});
