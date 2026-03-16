import React from 'react';
import { StyleSheet, ViewStyle, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PostType } from '@/types';
import CustomOptionStrip from '../../ui/CustomOptionStrip';

interface PostTypeSelectorProps {
  selectedPostType: PostType;
  onPostTypeChange: (postType: PostType) => void;
  style?: ViewStyle;
}

export default function PostTypeSelector({ 
  selectedPostType, 
  onPostTypeChange,
  style,
}: PostTypeSelectorProps) {
  const postTypeOptions = [
    { icon: 'book-open', label: 'News', value: PostType.News },
    { icon: 'briefcase', label: 'Job', value: PostType.Job },
  ];

  // Find selected index by current postType
  const selectedIndex = postTypeOptions.findIndex(item => item.value === selectedPostType);

  // When option changes
  const handleTypeChange = (index: number) => {
    if (index < 0 || index >= postTypeOptions.length) return;
    onPostTypeChange(postTypeOptions[index].value);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <CustomOptionStrip
      visibleOptions={postTypeOptions}
      selectedIndex={selectedIndex}
      onChange={handleTypeChange}
      showMoreButton={false}
      style={[styles.selector, style]}
    />
  );
}

const styles = StyleSheet.create({
  selector: {
    marginBottom: 16,
  },
});
