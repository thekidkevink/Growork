import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '../ThemedText';

export interface TimeFilterOption {
  label: string;
  value: string;
}

interface TimeFilterSelectorProps {
  options: TimeFilterOption[];
  selectedFilter: string;
  onFilterChange: (value: string) => void;
  title?: string;
  style?: ViewStyle;
}

export default function TimeFilterSelector({
  options,
  selectedFilter,
  onFilterChange,
  title,
  style,
}: TimeFilterSelectorProps) {
  return (
    <View style={[styles.container, style]}>
      {title && (
        <ThemedText style={styles.title}>{title}</ThemedText>
      )}
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              selectedFilter === option.value && styles.selectedOption,
            ]}
            onPress={() => onFilterChange(option.value)}
          >
            <ThemedText
              style={[
                styles.optionText,
                selectedFilter === option.value && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#525252',
    borderColor: '#525252',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
}); 
