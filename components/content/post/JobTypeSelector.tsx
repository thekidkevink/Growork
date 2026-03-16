import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { JOB_TYPES } from '@/dataset/jobTypes';
import FilterSelector from '@/components/ui/FilterSelector';

interface JobTypeSelectorProps {
  selectedJobType: string;
  onJobTypeChange: (jobType: string) => void;
  style?: ViewStyle;
}

export default function JobTypeSelector({
  selectedJobType,
  onJobTypeChange,
  style,
}: JobTypeSelectorProps) {

  return (
    <View style={[styles.container, style]}>
      <FilterSelector
        options={JOB_TYPES}
        selectedValue={selectedJobType}
        onValueChange={onJobTypeChange}
        title="Job Type"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});