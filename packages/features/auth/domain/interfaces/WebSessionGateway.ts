export type WebSessionResult =
  | { status: "authenticated" }
  | { status: "unauthenticated" }
  | { status: "email_unverified" }
  | { status: "registration_required" }
  | { status: "profile_required" }
  | { status: "account_unavailable" }
  | { status: "invalid_profile" }
  | { status: "profile_conflict" }
  | { status: "request_failed" };

export type CompleteProfileData = {
  givenName: string;
  familyName: string;
  telephone: string;
  birthDate: string;
};

export interface WebSessionGateway {
  create(identityToken: string): Promise<WebSessionResult>;
  completeProfile(identityToken: string, profile: CompleteProfileData): Promise<WebSessionResult>;
  checkRegistrationEligibility(identityToken: string): Promise<RegistrationEligibilityResult>;
}

export type RegistrationEligibilityResult =
  | { status: "registration_eligible" }
  | { status: "email_unverified" }
  | { status: "email_already_in_use" }
  | { status: "unauthenticated" }
  | { status: "request_failed" };
