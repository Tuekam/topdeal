import type { AuthRegistrationResult } from "../models/AuthRegistrationResult";

export type BeginAuthRegistrationInput =
  | { method: "google" }
  | { method: "email_password"; email: string; password: string };

export type BeginAuthRegistrationResult = AuthRegistrationResult;

export interface BeginAuthRegistrationUseCase {
  execute(input: BeginAuthRegistrationInput): Promise<BeginAuthRegistrationResult>;
}
