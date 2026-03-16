import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
    mode?: 'padding' | 'margin';
}

/**
 * SafeAreaWrapper - Provides safe area handling for both iOS and Android
 * 
 * @param edges - Which edges to apply safe area insets to (default: all edges)
 * @param mode - Whether to use padding or margin for safe area insets
 * @param style - Additional styles to apply
 */
export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
    children,
    style,
    edges = ['top', 'bottom', 'left', 'right'],
    mode = 'padding'
}) => {
    return (
        <SafeAreaView
            style={style}
            edges={edges}
            mode={mode}
        >
            {children}
        </SafeAreaView>
    );
};

/**
 * SafeAreaInsets - Hook-based component for custom safe area handling
 * Useful when you need more control over how safe area insets are applied
 */
export const SafeAreaInsets: React.FC<{
    children: React.ReactNode;
    style?: ViewStyle;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
}> = ({ children, style, edges = ['top', 'bottom', 'left', 'right'] }) => {
    const insets = useSafeAreaInsets();

    const safeAreaStyle: ViewStyle = {
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: edges.includes('left') ? insets.left : 0,
        paddingRight: edges.includes('right') ? insets.right : 0,
        ...style,
    };

    return (
        <View style={safeAreaStyle}>
            {children}
        </View>
    );
};

export default SafeAreaWrapper;
