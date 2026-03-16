import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Custom hook for safe area insets with additional utility functions
 */
export const useSafeArea = () => {
    const insets = useSafeAreaInsets();

    return {
        insets,
        // Common safe area styles
        safeAreaStyles: {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        },
        // Safe area for specific edges
        getSafeAreaStyle: (edges: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'left', 'right']) => ({
            paddingTop: edges.includes('top') ? insets.top : 0,
            paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
            paddingLeft: edges.includes('left') ? insets.left : 0,
            paddingRight: edges.includes('right') ? insets.right : 0,
        }),
        // Check if device has specific safe areas
        hasNotch: insets.top > 20,
        hasHomeIndicator: insets.bottom > 0,
    };
};

export default useSafeArea;
