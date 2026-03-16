import { useState, useCallback, useRef, useEffect } from "react";
import { Dimensions, LayoutChangeEvent, View } from "react-native";

interface UseDynamicSnapPointOptions {
  minHeight?: number; // Minimum height in pixels
  maxHeight?: number; // Maximum height as percentage of screen (0-1)
  padding?: number; // Additional padding in pixels
  defaultSnapPoint?: string; // Fallback snap point
}

export function useDynamicSnapPoint(options: UseDynamicSnapPointOptions = {}) {
  const {
    minHeight = 200,
    maxHeight = 0.9, // 90% of screen height
    padding = 40,
    defaultSnapPoint = "50%",
  } = options;

  const [snapPoint, setSnapPoint] = useState<string>(defaultSnapPoint);
  const [isCalculating, setIsCalculating] = useState(false);
  const contentRef = useRef<View | null>(null);

  const screenHeight = Dimensions.get("window").height;
  const maxHeightPixels = screenHeight * maxHeight;

  const calculateSnapPoint = useCallback(
    (contentHeight: number) => {
      // Add padding to content height
      const totalHeight = contentHeight + padding;

      // Ensure minimum height
      const finalHeight = Math.max(totalHeight, minHeight);

      // Ensure maximum height
      const clampedHeight = Math.min(finalHeight, maxHeightPixels);

      // Convert to percentage
      const percentage = (clampedHeight / screenHeight) * 100;

      // Round to nearest 5% for better UX
      const roundedPercentage = Math.round(percentage / 5) * 5;

      // Ensure it's at least 25% and at most 95%
      const finalPercentage = Math.max(25, Math.min(95, roundedPercentage));

      return `${finalPercentage}%`;
    },
    [minHeight, maxHeightPixels, padding, screenHeight]
  );

  const measureContent = useCallback(() => {
    if (!contentRef.current) {
      console.warn("Content ref not available for measurement");
      return;
    }

    setIsCalculating(true);

    contentRef.current.measure((x, y, width, height) => {
      const calculatedSnapPoint = calculateSnapPoint(height);
      setSnapPoint(calculatedSnapPoint);
      setIsCalculating(false);
    });
  }, [calculateSnapPoint]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0) {
        const calculatedSnapPoint = calculateSnapPoint(height);
        setSnapPoint(calculatedSnapPoint);
      }
    },
    [calculateSnapPoint]
  );

  return {
    snapPoint,
    isCalculating,
    contentRef,
    measureContent,
    onLayout,
    recalculate: measureContent,
  };
}
