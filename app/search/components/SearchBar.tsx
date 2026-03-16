import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedInput } from "@/components/ThemedInput";
import { useThemeColor } from "@/hooks";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
}: SearchBarProps) {
  const iconColor = useThemeColor({}, "iconSecondary");

  return (
    <View style={styles.container}>
      <View style={styles.searchField}>
        <Feather
          name="search"
          size={20}
          color={iconColor}
          style={styles.searchIcon}
        />
        <ThemedInput
          style={styles.textInput}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
        />
        {!!value && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <Feather name="x-circle" size={20} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 40,
    marginBottom: 0, // Override the default margin in ThemedInput
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 14, // Adjusted to vertically center the icon
  },
});
