import type { SignupCredentialsInput, SignupProfileInput, SignupResult } from '@/src/features/auth/domain/signup';

export const signupRoutes = {
  email: '/auth/email',
  profile: '/auth/username',
  success: '/auth/success',
  login: '/auth/login',
} as const;

export function buildSignupFlow() {
  return {
    steps: [
      {
        key: 'credentials',
        route: signupRoutes.email,
        fields: ['email', 'password'] as const,
      },
      {
        key: 'profile',
        route: signupRoutes.profile,
        fields: ['firstName', 'surname', 'dateOfBirth', 'contactNumber'] as const,
      },
      {
        key: 'success',
        route: signupRoutes.success,
        fields: [] as const,
      },
    ],
  };
}

export function mapSignupPayload(
  credentials: SignupCredentialsInput,
  profile: SignupProfileInput
) {
  return {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
    metadata: {
      name: profile.firstName.trim(),
      surname: profile.surname.trim(),
      date_of_birth: profile.dateOfBirth.trim(),
      phone: profile.contactNumber.trim(),
    },
  };
}

export function buildSignupResult(userId: string): SignupResult {
  return {
    userId,
    requiresEmailVerification: true,
    nextRoute: signupRoutes.success,
  };
}
