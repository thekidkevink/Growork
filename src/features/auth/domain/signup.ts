export interface SignupCredentialsInput {
  email: string;
  password: string;
}

export interface SignupProfileInput {
  username: string;
  firstName: string;
  surname: string;
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
