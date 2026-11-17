export type AuthSignInFailureCode =
  | "invalid_credentials"
  | "cancelled"
  | "weak_password"
  | "email_already_associated"
  | "identity_unavailable";

export class AuthSignInFailure extends Error {
  constructor(readonly code: AuthSignInFailureCode) {
    super(code);
    this.name = "AuthSignInFailure";
  }
}
