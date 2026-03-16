import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import TimeFilterSelector, { TimeFilterOption } from './TimeFilterSelector';

export interface FilterSelectorProps {
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  title: string;
  style?: ViewStyle;
}


export default function FilterSelector({
  options,
  selectedValue,
  onValueChange,
  title,
  style,
}: FilterSelectorProps) {
  // Convert string options to the format expected by TimeFilterSelector
  const filterOptions: TimeFilterOption[] = options.map(option => ({
    label: option,
    value: option,
  }));

  return (
    <View style={[styles.container, style]}>
      <TimeFilterSelector
        options={filterOptions}
        selectedFilter={selectedValue}
        onFilterChange={onValueChange}
        title={title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});