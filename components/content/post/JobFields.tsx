import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedInput } from '@/components/ThemedInput';
import JobTypeSelector from './JobTypeSelector';
import SalarySelector from './SalarySelector';
import IndustrySelector from './IndustrySelector';
import CompanySelector, { CompanySelectorData } from './CompanySelector';
import { INDUSTRIES } from '@/dataset/industries';

export interface JobFieldsData {
  location: string;
  salary: string;
  jobType: string;
  industry: string;
  company: string;
  companyId?: string;
}

interface JobFieldsProps {
  values: JobFieldsData;
  onChange: (values: JobFieldsData) => void;
  style?: ViewStyle;
}

export default function JobFields({ values, onChange, style }: JobFieldsProps) {
  const handleChange = (field: keyof JobFieldsData, value: string) => {
    onChange({ ...values, [field]: value });
  };

  const handleCompanyChange = (companyData: CompanySelectorData) => {
    onChange({
      ...values,
      company: companyData.company,
      companyId: companyData.companyId,
    });
  };

  return (
    <View style={[styles.container, style]}>
      <CompanySelector
        values={{ company: values.company, companyId: values.companyId }}
        onChange={handleCompanyChange}
      />
      <ThemedInput
        placeholder="Location (e.g., Remote, New York, NY)"
        value={values.location}
        onChangeText={(v) => handleChange('location', v)}
      />
      <SalarySelector
        selectedSalary={values.salary}
        onSalaryChange={(v) => handleChange('salary', v)}
      />
      <JobTypeSelector
        selectedJobType={values.jobType}
        onJobTypeChange={(v: string) => handleChange('jobType', v)}
      />
      <IndustrySelector
        selectedIndustry={values.industry}
        onIndustryChange={(v) => handleChange('industry', v)}
        industries={INDUSTRIES}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
});