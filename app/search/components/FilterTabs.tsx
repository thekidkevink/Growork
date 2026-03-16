
import React from 'react';
import { FilterKey } from '@/constants/searchConfig';
import CategorySelector from '@/components/ui/CategorySelector';
import { View } from 'react-native';

interface FilterOption {
  key: FilterKey;
  label: string;
}

interface FilterTabsProps {
  options: readonly FilterOption[];
  selectedFilter: FilterKey;
  setSelectedFilter: React.Dispatch<React.SetStateAction<FilterKey>>;
  counts: Record<FilterKey, number>;
}

export default function FilterTabs({ 
  options, 
  selectedFilter, 
  setSelectedFilter,
  counts 
}: FilterTabsProps) {
  const categoryOptions = options.map(option => 
    `${option.label} ${counts[option.key] > 0 ? `(${counts[option.key]})` : ''}`
  );

  const selectedIndex = options.findIndex(option => option.key === selectedFilter);

  const handleCategoryChange = (index: number) => {
    setSelectedFilter(options[index].key);
  };

  return (
    <View style={{ marginVertical: 12 }}>
      <CategorySelector
        options={categoryOptions}
        selectedIndex={selectedIndex}
        onChange={handleCategoryChange}
      />
    </View>
  );
}