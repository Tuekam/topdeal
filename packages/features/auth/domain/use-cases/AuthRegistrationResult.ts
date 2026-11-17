import type { RegistrationEligibilityResult } from "../interfaces/WebSessionGateway";

export type AuthRegistrationResult = RegistrationEligibilityResult | {
  status:
    | "authenticated"
    | "account_unavailable"
    | "registration_required"
    | "profile_required"
    | "invalid_profile"
    | "profile_conflict"
    | "password_setup_required"
    | "email_verification_required"
    | "email_already_associated"
    | "weak_password"
    | "cancelled"
    | "identity_unavailable";
};
