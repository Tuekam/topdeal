import type { SignInCredentials } from "../repositories/AuthSignInProvider";
import type { WebSessionResult } from "../repositories/WebSessionGateway";

export type SignInInput = SignInCredentials;
export type SignInResult = WebSessionResult | {
  status:
    | "invalid_credentials"
    | "cancelled"
    | "weak_password"
    | "email_already_associated"
    | "identity_unavailable";
};

export interface SignInUseCase {
  execute(input: SignInInput): Promise<SignInResult>;
}
