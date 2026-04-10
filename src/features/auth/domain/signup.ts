export interface SignupCredentialsInput {
  email: string;
  password: string;
}

export interface SignupProfileInput {
  firstName: string;
  surname: string;
  dateOfBirth: string;
  contactNumber: string;
}

export interface SignupDraft {
  credentials: SignupCredentialsInput;
  profile: SignupProfileInput;
}

export interface SignupResult {
  userId: string;
  requiresEmailVerification: boolean;
  nextRoute: string;
}
