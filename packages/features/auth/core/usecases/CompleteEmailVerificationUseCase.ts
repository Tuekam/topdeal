import type { WebSessionResult } from "../repositories/WebSessionGateway";

export interface CompleteEmailVerificationUseCase {
  execute(): Promise<WebSessionResult>;
}
