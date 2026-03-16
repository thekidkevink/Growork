export interface DeadlineOption {
  label: string;
  value: string;
}

export const DEADLINE_OPTIONS: string[] = [
  'No Deadline',
  'ASAP',
  'Within 1 week',
  'Within 2 weeks',
  'Within 1 month',
  'Within 3 months',
  'Ongoing',
  'Until filled',
];

export const DEADLINE_OPTIONS_WITH_ICONS: DeadlineOption[] = [
  { label: 'No Deadline', value: 'No Deadline' },
  { label: 'ASAP', value: 'ASAP' },
  { label: 'Within 1 week', value: 'Within 1 week' },
  { label: 'Within 2 weeks', value: 'Within 2 weeks' },
  { label: 'Within 1 month', value: 'Within 1 month' },
  { label: 'Within 3 months', value: 'Within 3 months' },
  { label: 'Ongoing', value: 'Ongoing' },
  { label: 'Until filled', value: 'Until filled' },
]; 