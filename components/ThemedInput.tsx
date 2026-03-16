import { useThemeColor } from "@/hooks";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { forwardRef } from "react";

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export const ThemedInput = forwardRef<TextInput, ThemedInputProps>(
  ({ style, lightColor, darkColor, ...rest }, ref) => {
    const backgroundColor = useThemeColor(
      { light: "#ffffff", dark: "#2a2a2a" },
      "background"
    );
    const textColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      "text"
    );
    const borderColor = useThemeColor({}, "border");
    const placeholderColor = useThemeColor({}, "mutedText");

    return (
      <TextInput
        ref={ref}
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor,
            borderColor,
          },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        {...rest}
      />
    );
  }
);

ThemedInput.displayName = "ThemedInput";

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
});
