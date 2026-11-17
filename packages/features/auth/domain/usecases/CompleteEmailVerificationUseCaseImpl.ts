import type { AuthSignInProvider } from "../../core/repositories/AuthSignInProvider";
import type { WebSessionGateway, WebSessionResult } from "../../core/repositories/WebSessionGateway";
import type { CompleteEmailVerificationUseCase } from "../../core/usecases/CompleteEmailVerificationUseCase";

type Dependencies = {
  signInProvider: AuthSignInProvider;
  webSessionGateway: WebSessionGateway;
};

export class CompleteEmailVerificationUseCaseImpl implements CompleteEmailVerificationUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(): Promise<WebSessionResult> {
    try {
      const identity = await this.dependencies.signInProvider.refreshCurrentIdentity();
      if (!identity) return { status: "unauthenticated" };
      if (!identity.emailVerified) return { status: "email_unverified" };

      const result = await this.dependencies.webSessionGateway.create(identity.identityToken);
      if (result.status !== "profile_required" && result.status !== "email_unverified") {
        try {
          await this.dependencies.signInProvider.clearIdentity();
        } catch {
          // La session serveur reste l'unique session applicative.
        }
      }
      return result;
    } catch {
      return { status: "request_failed" };
    }
  }
}
