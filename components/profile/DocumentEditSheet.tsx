import { ThemedInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import BadgeSelector, { BadgeOption } from "@/components/ui/BadgeSelector";
import Button from "@/components/ui/Button";
import { useThemeColor } from "@/hooks";
import { Document, DocumentType } from "@/types";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type DocumentEditSheetProps = {
  document: Document;
  saving?: boolean;
  onSave: (values: { name: string; type: DocumentType }) => Promise<void> | void;
};

const DOCUMENT_TYPE_OPTIONS: BadgeOption[] = [
  { label: "CV/Resume", value: DocumentType.CV },
  { label: "Cover Letter", value: DocumentType.CoverLetter },
  { label: "Qualifications", value: DocumentType.Qualification },
  { label: "National ID", value: DocumentType.NationalId },
  { label: "Driver's Licence", value: DocumentType.DriversLicence },
  { label: "Other", value: DocumentType.Other },
];

export default function DocumentEditSheet({
  document,
  saving = false,
  onSave,
}: DocumentEditSheetProps) {
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const [name, setName] = React.useState(document.name || "");
  const [type, setType] = React.useState<DocumentType>(document.type);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Document name is required.");
      return;
    }

    setError(null);
    await onSave({ name: trimmedName, type });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Edit Document</ThemedText>
        <ThemedText style={[styles.subtitle, { color: mutedTextColor }]}>
          Update the file name and category shown across the app.
        </ThemedText>
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Document Name</ThemedText>
        <ThemedInput
          value={name}
          onChangeText={setName}
          placeholder="Enter document name"
          autoCapitalize="words"
          returnKeyType="done"
          editable={!saving}
          style={styles.input}
        />
      </View>

      <BadgeSelector
        options={DOCUMENT_TYPE_OPTIONS}
        selectedValue={type}
        onValueChange={(value) => setType(value as DocumentType)}
        title="Document Category"
      />

      {error ? (
        <ThemedText style={[styles.errorText, { color: "#dc2626" }]}>
          {error}
        </ThemedText>
      ) : null}

      <Button
        title={saving ? "Saving..." : "Save Changes"}
        onPress={handleSave}
        disabled={saving}
        fullWidth={true}
        style={styles.saveButton}
      />

      {saving ? (
        <View style={styles.savingRow}>
          <ActivityIndicator size="small" color={textColor} />
          <ThemedText style={[styles.savingText, { color: mutedTextColor }]}>
            Updating document...
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 12,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    marginBottom: 0,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
  },
  saveButton: {
    marginTop: 4,
  },
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  savingText: {
    fontSize: 13,
  },
});
