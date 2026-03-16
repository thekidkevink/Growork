import { Profile } from '@/types';

export interface ProfileCompletenessResult {
    isComplete: boolean;
    missingRequired: Array<keyof Profile>;
    missingRecommended: Array<keyof Profile>;
    completionPercent: number; // 0-100
}

const requiredFields: Array<keyof Profile> = [
    'name',
    'surname',
    'username',
];

const recommendedFields: Array<keyof Profile> = [
    'bio',
    'avatar_url',
    'profession',
    'location',
    'website',
];

export function checkProfileCompleteness(profile?: Profile | null): ProfileCompletenessResult {
    if (!profile) {
        return {
            isComplete: false,
            missingRequired: requiredFields,
            missingRecommended: recommendedFields,
            completionPercent: 0,
        };
    }

    const missingRequired = requiredFields.filter((key) => {
        const value = profile[key] as unknown as string | null | undefined;
        return !value || String(value).trim().length === 0;
    });

    const missingRecommended = recommendedFields.filter((key) => {
        const value = profile[key] as unknown as string | null | undefined;
        return !value || String(value).trim().length === 0;
    });

    const totalWeights = requiredFields.length * 2 + recommendedFields.length; // weight required x2
    const filledRequired = requiredFields.length - missingRequired.length;
    const filledRecommended = recommendedFields.length - missingRecommended.length;
    const score = filledRequired * 2 + filledRecommended;
    const completionPercent = Math.round((score / totalWeights) * 100);

    return {
        isComplete: missingRequired.length === 0,
        missingRequired,
        missingRecommended,
        completionPercent,
    };
}

