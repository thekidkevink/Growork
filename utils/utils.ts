import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateProfileStrength(profile: any): {
  percentage: number;
  level: string;
  description: string;
  missingFields: string[];
} {
  if (!profile) {
    return {
      percentage: 0,
      level: 'Incomplete',
      description: 'No profile data available',
      missingFields: ['All fields']
    };
  }

  const fields = [
    { key: 'name', label: 'Full Name', weight: 10 },
    { key: 'surname', label: 'Surname', weight: 10 },
    { key: 'username', label: 'Username', weight: 8 },
    { key: 'avatar_url', label: 'Profile Picture', weight: 8 },
    { key: 'bio', label: 'Bio', weight: 12 },
    { key: 'profession', label: 'Profession', weight: 15 },
    { key: 'experience_years', label: 'Experience', weight: 12 },
    { key: 'education', label: 'Education', weight: 10 },
    { key: 'skills', label: 'Skills', weight: 8 },
    { key: 'location', label: 'Location', weight: 7 },
    { key: 'website', label: 'Website', weight: 5 },
    { key: 'phone', label: 'Phone', weight: 5 }
  ];

  let totalScore = 0;
  let totalWeight = 0;
  const missingFields: string[] = [];

  fields.forEach(field => {
    totalWeight += field.weight;
    const value = profile[field.key];

    if (value &&
      (typeof value === 'string' ? value.trim() !== '' : true) &&
      (Array.isArray(value) ? value.length > 0 : true)) {
      totalScore += field.weight;
    } else {
      missingFields.push(field.label);
    }
  });

  const percentage = Math.round((totalScore / totalWeight) * 100);

  let level: string;
  let description: string;

  if (percentage >= 90) {
    level = 'Excellent';
    description = 'Your profile is optimized for job searching';
  } else if (percentage >= 75) {
    level = 'Good';
    description = 'Your profile is well-rounded';
  } else if (percentage >= 50) {
    level = 'Fair';
    description = 'Add more details to improve your profile';
  } else if (percentage >= 25) {
    level = 'Basic';
    description = 'Your profile needs more information';
  } else {
    level = 'Incomplete';
    description = 'Complete your profile to get started';
  }

  return {
    percentage,
    level,
    description,
    missingFields
  };
}

export function formatUserDetails(profile: any): {
  subtitle: string;
  details: Array<{ label: string; value: string; icon: string }>;
} {
  if (!profile) {
    return {
      subtitle: 'No profile information',
      details: []
    };
  }

  const details: { label: string; value: string; icon: string }[] = [];

  // Build subtitle
  const subtitleParts = [];
  if (profile.profession) subtitleParts.push(profile.profession);
  if (profile.location) subtitleParts.push(profile.location);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' • ') : 'No profession or location set';

  // Bio is handled separately in the header

  if (profile.profession) {
    details.push({ label: 'Profession', value: profile.profession, icon: 'briefcase' });
  }

  if (profile.experience_years !== null && profile.experience_years !== undefined) {
    const years = profile.experience_years;
    const experienceText = years === 1 ? '1 year' : `${years} years`;
    details.push({ label: 'Experience', value: experienceText, icon: 'clock' });
  }

  if (profile.education) {
    details.push({ label: 'Education', value: profile.education, icon: 'book' });
  }

  if (profile.skills && profile.skills.length > 0) {
    details.push({ label: 'Skills', value: profile.skills.join(', '), icon: 'award' });
  }

  if (profile.location) {
    details.push({ label: 'Location', value: profile.location, icon: 'map-pin' });
  }

  if (profile.website) {
    details.push({ label: 'Website', value: profile.website, icon: 'globe' });
  }

  if (profile.phone) {
    details.push({ label: 'Phone', value: profile.phone, icon: 'phone' });
  }

  return { subtitle, details };
}
