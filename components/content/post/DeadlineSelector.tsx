import React from 'react';
import { ViewStyle } from 'react-native';
import BadgeSelector, { BadgeOption } from '@/components/ui/BadgeSelector';
import { DEADLINE_OPTIONS } from '@/dataset/deadlineOptions';

interface DeadlineSelectorProps {
  selectedDeadline: string;
  onDeadlineChange: (deadline: string) => void;
  style?: ViewStyle;
}

export default function DeadlineSelector({
  selectedDeadline,
  onDeadlineChange,
  style,
}: DeadlineSelectorProps) {
  const deadlineOptions: BadgeOption[] = DEADLINE_OPTIONS.map(option => ({
    label: option,
    value: option,
  }));

  return (
    <BadgeSelector
      options={deadlineOptions}
      selectedValue={selectedDeadline}
      onValueChange={onDeadlineChange}
      style={style}
      title="Application Deadline"
    />
  );
}
