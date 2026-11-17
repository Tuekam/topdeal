export type CheckAuthRegistrationEligibilityResult =
  | { status: "registration_eligible" }
  | { status: "unauthenticated" }
  | { status: "email_unverified" }
  | { status: "email_already_in_use" };

export interface CheckAuthRegistrationEligibilityUseCase {
  execute(identityToken: string): Promise<CheckAuthRegistrationEligibilityResult>;
}
