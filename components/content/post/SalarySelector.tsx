import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SALARY_RANGES } from '@/dataset/salaryRanges';
import BadgeSelector, { BadgeOption } from '@/components/ui/BadgeSelector';

interface SalarySelectorProps {
  selectedSalary: string;
  onSalaryChange: (salary: string) => void;
  style?: ViewStyle;
}

export default function SalarySelector({
  selectedSalary,
  onSalaryChange,
  style,
}: SalarySelectorProps) {
  // If SALARY_RANGES is an array of strings, map to BadgeOption.
  const salaryOptions: BadgeOption[] = SALARY_RANGES.map((range) => ({
    label: range,
    value: range,
    // Optionally: icon: 'dollar-sign',
  }));

  return (
    <BadgeSelector
      options={salaryOptions}
      selectedValue={selectedSalary}
      onValueChange={onSalaryChange}
      style={style}
      title="Salary Range"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
