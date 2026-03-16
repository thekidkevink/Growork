import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks';
import { ThemedText } from '@/components/ThemedText';
import { ApplicationStatus } from '@/types/enums';
import { JOB_TYPES } from '@/dataset/jobTypes';
import { INDUSTRIES } from '@/dataset/industries';

interface FilterOption {
    label: string;
    value: string;
}

interface ApplicationFiltersProps {
    selectedStatus: ApplicationStatus | null;
    selectedType: string | null;
    selectedIndustry: string | null;
    onStatusChange: (status: ApplicationStatus | null) => void;
    onTypeChange: (type: string | null) => void;
    onIndustryChange: (industry: string | null) => void;
}

export function ApplicationFilters({
    selectedStatus,
    selectedType,
    selectedIndustry,
    onStatusChange,
    onTypeChange,
    onIndustryChange,
}: ApplicationFiltersProps) {
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'border');
    const tintColor = useThemeColor({}, 'tint');

    const statusOptions: FilterOption[] = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: ApplicationStatus.Pending },
        { label: 'Reviewed', value: ApplicationStatus.Reviewed },
        { label: 'Accepted', value: ApplicationStatus.Accepted },
        { label: 'Rejected', value: ApplicationStatus.Rejected },
    ];

    const typeOptions: FilterOption[] = [
        { label: 'All Types', value: 'all' },
        ...JOB_TYPES.map(type => ({ label: type, value: type })),
    ];

    const industryOptions: FilterOption[] = [
        { label: 'All Industries', value: 'all' },
        ...INDUSTRIES.map(industry => ({ label: industry.label, value: industry.label })),
    ];

    const renderFilterGroup = (
        title: string,
        options: FilterOption[],
        selectedValue: string | null,
        onValueChange: (value: string | null) => void
    ) => (
        <View style={styles.filterGroup}>
            <ThemedText style={[styles.filterGroupTitle, { color: textColor }]}>
                {title}
            </ThemedText>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterOptionsContainer}
            >
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.filterOption,
                            {
                                backgroundColor: selectedValue === option.value ? tintColor : 'transparent',
                                borderColor: selectedValue === option.value ? tintColor : borderColor,
                            },
                        ]}
                        onPress={() => onValueChange(option.value === 'all' ? null : option.value)}
                    >
                        <ThemedText
                            style={[
                                styles.filterOptionText,
                                {
                                    color: selectedValue === option.value ? '#FFFFFF' : textColor,
                                },
                            ]}
                        >
                            {option.label}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <View style={[styles.container, { borderBottomColor: borderColor }]}>
            {renderFilterGroup(
                'Status',
                statusOptions,
                selectedStatus,
                (value: string | null) => onStatusChange(value as ApplicationStatus | null)
            )}

            {renderFilterGroup(
                'Job Type',
                typeOptions,
                selectedType,
                onTypeChange
            )}

            {renderFilterGroup(
                'Industry',
                industryOptions,
                selectedIndustry,
                onIndustryChange
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        paddingBottom: 16,
    },
    filterGroup: {
        marginBottom: 16,
    },
    filterGroupTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    filterOptionsContainer: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    filterOptionText: {
        fontSize: 12,
        fontWeight: '500',
    },
}); 