import React from "react";
import { View, Image, ActivityIndicator, Alert } from "react-native";
import { useImageUpload } from "./useImageUpload";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/ui/Button";
import { Spacing, BorderRadius } from "@/constants/DesignSystem";

interface ImagePickerFieldProps {
  selectedImage: string | null;
  onImageSelected: (imageUrl: string | null) => void;
  label?: string;
}

export const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  selectedImage,
  onImageSelected,
  label = "Add Image",
}) => {
  const { pickImage, uploading, error } = useImageUpload();

  const handleImagePick = async () => {
    try {
      const imageUrl = await pickImage();
      if (imageUrl) {
        onImageSelected(imageUrl);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removeImage = () => {
    onImageSelected(null);
  };

  return (
    <View style={{ marginVertical: Spacing.xs }}>
      {label && (
        <ThemedText style={{ marginBottom: Spacing.sm, fontWeight: "500" }}>
          {label}
        </ThemedText>
      )}

      {selectedImage ? (
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: selectedImage }}
            style={{
              width: "100%",
              height: 100,
              borderRadius: BorderRadius.md,
              marginBottom: Spacing.sm,
            }}
            resizeMode="cover"
          />
          <Button
            title="×"
            onPress={removeImage}
            variant="danger"
            size="sm"
            style={{
              position: "absolute",
              top: Spacing.sm,
              right: Spacing.sm,
              width: 30,
              height: 30,
              borderRadius: 15,
            }}
            textStyle={{ fontSize: 16, fontWeight: "bold" }}
          />
        </View>
      ) : (
        <Button
          title="Add image"
          onPress={handleImagePick}
          variant="outline"
          disabled={uploading}
          loading={uploading}
          style={{
            borderStyle: "dashed",
            padding: Spacing.lg,
            minHeight: 60,
            justifyContent: "center",
            alignItems: "center",
          }}
          textStyle={{ fontSize: 16 }}
        />
      )}

      {error && (
        <ThemedText
          style={{ color: "red", marginTop: Spacing.sm, fontSize: 12 }}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
};
