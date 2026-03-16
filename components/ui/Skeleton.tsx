import React from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";
import { useThemeColor } from "@/hooks/ui/useThemeColor";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  borderRadius = 4,
  style,
}) => {
  const borderColor = useThemeColor({}, "border");
  const [fadeAnim] = React.useState(new Animated.Value(0.3));

  React.useEffect(() => {
    const fadeInOut = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => fadeInOut());
    };
    fadeInOut();
    return () => fadeAnim.stopAnimation();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: borderColor,
          opacity: fadeAnim,
        } as any,
        style,
      ]}
    />
  );
};

// Predefined skeleton components for common use cases
export const CompanySkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={[styles.companyCard, { borderColor, backgroundColor }]}>
      <Skeleton width={60} height={60} borderRadius={8} />
      <View style={styles.companyInfo}>
        <Skeleton width="70%" height={20} />
        <Skeleton width="50%" height={14} style={{ marginTop: 4 }} />
        <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

export const PostSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={[styles.postCard, { borderColor, backgroundColor }]}>
      <View style={styles.postHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.postHeaderInfo}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width="80%" height={18} style={{ marginTop: 12 }} />
      <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="70%" height={14} style={{ marginTop: 4 }} />
      <View style={styles.postFooter}>
        <Skeleton width={60} height={16} />
        <Skeleton width={60} height={16} />
      </View>
    </View>
  );
};

export const ProfileSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={[styles.profileCard, { borderColor, backgroundColor }]}>
      <View style={styles.profileHeader}>
        <Skeleton width={80} height={80} borderRadius={40} />
        <View style={styles.profileInfo}>
          <Skeleton width="70%" height={24} />
          <Skeleton width="50%" height={16} style={{ marginTop: 8 }} />
          <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
        </View>
      </View>
      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <Skeleton width={40} height={20} />
          <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={40} height={20} />
          <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={40} height={20} />
          <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
};

export const ContentCardSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={[styles.contentCard, { borderColor, backgroundColor }]}>
      <View style={styles.contentHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.contentHeaderInfo}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width="80%" height={18} style={{ marginTop: 12 }} />
      <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="70%" height={14} style={{ marginTop: 4 }} />
      <View style={styles.contentFooter}>
        <Skeleton width={60} height={16} />
        <Skeleton width={60} height={16} />
        <Skeleton width={60} height={16} />
      </View>
    </View>
  );
};

export const JobApplicationSkeleton: React.FC = () => {
  return (
    <View style={styles.jobApplicationCard}>
      <Skeleton width="60%" height={20} style={{ marginBottom: 16 }} />
      <View style={styles.documentList}>
        <Skeleton
          width="100%"
          height={80}
          borderRadius={8}
          style={{ marginBottom: 12 }}
        />
        <Skeleton
          width="100%"
          height={80}
          borderRadius={8}
          style={{ marginBottom: 12 }}
        />
        <Skeleton width="100%" height={80} borderRadius={8} />
      </View>
    </View>
  );
};

export const CoverLetterSkeleton: React.FC = () => {
  return (
    <View style={styles.coverLetterCard}>
      <Skeleton width="70%" height={20} style={{ marginBottom: 16 }} />
      <Skeleton
        width="100%"
        height={120}
        borderRadius={8}
        style={{ marginBottom: 16 }}
      />
      <Skeleton width="60%" height={16} style={{ marginBottom: 12 }} />
      <View style={styles.documentList}>
        <Skeleton
          width="100%"
          height={80}
          borderRadius={8}
          style={{ marginBottom: 12 }}
        />
        <Skeleton width="100%" height={80} borderRadius={8} />
      </View>
    </View>
  );
};

export const SearchResultsSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={[styles.searchResults, { borderColor, backgroundColor }]}>
      {Array.from({ length: 3 }).map((_, index) => (
        <ContentCardSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  companyCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  companyInfo: {
    flex: 1,
    justifyContent: "center",
  },
  postCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  contentCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contentHeaderInfo: {
    flex: 1,
  },
  contentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  jobApplicationCard: {
    padding: 16,
  },
  coverLetterCard: {
    padding: 16,
  },
  documentList: {
    width: "100%",
  },
  searchResults: {
    padding: 16,
  },
});
