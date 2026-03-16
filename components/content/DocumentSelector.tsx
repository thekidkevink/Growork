import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks';
import { DocumentType } from '@/types';

interface DocumentSelectorProps {
  selectedType: DocumentType;
  onSelectType: (type: DocumentType) => void;
  disabled?: boolean;
}

const DOCUMENT_TYPES = [
  { type: DocumentType.CV, label: 'CV/Resume', icon: 'briefcase' },
  { type: DocumentType.CoverLetter, label: 'Cover Letter', icon: 'mail' },
  { type: DocumentType.Certificate, label: 'Certificate', icon: 'award' },
  { type: DocumentType.Other, label: 'Other', icon: 'file' },
];

export default function DocumentSelector({ selectedType, onSelectType, disabled = false }: DocumentSelectorProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Select Document Type
      </ThemedText>
      <View style={styles.optionsContainer}>
        {DOCUMENT_TYPES.map((docType) => (
          <TouchableOpacity
            key={docType.type}
            style={[
              styles.option,
              { borderColor },
              selectedType === docType.type && { backgroundColor: tintColor, borderColor: tintColor }
            ]}
            onPress={() => !disabled && onSelectType(docType.type)}
            disabled={disabled}
          >
            <Feather
              name={docType.icon as any}
              size={20}
              color={selectedType === docType.type ? backgroundColor : textColor}
            />
            <ThemedText
              style={[
                styles.optionText,
                { color: selectedType === docType.type ? backgroundColor : textColor }
              ]}
            >
              {docType.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    minWidth: 120,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 