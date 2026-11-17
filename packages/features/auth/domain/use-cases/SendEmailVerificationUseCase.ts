import type { AuthSignInProvider } from "../interfaces/AuthSignInProvider";
import { AuthSignInFailure } from "../errors/AuthSignInFailure";

type Dependencies = {
  signInProvider: AuthSignInProvider;
};

export type SendEmailVerificationResult = {
  status: "verification_email_sent" | "identity_unavailable" | "request_failed";
};

export class SendEmailVerificationUseCase {
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
