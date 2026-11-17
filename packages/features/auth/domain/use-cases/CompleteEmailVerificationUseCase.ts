import type { AuthSignInProvider } from "../interfaces/AuthSignInProvider";
import type { WebSessionGateway, WebSessionResult } from "../interfaces/WebSessionGateway";

type Dependencies = {
  signInProvider: AuthSignInProvider;
  webSessionGateway: WebSessionGateway;
};

export class CompleteEmailVerificationUseCase {
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
