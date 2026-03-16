import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeArea } from '@/hooks';
import { ThemedText } from './ThemedText';

/**
 * Example component showing how to use the useSafeArea hook
 * for custom safe area handling
 */
export const SafeAreaExample: React.FC = () => {
    const {
        insets,
        safeAreaStyles,
        getSafeAreaStyle,
        hasNotch,
        hasHomeIndicator
    } = useSafeArea();

    return (
        <View style={styles.container}>
            {/* Show safe area information */}
            <View style={styles.infoSection}>
                <ThemedText style={styles.title}>Safe Area Information</ThemedText>
                <ThemedText>Top: {insets.top}px</ThemedText>
                <ThemedText>Bottom: {insets.bottom}px</ThemedText>
                <ThemedText>Left: {insets.left}px</ThemedText>
                <ThemedText>Right: {insets.right}px</ThemedText>
                <ThemedText>Has Notch: {hasNotch ? 'Yes' : 'No'}</ThemedText>
                <ThemedText>Has Home Indicator: {hasHomeIndicator ? 'Yes' : 'No'}</ThemedText>
            </View>

            {/* Example of custom safe area styling */}
            <View style={[styles.customSection, getSafeAreaStyle(['top', 'bottom'])]}>
                <ThemedText style={styles.subtitle}>
                    Custom Safe Area (Top + Bottom only)
                </ThemedText>
                <ThemedText>This content extends to left and right edges</ThemedText>
            </View>

            {/* Example using safeAreaStyles */}
            <View style={[styles.fullSafeSection, safeAreaStyles]}>
                <ThemedText style={styles.subtitle}>
                    Full Safe Area (All edges)
                </ThemedText>
                <ThemedText>This content respects all safe areas</ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    infoSection: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    customSection: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
    },
    fullSafeSection: {
        padding: 16,
        backgroundColor: '#f3e5f5',
        borderRadius: 8,
    },
});

export default SafeAreaExample;
