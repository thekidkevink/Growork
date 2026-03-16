import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { ThemedText } from "./ThemedText";
import { Feather } from "@expo/vector-icons";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function NetworkStatusBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [visible, setVisible] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(-50)).current;

  React.useEffect(() => {
    const shouldShow = !isConnected || isInternetReachable === false;

    if (shouldShow && !visible) {
      setVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else if (!shouldShow && visible) {
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isConnected, isInternetReachable, visible, slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
    >
      <Feather name="wifi-off" size={16} color="#FFFFFF" />
      <ThemedText style={styles.text}>
        {!isConnected ? "No internet connection" : "Limited connectivity"}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 1000,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
