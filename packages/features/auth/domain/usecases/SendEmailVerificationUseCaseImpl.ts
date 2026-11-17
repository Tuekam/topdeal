import { AuthSignInFailure } from "../../core/models/AuthSignInFailure";
import type { AuthSignInProvider } from "../../core/repositories/AuthSignInProvider";
import type {
  SendEmailVerificationResult,
  SendEmailVerificationUseCase,
} from "../../core/usecases/SendEmailVerificationUseCase";

type Dependencies = {
  signInProvider: AuthSignInProvider;
};

export class SendEmailVerificationUseCaseImpl implements SendEmailVerificationUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(): Promise<SendEmailVerificationResult> {
    try {
      await this.dependencies.signInProvider.sendEmailVerification();
      return { status: "verification_email_sent" };
    } catch (error) {
      if (error instanceof AuthSignInFailure && error.code === "identity_unavailable") {
        return { status: "identity_unavailable" };
      }
      return { status: "request_failed" };
    }
  }
}
