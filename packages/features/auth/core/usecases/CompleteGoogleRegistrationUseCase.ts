import type { AuthRegistrationResult } from "../models/AuthRegistrationResult";

export type CompleteGoogleRegistrationResult = AuthRegistrationResult;

export interface CompleteGoogleRegistrationUseCase {
  execute(password: string): Promise<CompleteGoogleRegistrationResult>;
}
