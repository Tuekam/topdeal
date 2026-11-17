import type { RegistrationEligibilityResult } from "../repositories/WebSessionGateway";

export interface CheckRegistrationEligibilityUseCase {
  execute(): Promise<RegistrationEligibilityResult>;
}
