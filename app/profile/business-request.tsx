import React from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import ScreenContainer from "@/components/ScreenContainer";
import SettingsList from "@/components/ui/SettingsList";
import ActionPromptModal from "@/components/ui/ActionPromptModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth, useBusinessRequests, useThemeColor } from "@/hooks";
import { useFlashToast } from "@/components/ui/Flash";

const BUSINESS_REQUEST_TERMS_MESSAGE =
  "By continuing, you agree to the GROWORK Terms of Use and acknowledge the Privacy Policy.\n\nYou confirm that the information you submit is accurate, that you will use the platform responsibly, not misuse data or other users, and comply with Namibian law.\n\nYou also understand that GROWORK collects and uses personal, document, and company information to review requests, match jobs, improve services, communicate with users, and may share relevant data with employers or display public content as described in the Privacy Policy.";

export default function BusinessRequestScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { profile } = useAuth();
  const {
    myLatestRequest,
    myRequestLoading,
    createRequest,
    retractRequest,
    submitting,
  } = useBusinessRequests();
  const toast = useFlashToast();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const tintColor = useThemeColor({}, "tint");

  const [form, setForm] = React.useState({
    full_name: [profile?.name, profile?.surname].filter(Boolean).join(" ").trim(),
    phone: profile?.phone || "",
    profession: profile?.profession || "",
    company_name: "",
    industry: "",
    location: profile?.location || "",
    message: "",
  });
  const [hasAcceptedBusinessTerms, setHasAcceptedBusinessTerms] =
    React.useState(false);

  const hasPendingRequest = myLatestRequest?.status === "pending";
  const shouldRequireBusinessConsent = !myRequestLoading && !hasPendingRequest;

  React.useEffect(() => {
    if (!myLatestRequest) return;

    setForm((prev) => ({
      ...prev,
      full_name: myLatestRequest.full_name || prev.full_name,
      phone: myLatestRequest.phone || prev.phone,
      profession: myLatestRequest.profession || prev.profession,
      company_name: myLatestRequest.company_name || prev.company_name,
      industry: myLatestRequest.industry || prev.industry,
      location: myLatestRequest.location || prev.location,
      message: myLatestRequest.message || prev.message,
    }));
  }, [myLatestRequest]);

  const handleSubmit = async () => {
    if (shouldRequireBusinessConsent && !hasAcceptedBusinessTerms) {
      toast.show({
        type: "info",
        title: "Accept terms first",
        message:
          "Please accept the business request terms before filling in and submitting this form.",
      });
      return;
    }

    if (hasPendingRequest) {
      toast.show({
        type: "info",
        title: "Request already pending",
        message: "You already have a business account request under review.",
      });
      return;
    }

    if (!form.full_name.trim() || !form.phone.trim() || !form.company_name.trim()) {
      toast.show({
        type: "danger",
        title: "Missing details",
        message: "Full name, contact number, and company name are required.",
      });
      return;
    }

    const { error } = await createRequest({
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      profession: form.profession.trim() || null,
      company_name: form.company_name.trim(),
      industry: form.industry.trim() || null,
      location: form.location.trim() || null,
      message: form.message.trim() || null,
    });

    if (error) {
      toast.show({
        type: "danger",
        title: "Request failed",
        message: error,
      });
      return;
    }

    toast.show({
      type: "success",
      title: "Request submitted",
      message: "Your business account request is now waiting for admin review.",
    });
    router.back();
  };

  const handleRetract = () => {
    if (!myLatestRequest?.id || myLatestRequest.status !== "pending") return;

    Alert.alert(
      "Retract request?",
      "This will withdraw your business account request. You can submit a new one later.",
      [
        { text: "Keep Request", style: "cancel" },
        {
          text: "Retract",
          style: "destructive",
          onPress: async () => {
            const { error } = await retractRequest(myLatestRequest.id);

            if (error) {
              toast.show({
                type: "danger",
                title: "Could not retract",
                message: error,
              });
              return;
            }

            toast.show({
              type: "success",
              title: "Request retracted",
              message: "Your business account request has been withdrawn.",
            });
          },
        },
      ]
    );
  };

  const statusLabel = myLatestRequest?.status
    ? myLatestRequest.status.charAt(0).toUpperCase() + myLatestRequest.status.slice(1)
    : null;
  const submittedDetails = myLatestRequest
    ? [
        { label: "Full Name", value: myLatestRequest.full_name },
        { label: "Contact Number", value: myLatestRequest.phone },
        { label: "Current Profession", value: myLatestRequest.profession },
        { label: "Company Name", value: myLatestRequest.company_name },
        { label: "Industry", value: myLatestRequest.industry },
        { label: "Location", value: myLatestRequest.location },
        {
          label: "Reason for Access",
          value: myLatestRequest.message,
        },
      ].filter((item) => item.value && String(item.value).trim().length > 0)
    : [];

  return (
    <ScreenContainer>
      <ActionPromptModal
        visible={shouldRequireBusinessConsent && !hasAcceptedBusinessTerms}
        title="Accept Terms of Use"
        message={BUSINESS_REQUEST_TERMS_MESSAGE}
        cancelLabel="Not now"
        confirmLabel="I Accept"
        onCancel={() => router.back()}
        onConfirm={() => setHasAcceptedBusinessTerms(true)}
      />
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Business Request</ThemedText>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={
            submitting ||
            hasPendingRequest ||
            (shouldRequireBusinessConsent && !hasAcceptedBusinessTerms)
          }
        >
          <ThemedText style={[styles.submitButtonText, { color: tintColor }]}>
            {myRequestLoading
              ? "Loading..."
              : hasPendingRequest
              ? "Pending"
              : shouldRequireBusinessConsent && !hasAcceptedBusinessTerms
              ? "Locked"
              : submitting
              ? "Sending..."
              : myLatestRequest?.status === "rejected"
              ? "Resubmit"
              : "Submit"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {myRequestLoading ? (
        <View style={styles.loadingState}>
          <ThemedText style={[styles.loadingText, { color: mutedTextColor }]}>
            Loading your business request...
          </ThemedText>
        </View>
      ) : (
        <>

      {myLatestRequest ? (
        <ThemedView
          style={[
            styles.statusCard,
            { borderColor, backgroundColor: backgroundSecondary },
          ]}
        >
          <ThemedText style={styles.statusTitle}>Latest request</ThemedText>
          <ThemedText style={[styles.statusText, { color: mutedTextColor }]}>
            Status: {statusLabel}
          </ThemedText>
          <ThemedText style={[styles.statusText, { color: mutedTextColor }]}>
            Submitted on {new Date(myLatestRequest.created_at).toLocaleDateString()}
          </ThemedText>
          {myLatestRequest.admin_notes ? (
            <ThemedText style={[styles.statusText, { color: mutedTextColor }]}>
              Admin note: {myLatestRequest.admin_notes}
            </ThemedText>
          ) : null}
          {myLatestRequest.status === "pending" ? (
            <TouchableOpacity
              style={[styles.retractButton, { borderColor }]}
              onPress={handleRetract}
              disabled={submitting}
            >
              <Feather name="corner-up-left" size={16} color={textColor} />
              <ThemedText
                style={[styles.retractButtonText, { color: textColor }]}
              >
                {submitting ? "Retracting..." : "Retract Request"}
              </ThemedText>
            </TouchableOpacity>
          ) : null}
        </ThemedView>
      ) : null}

      {myLatestRequest ? (
        <ThemedView
          style={[
            styles.detailsCard,
            { borderColor, backgroundColor: backgroundSecondary },
          ]}
        >
          <ThemedText style={styles.detailsTitle}>Submitted Details</ThemedText>
          {submittedDetails.map((item) => (
            <View key={item.label} style={styles.detailRow}>
              <ThemedText
                style={[styles.detailLabel, { color: mutedTextColor }]}
              >
                {item.label}
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: textColor }]}>
                {item.value}
              </ThemedText>
            </View>
          ))}
        </ThemedView>
      ) : null}

      <View style={styles.content}>
        <ThemedText style={[styles.intro, { color: mutedTextColor }]}>
          {hasPendingRequest
            ? "Your request is currently under review. You can retract it if you need to make major changes before an admin reviews it."
            : "Submit your business account request for review. Once approved, your account can create companies, publish job listings, and manage incoming applicants."}
        </ThemedText>

        {!hasPendingRequest && hasAcceptedBusinessTerms ? (
          <SettingsList
            sections={[
              {
                title: "Application Details",
                data: [
                  {
                    title: "Full Name",
                    subtitle: "Required",
                    icon: "user",
                    showTextInput: true,
                    textInputValue: form.full_name,
                    textInputPlaceholder: "Enter your full name",
                    onTextInputChange: (text: string) =>
                      setForm((prev) => ({ ...prev, full_name: text })),
                  },
                  {
                    title: "Contact Number",
                    subtitle: "Required",
                    icon: "phone",
                    showTextInput: true,
                    textInputValue: form.phone,
                    textInputPlaceholder: "Enter your phone number",
                    onTextInputChange: (text: string) =>
                      setForm((prev) => ({ ...prev, phone: text })),
                    textInputProps: { keyboardType: "phone-pad" },
                  },
                  {
                    title: "Current Profession",
                    subtitle: "Optional",
                    icon: "briefcase",
                    showTextInput: true,
                    textInputValue: form.profession,
                    textInputPlaceholder: "e.g. Operations Manager",
                    onTextInputChange: (text: string) =>
                      setForm((prev) => ({ ...prev, profession: text })),
                  },
                  {
                    title: "Company Name",
                    subtitle: "Required",
                    icon: "home",
                    showTextInput: true,
                    textInputValue: form.company_name,
                    textInputPlaceholder: "Enter the company name",
                    onTextInputChange: (text: string) =>
                      setForm((prev) => ({ ...prev, company_name: text })),
                  },
                  {
                    title: "Industry",
                    subtitle: "Optional",
                    icon: "layers",
                    showTextInput: true,
                    textInputValue: form.industry,
                    textInputPlaceholder: "e.g. Technology",
                    onTextInputChange: (text: string) =>
                      setForm((prev) => ({ ...prev, industry: text })),
                  },
                  {
                    title: "Location",
                    subtitle: "Optional",
                    icon: "map-pin",
                    showTextInput: true,
                    textInputValue: form.location,
                    textInputPlaceholder: "City, Country",
                    onTextInputChange: (text: string) =>
                      setForm((prev) => ({ ...prev, location: text })),
                  },
                  {
                    title: "Why do you need business access?",
                    subtitle: "Optional",
                    icon: "file-text",
                    showTextInput: true,
                    textInputValue: form.message,
                    textInputPlaceholder: "Add any context for the admin review",
                    onTextInputChange: (text: string) =>
                      setForm((prev) => ({ ...prev, message: text })),
                    textInputProps: {
                      multiline: true,
                      numberOfLines: 3,
                    },
                  },
                ],
              },
            ]}
          />
        ) : !hasPendingRequest ? (
          <ThemedView
            style={[
              styles.termsCard,
              { borderColor, backgroundColor: backgroundSecondary },
            ]}
          >
            <ThemedText style={styles.termsTitle}>
              Business request terms required
            </ThemedText>
            <ThemedText
              style={[styles.termsMessage, { color: mutedTextColor }]}
            >
              Accept the GROWORK Terms of Use and Privacy Policy to unlock the business request form.
            </ThemedText>
            <TouchableOpacity
              style={[styles.termsButton, { borderColor }]}
              onPress={() => setHasAcceptedBusinessTerms(true)}
            >
              <ThemedText style={[styles.termsButtonText, { color: textColor }]}>
                Review and Accept
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : null}
      </View>
        </>
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
  submitButton: {
    padding: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  termsCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  termsMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  termsButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 15,
    textAlign: "center",
  },
  intro: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    gap: 6,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    gap: 12,
  },
  detailsTitle: {
    fontSize: 16,
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
  retractButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retractButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
