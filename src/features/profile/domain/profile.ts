export interface PublicProfile {
  id: string;
  username: string | null;
  firstName: string | null;
  surname: string | null;
  fullName: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  phone: string | null;
  location: string | null;
  profession: string | null;
  userType: 'user' | 'business' | 'admin';
}

export function getProfileDisplayName(profile: PublicProfile): string {
  const explicit = profile.fullName?.trim();
  if (explicit) {
    return explicit;
  }

  const composed = [profile.firstName, profile.surname]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (composed) {
    return composed;
  }

  return profile.username?.trim() || 'User';
}
