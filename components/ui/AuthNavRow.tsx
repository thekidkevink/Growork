import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface AuthNavRowProps {
  onBack?: () => void;
  onCenter?: () => void;
  onNext?: () => void;
  centerLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  backIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
  centerIcon?: React.ReactNode;
  centerDisabled?: boolean;
  nextDisabled?: boolean;
  style?: ViewStyle;
}

export const AuthNavRow: React.FC<AuthNavRowProps> = ({
  onBack,
  onCenter,
  onNext,
  centerLabel,
  backLabel,
  nextLabel,
  backIcon,
  nextIcon,
  centerIcon,
  centerDisabled,
  nextDisabled,
  style,
}) => {
  const scheme = useColorScheme() ?? "light";
  const color = Colors[scheme];

  // Count how many buttons are visible
  const visibleButtonsCount = [onBack, onCenter, onNext].filter(Boolean).length;

  return (
    <View
      style={[
        styles.bottomRow,
        {
          backgroundColor: color.background,
          borderTopColor: color.border,
        },
        style,
      ]}
    >
      {/* Back button */}
      {onBack && (
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: color.backgroundSecondary,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
            },
            visibleButtonsCount === 1 && styles.onlyButtonLeft,
          ]}
          onPress={onBack}
          activeOpacity={0.7}
        >
          {backIcon ?? (
            <Feather name="arrow-left" size={24} color={color.tint} />
          )}
          {backLabel && (
            <Text
              style={[styles.navText, { color: color.tint, marginLeft: 6 }]}
            >
              {backLabel}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Center button */}
      {onCenter && (
        <TouchableOpacity
          style={[
            styles.centerButton,
            { backgroundColor: centerDisabled ? color.disabled : color.tint },
            visibleButtonsCount === 1 && styles.onlyButtonCenter,
          ]}
          onPress={onCenter}
          disabled={centerDisabled}
          activeOpacity={0.8}
        >
          {centerIcon ? (
            centerIcon
          ) : (
            <Text
              style={[
                styles.centerButtonText,
                {
                  color:
                    scheme === "light" ? Colors.dark.text : Colors.light.text,
                },
              ]}
            >
              {centerLabel}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Next button */}
      {onNext && (
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: color.backgroundSecondary,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            },
            nextDisabled && styles.disabled,
            visibleButtonsCount === 1 && styles.onlyButtonRight,
          ]}
          onPress={onNext}
          disabled={nextDisabled}
          activeOpacity={0.7}
        >
          {nextLabel && (
            <Text
              style={[styles.navText, { color: color.tint, marginRight: 6 }]}
            >
              {nextLabel}
            </Text>
          )}
          {nextIcon ?? (
            <Feather name="arrow-right" size={24} color={color.tint} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 10,
  },
  iconButton: {
    padding: 10,
    borderRadius: 100,
    minWidth: 70,
  },
  centerButton: {
    flex: 1,
    marginHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: "center",
  },
  centerButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  navText: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.4,
  },
  onlyButtonLeft: {
    flex: 0,
    marginRight: "auto",
  },
  onlyButtonCenter: {
    flex: 0,
    alignSelf: "center",
  },
  onlyButtonRight: {
    flex: 0,
    marginLeft: "auto",
  },
});
