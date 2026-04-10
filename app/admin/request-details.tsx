import React from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import ScreenContainer from "@/components/ScreenContainer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useBusinessRequests, usePermissions, useThemeColor } from "@/hooks";
import { BusinessAccountRequest } from "@/types";
import { useFlashToast } from "@/components/ui/Flash";
import { supabase } from "@/utils/supabase";

export default function AdminRequestDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isAdmin } = usePermissions();
  const { reviewRequest, retractApproval, submitting } = useBusinessRequests();
  const toast = useFlashToast();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const tintColor = useThemeColor({}, "tint");

  const [request, setRequest] = React.useState<BusinessAccountRequest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [pendingReject, setPendingReject] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const requestId = Array.isArray(id) ? id[0] : id;

  const loadRequest = React.useCallback(async () => {
    if (!requestId) {
      setLoading(false);
      setRequest(null);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("business_account_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setRequest((data as BusinessAccountRequest | null) ?? null);
    } catch {
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useFocusEffect(
    React.useCallback(() => {
      void loadRequest();
    }, [loadRequest])
  );

  const handleApprove = async () => {
    if (!request?.id) return;

    const { error } = await reviewRequest(request.id, "approved");
    if (error) {
      toast.show({
        type: "danger",
        title: "Approval failed",
        message: error,
      });
      return;
    }

    toast.show({
      type: "success",
      title: "Request approved",
      message: "The user can now access business tools.",
    });
    void loadRequest();
  };

  const handleReject = async () => {
    if (!request?.id) return;

    const { error } = await reviewRequest(
      request.id,
      "rejected",
      rejectionReason.trim() || "No reason provided."
    );
    if (error) {
      toast.show({
        type: "danger",
        title: "Rejection failed",
        message: error,
      });
      return;
    }

    setPendingReject(false);
    setRejectionReason("");
    toast.show({
      type: "success",
      title: "Request rejected",
      message: "The applicant will see the rejection reason.",
    });
    void loadRequest();
  };

  const handleRetractApproval = () => {
    if (!request?.id) return;

    Alert.alert(
      "Retract approval?",
      "This will move the request back to pending review and may remove the user's business access.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Retract Approval",
          style: "destructive",
          onPress: async () => {
            const { error } = await retractApproval(request.id);

            if (error) {
              toast.show({
                type: "danger",
                title: "Retract failed",
                message: error,
              });
              return;
            }

            toast.show({
              type: "success",
              title: "Approval retracted",
              message: "The request has been moved back to pending review.",
            });
            void loadRequest();
          },
        },
      ]
    );
  };

  const statusColor =
    request?.status === "approved"
      ? "#10b981"
      : request?.status === "rejected"
      ? "#ef4444"
      : tintColor;

  const statusBackground =
    request?.status === "approved"
      ? "#10b98118"
      : request?.status === "rejected"
      ? "#ef444418"
      : `${tintColor}18`;

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
        <ThemedText style={styles.headerTitle}>Request Details</ThemedText>
        <View style={styles.headerSpacer} />
      </ThemedView>

      <Modal
        visible={pendingReject}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPendingReject(false);
          setRejectionReason("");
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setPendingReject(false);
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
              Add a reason so the applicant understands why the request was rejected.
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
                { color: textColor, borderColor, backgroundColor: "transparent" },
              ]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.secondaryAction, { borderColor }]}
                onPress={() => {
                  setPendingReject(false);
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
                  void handleReject();
                }}
                disabled={submitting}
              >
                <ThemedText style={styles.primaryActionSolidText}>Reject</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={styles.centerState}>
          <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
            Loading request...
          </ThemedText>
        </View>
      ) : !request ? (
        <View style={styles.centerState}>
          <Feather name="file-text" size={36} color={mutedTextColor} />
          <ThemedText style={styles.emptyTitle}>Request not found</ThemedText>
          <ThemedText style={[styles.emptyText, { color: mutedTextColor }]}>
            We couldn&apos;t load this business request.
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView
            style={[
              styles.heroCard,
              { borderColor, backgroundColor: backgroundSecondary },
            ]}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <ThemedText style={styles.heroTitle}>{request.full_name}</ThemedText>
                <ThemedText style={[styles.heroSubtitle, { color: mutedTextColor }]}>
                  {request.company_name || "No company name provided"}
                </ThemedText>
              </View>
              <View style={[styles.statusChip, { backgroundColor: statusBackground }]}>
                <ThemedText style={[styles.statusChipText, { color: statusColor }]}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.heroMeta}>
              <ThemedText style={[styles.metaText, { color: mutedTextColor }]}>
                Submitted: {new Date(request.created_at).toLocaleDateString()}
              </ThemedText>
              {request.reviewed_at ? (
                <ThemedText style={[styles.metaText, { color: mutedTextColor }]}>
                  Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}
                </ThemedText>
              ) : null}
            </View>
          </ThemedView>

          <ThemedView
            style={[
              styles.detailCard,
              { borderColor, backgroundColor: backgroundSecondary },
            ]}
          >
            <ThemedText style={styles.sectionTitle}>Applicant Details</ThemedText>
            {[
              ["Email", request.email],
              ["Phone", request.phone],
              ["Profession", request.profession],
              ["Industry", request.industry],
              ["Location", request.location],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <View key={label} style={styles.detailRow}>
                  <ThemedText style={[styles.detailLabel, { color: mutedTextColor }]}>
                    {label}
                  </ThemedText>
                  <ThemedText style={[styles.detailValue, { color: textColor }]}>
                    {value}
                  </ThemedText>
                </View>
              ))}
          </ThemedView>

          {request.message ? (
            <ThemedView
              style={[
                styles.detailCard,
                { borderColor, backgroundColor: backgroundSecondary },
              ]}
            >
              <ThemedText style={styles.sectionTitle}>Reason For Access</ThemedText>
              <ThemedText style={[styles.bodyText, { color: mutedTextColor }]}>
                {request.message}
              </ThemedText>
            </ThemedView>
          ) : null}

          {request.admin_notes ? (
            <ThemedView
              style={[
                styles.detailCard,
                { borderColor, backgroundColor: backgroundSecondary },
              ]}
            >
              <ThemedText style={styles.sectionTitle}>Admin Note</ThemedText>
              <ThemedText style={[styles.bodyText, { color: mutedTextColor }]}>
                {request.admin_notes}
              </ThemedText>
            </ThemedView>
          ) : null}

          {request.status === "pending" ? (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.secondaryAction, { borderColor }]}
                onPress={() => setPendingReject(true)}
                disabled={submitting}
              >
                <ThemedText style={[styles.secondaryActionText, { color: textColor }]}>
                  Reject
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryActionSolid, { backgroundColor: tintColor }]}
                onPress={() => {
                  void handleApprove();
                }}
                disabled={submitting}
              >
                <ThemedText style={styles.primaryActionSolidText}>Approve</ThemedText>
              </TouchableOpacity>
            </View>
          ) : request.status === "approved" ? (
            <TouchableOpacity
              style={[styles.retractApprovalButton, { borderColor }]}
              onPress={handleRetractApproval}
              disabled={submitting}
            >
              <Feather name="rotate-ccw" size={16} color={textColor} />
              <ThemedText style={[styles.secondaryActionText, { color: textColor }]}>
                Retract Approval
              </ThemedText>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
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
  heroCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroMeta: {
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  detailCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  retractApprovalButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
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
