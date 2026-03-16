import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedInput } from "@/components/ThemedInput";
import { supabase } from "@/utils/supabase";
import { UserType, type ProfileFormData } from "@/types";
import ScreenContainer from "@/components/ScreenContainer";
import { useAuth, useThemeColor } from "@/hooks";

const fields: {
  label: string;
  field: keyof ProfileFormData;
  placeholder: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "url"
    | "number-pad"
    | "phone-pad";
}[] = [
  { label: "Name *", field: "name", placeholder: "First name" },
  { label: "Surname *", field: "surname", placeholder: "Surname" },
  { label: "Username *", field: "username", placeholder: "Username" },
  {
    label: "Profession *",
    field: "profession",
    placeholder: "e.g. Software Engineer",
  },
  {
    label: "Bio",
    field: "bio",
    placeholder: "Short bio...",
    multiline: true,
    numberOfLines: 4,
  },
  { label: "Website", field: "website", placeholder: "https://..." },
  { label: "Phone", field: "phone", placeholder: "Contact phone" },
  { label: "Location", field: "location", placeholder: "City, Country" },
  {
    label: "Experience Years",
    field: "experience_years",
    placeholder: "Years",
    keyboardType: "numeric",
  },
  { label: "Education", field: "education", placeholder: "Your education" },
  {
    label: "Skills (comma separated)",
    field: "skills",
    placeholder: "e.g. JavaScript, React, Python",
  },
];

export default function UserProfileEdit() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    surname: "",
    username: "",
    bio: "",
    user_type: UserType.User,
    website: "",
    phone: "",
    location: "",
    profession: "",
    experience_years: "",
    education: "",
    skills: "",
  });

  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedTextColor = useThemeColor({}, "mutedText");

  // Populate form with profile info
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name ?? "",
        surname: profile.surname ?? "",
        username: profile.username ?? "",
        bio: profile.bio ?? "",
        user_type: profile.user_type ?? UserType.User,
        website: profile.website ?? "",
        phone: profile.phone ?? "",
        location: profile.location ?? "",
        profession: profile.profession ?? "",
        experience_years: profile.experience_years?.toString() ?? "",
        education: profile.education ?? "",
        skills: profile.skills ? profile.skills.join(", ") : "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    if (
      !formData.name.trim() ||
      !formData.surname.trim() ||
      !formData.username.trim() ||
      !formData.profession.trim()
    ) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (name, surname, username, profession)."
      );
      return;
    }
    setLoading(true);
    try {
      const { user_type, ...payload } = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience_years: formData.experience_years
          ? parseInt(formData.experience_years)
          : null,
      };
      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      Alert.alert("Success", "Profile updated!");
      setEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        {editing ? (
          <Pressable
            onPress={handleSave}
            style={[
              styles.headerButton,
              loading && styles.headerButtonDisabled,
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={tintColor} />
            ) : (
              <ThemedText
                style={[styles.headerButtonText, { color: tintColor }]}
              >
                Save
              </ThemedText>
            )}
          </Pressable>
        ) : (
          <View style={styles.headerButton} />
        )}

        <ThemedText style={styles.headerTitle} type="defaultSemiBold">
          Edit Profile
        </ThemedText>
        {!editing ? (
          <Pressable
            onPress={() => setEditing(true)}
            style={styles.headerButton}
          >
            <ThemedText style={[styles.headerButtonText, { color: tintColor }]}>
              Edit
            </ThemedText>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setEditing(false)}
            style={styles.headerButton}
          >
            <ThemedText style={[styles.headerButtonText, { color: "#666" }]}>
              Cancel
            </ThemedText>
          </Pressable>
        )}
      </View>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formView}>
            <ThemedText style={styles.title}>Profile Details</ThemedText>
            {fields.map((f) => (
              <View key={f.field} style={styles.fieldRow}>
                <ThemedText
                  style={[styles.fieldLabel, { color: mutedTextColor }]}
                >
                  {f.label}
                </ThemedText>
                <ThemedInput
                  value={formData[f.field]}
                  onChangeText={(text) =>
                    setFormData({ ...formData, [f.field]: text })
                  }
                  placeholder={f.placeholder}
                  style={[styles.input, f.multiline && styles.textArea]}
                  placeholderTextColor={mutedTextColor}
                  multiline={!!f.multiline}
                  numberOfLines={f.numberOfLines}
                  editable={editing}
                  // Only pass keyboardType if it's defined
                  {...(f.keyboardType && { keyboardType: f.keyboardType })}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 44,
  },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: "center",
  },
  headerButtonDisabled: { opacity: 0.5 },
  headerButtonText: { fontSize: 16, fontWeight: "500" },
  formView: { padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
  },
  fieldRow: { marginBottom: 16 },
  fieldLabel: { fontSize: 15, fontWeight: "500", marginBottom: 8 },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
});
