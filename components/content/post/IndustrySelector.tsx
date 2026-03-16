import React from 'react';
import BadgeSelector, { BadgeOption } from '@/components/ui/BadgeSelector';
import { Industry } from '@/dataset/industries';

interface IndustrySelectorProps {
  industries: Industry[];
  selectedIndustry: string;
  onIndustryChange: (industry: string) => void;
  style?: any;
}

export default function IndustrySelector({
  industries,
  selectedIndustry,
  onIndustryChange,
  style,
}: IndustrySelectorProps) {
  const options: BadgeOption[] = industries.map((industry) => ({
    label: industry.label,
    value: industry.label,
    icon: industry.icon,
  }));

  const selectedValue = selectedIndustry;

  return (
    <BadgeSelector
      options={options}
      selectedValue={selectedValue}
      onValueChange={onIndustryChange}
      style={style}
      title="Industry"
    />
  );
}
