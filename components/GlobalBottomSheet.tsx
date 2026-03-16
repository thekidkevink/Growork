import React, { useMemo, useRef, useEffect } from "react";
import { forwardRef } from "react";
import { StyleSheet, Platform, KeyboardAvoidingView, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useThemeColor } from "@/hooks";
import { useDynamicSnapPoint } from "@/hooks/ui/useDynamicSnapPoint";

export interface SimpleBottomSheetProps {
  snapPoints?: string[];
  onDismiss?: () => void;
  children: React.ReactNode;
  dynamicSnapPoint?: boolean;
  dynamicOptions?: {
    minHeight?: number;
    maxHeight?: number;
    padding?: number;
  };
}

const SimpleBottomSheet = forwardRef<BottomSheetModal, SimpleBottomSheetProps>(
  function SimpleBottomSheet(
    {
      snapPoints = ["50%"],
      onDismiss,
      children,
      dynamicSnapPoint = false,
      dynamicOptions = {},
    },
    ref
  ) {
    const backgroundSecondary = useThemeColor({}, "backgroundSecondary");
    const borderColor = useThemeColor({}, "border");
    const textColor = useThemeColor({}, "text");
    const mutedText = useThemeColor({}, "mutedText");

    const {
      snapPoint: dynamicSnapPointValue,
      isCalculating,
      contentRef,
      onLayout,
    } = useDynamicSnapPoint({
      defaultSnapPoint: snapPoints[0] || "50%",
      ...dynamicOptions,
    });

    // Use dynamic snap point if enabled, otherwise use provided snap points
    const finalSnapPoints = useMemo(() => {
      if (dynamicSnapPoint) {
        return [dynamicSnapPointValue];
      }
      return snapPoints;
    }, [dynamicSnapPoint, dynamicSnapPointValue, snapPoints]);

    const backgroundStyle = useMemo(
      () => ({
        backgroundColor: backgroundSecondary,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        shadowColor: textColor,
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        borderColor,
        borderTopWidth: 1,
      }),
      [backgroundSecondary, borderColor, textColor]
    );

    const handleIndicatorStyle = useMemo(
      () => ({
        backgroundColor: mutedText,
        width: 40,
        height: 4,
      }),
      [mutedText]
    );

    const renderBackdrop = useMemo(
      () =>
        function RenderBackdrop(backdropProps: BottomSheetBackdropProps) {
          return (
            <BottomSheetBackdrop
              {...backdropProps}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              opacity={0.44}
              pressBehavior="close"
            />
          );
        },
      []
    );

    // Wrap children with measurement view if dynamic snap point is enabled
    const measuredChildren = useMemo(() => {
      if (dynamicSnapPoint) {
        return (
          <View
            ref={contentRef}
            onLayout={onLayout}
            style={styles.measurementContainer}
          >
            {children}
          </View>
        );
      }
      return children;
    }, [dynamicSnapPoint, children, contentRef, onLayout]);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={finalSnapPoints}
        onDismiss={onDismiss}
        backgroundStyle={backgroundStyle}
        handleIndicatorStyle={handleIndicatorStyle}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableDynamicSizing={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {measuredChildren}
          </BottomSheetScrollView>
        </KeyboardAvoidingView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  measurementContainer: {
    // This container is used for measuring content height
    // No additional styling needed
  },
});

export { BottomSheetTextInput };
export default SimpleBottomSheet;
