import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Modal,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedAvatar } from "@/components/ui/ThemedAvatar";
import Button from "@/components/ui/Button";
import { useCompanies, useThemeColor } from "@/hooks";
import { Feather } from "@expo/vector-icons";
import { Company } from "@/types";
import {
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from "@/constants/DesignSystem";

export interface CompanySelectorData {
  company: string;
  companyId?: string;
}

interface CompanySelectorProps {
  values: CompanySelectorData;
  onChange: (values: CompanySelectorData) => void;
  style?: any;
}

export default function CompanySelector({
  values,
  onChange,
  style,
}: CompanySelectorProps) {
  const { companies } = useCompanies();
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "background");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
  const tintColor = useThemeColor({}, "tint");

  const handleCompanySelect = (company: Company) => {
    onChange({
      company: company.name,
      companyId: company.id,
    });
    setShowCompanySelector(false);
  };

  const selectedCompany = companies.find((c) => c.id === values.companyId);

  return (
    <View style={[styles.container, style]}>
      <ThemedText style={[styles.sectionLabel, { color: textColor }]}>
        Company
      </ThemedText>

      {selectedCompany ? (
        // Show selected company with enhanced design
        <TouchableOpacity
          style={[
            styles.selectedCompany,
            {
              borderColor,
              backgroundColor: backgroundSecondary,
            },
          ]}
          onPress={() => setShowCompanySelector(true)}
        >
          <ThemedAvatar
            size={48}
            image={
              selectedCompany.logo_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                selectedCompany.name
              )}&size=48&background=2563eb&color=ffffff`
            }
          />
          <View style={styles.companyInfo}>
            <ThemedText style={[styles.companyName, { color: textColor }]}>
              {selectedCompany.name}
            </ThemedText>
            <View style={styles.companyMeta}>
              {selectedCompany.industry && (
                <View>
                  <ThemedText
                    style={[styles.metaChipText, { color: tintColor }]}
                  >
                    {selectedCompany.industry}
                  </ThemedText>
                </View>
              )}
              {selectedCompany.location && (
                <View>
                  <ThemedText
                    style={[styles.metaChipText, { color: mutedTextColor }]}
                  >
                    {selectedCompany.location}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
          <View
            style={[
              styles.chevronContainer,
              { backgroundColor: tintColor + "15" },
            ]}
          >
            <Feather name="chevron-down" size={16} color={tintColor} />
          </View>
        </TouchableOpacity>
      ) : (
        // Show enhanced company selector button
        <TouchableOpacity
          style={[
            styles.selectCompanyButton,
            {
              borderColor,
              backgroundColor: backgroundSecondary,
            },
          ]}
          onPress={() => setShowCompanySelector(true)}
        >
          <View
            style={[styles.buttonIcon, { backgroundColor: tintColor + "15" }]}
          >
            <Feather name="briefcase" size={20} color={tintColor} />
          </View>
          <View style={styles.buttonContent}>
            <ThemedText style={[styles.buttonTitle, { color: textColor }]}>
              Select Company
            </ThemedText>
            <ThemedText
              style={[styles.buttonSubtitle, { color: mutedTextColor }]}
            >
              Choose from your companies
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={16} color={mutedTextColor} />
        </TouchableOpacity>
      )}

      {/* Enhanced Company Selector Modal */}
      <Modal
        visible={showCompanySelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <StatusBar barStyle="dark-content" />

          {/* Enhanced Modal Header */}
          <View
            style={[styles.modalHeader, { borderBottomColor: borderColor }]}
          >
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCompanySelector(false)}
            >
              <ThemedText
                style={[styles.modalButtonText, { color: tintColor }]}
              >
                Cancel
              </ThemedText>
            </TouchableOpacity>

            <ThemedText style={[styles.modalTitle, { color: textColor }]}>
              Select Company
            </ThemedText>

            <View style={{ width: 60 }} />
          </View>

          {/* Enhanced Company List */}
          <FlatList
            data={companies}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.companyItem,
                  {
                    borderBottomColor: borderColor,
                    backgroundColor: backgroundSecondary,
                  },
                ]}
                onPress={() => handleCompanySelect(item)}
              >
                <ThemedAvatar
                  size={56}
                  image={
                    item.logo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      item.name
                    )}&size=56&background=2563eb&color=ffffff`
                  }
                />
                <View style={styles.companyItemInfo}>
                  <ThemedText
                    style={[styles.companyItemName, { color: textColor }]}
                  >
                    {item.name}
                  </ThemedText>
                  {item.description && (
                    <ThemedText
                      style={[
                        styles.companyItemDescription,
                        { color: mutedTextColor },
                      ]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </ThemedText>
                  )}
                  <View style={styles.companyItemMeta}>
                    {item.industry && (
                      <View style={[{ backgroundColor: tintColor + "15" }]}>
                        <ThemedText
                          style={[styles.metaChipText, { color: tintColor }]}
                        >
                          {item.industry}
                        </ThemedText>
                      </View>
                    )}
                    {item.location && (
                      <View
                        style={[{ backgroundColor: mutedTextColor + "15" }]}
                      >
                        <ThemedText
                          style={[
                            styles.metaChipText,
                            { color: mutedTextColor },
                          ]}
                        >
                          {item.location}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                <View
                  style={[
                    styles.selectIndicator,
                    { backgroundColor: tintColor + "15" },
                  ]}
                >
                  <Feather name="check" size={16} color={tintColor} />
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.xs,
  },
  selectedCompany: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  companyMeta: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
    marginTop: Spacing.xs,
  },
  metaChipText: {
    fontSize: Typography.xs,
    color: "gray",
  },
  chevronContainer: {
    marginLeft: Spacing.sm,
  },
  selectCompanyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  buttonSubtitle: {
    fontSize: Typography.sm,
    color: "gray",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  modalButton: {
    padding: Spacing.sm,
  },
  modalButtonText: {
    fontSize: Typography.base,
  },
  modalContent: {
    paddingVertical: Spacing.sm,
  },
  companyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  companyItemInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  companyItemName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  companyItemDescription: {
    fontSize: Typography.sm,
    marginTop: Spacing.xs,
    color: "gray",
  },
  companyItemMeta: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
    marginTop: Spacing.xs,
  },
  selectIndicator: {
    marginLeft: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm, // not fully round, just slightly
  },
});
