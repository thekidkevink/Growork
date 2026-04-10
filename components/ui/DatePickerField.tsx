import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { useColorScheme, useThemeColor } from "@/hooks";

interface DatePickerFieldProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  maximumDate?: Date;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateForValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(value: string) {
  const parsed = parseDate(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString();
}

export default function DatePickerField({
  value,
  onChange,
  placeholder = "Select a date",
  maximumDate,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = React.useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");

  const currentDate = parseDate(value) ?? new Date();

  const handleChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS !== "ios") {
      setShowPicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    const normalized = new Date(selectedDate);
    normalized.setHours(0, 0, 0, 0);
    onChange(formatDateForValue(normalized));
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          { borderColor, backgroundColor: backgroundSecondary },
        ]}
        onPress={() => setShowPicker(true)}
      >
        <ThemedText
          style={[styles.value, { color: value ? textColor : mutedTextColor }]}
        >
          {value ? formatDateForDisplay(value) : placeholder}
        </ThemedText>
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          maximumDate={maximumDate}
          themeVariant={colorScheme}
          {...(Platform.OS === "android"
            ? {
                design: "material" as const,
                initialInputMode: "default" as const,
                title: "Select date",
              }
            : {})}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  value: {
    fontSize: 16,
  },
});
