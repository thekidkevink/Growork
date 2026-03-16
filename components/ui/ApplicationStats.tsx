import React from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColor, ApplicationWithDetails } from "@/hooks";
import { ThemedText } from "@/components/ThemedText";
import { ApplicationStatus } from "@/types/enums";

interface ApplicationStatsProps {
  applications: ApplicationWithDetails[];
}

export function ApplicationStats({ applications }: ApplicationStatsProps) {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");

  const stats = React.useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(
      (app) => app.status === ApplicationStatus.Pending
    ).length;
    const reviewed = applications.filter(
      (app) => app.status === ApplicationStatus.Reviewed
    ).length;
    const accepted = applications.filter(
      (app) => app.status === ApplicationStatus.Accepted
    ).length;
    const rejected = applications.filter(
      (app) => app.status === ApplicationStatus.Rejected
    ).length;

    return {
      total,
      pending,
      reviewed,
      accepted,
      rejected,
    };
  }, [applications]);

  return (
    <View style={[styles.container, { borderBottomColor: borderColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Application Overview
        </ThemedText>
        <ThemedText style={[styles.total, { color: mutedTextColor }]}>
          {stats.total} total
        </ThemedText>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: textColor }]}>
            {stats.pending}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
            Pending
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: textColor }]}>
            {stats.reviewed}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
            Reviewed
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: textColor }]}>
            {stats.accepted}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
            Accepted
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: textColor }]}>
            {stats.rejected}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
            Rejected
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  total: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
