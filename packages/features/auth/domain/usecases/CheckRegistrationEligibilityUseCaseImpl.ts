import type { AuthSignInProvider } from "../../core/repositories/AuthSignInProvider";
import type { RegistrationEligibilityResult, WebSessionGateway } from "../../core/repositories/WebSessionGateway";
import type { CheckRegistrationEligibilityUseCase } from "../../core/usecases/CheckRegistrationEligibilityUseCase";

type Dependencies = {
  signInProvider: AuthSignInProvider;
  webSessionGateway: WebSessionGateway;
};

export class CheckRegistrationEligibilityUseCaseImpl implements CheckRegistrationEligibilityUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(): Promise<RegistrationEligibilityResult> {
    try {
      const identity = await this.dependencies.signInProvider.refreshCurrentIdentity();
      if (!identity) return { status: "unauthenticated" };
      if (!identity.emailVerified) return { status: "email_unverified" };

      const result = await this.dependencies.webSessionGateway.checkRegistrationEligibility(identity.identityToken);
      if (result.status !== "registration_eligible" && result.status !== "email_unverified") {
        try {
          await this.dependencies.signInProvider.clearIdentity();
        } catch {
          // La session Firebase reste locale au navigateur et ne donne aucun accès TopDeal.
        }
      }
      return result;
    } catch {
      return { status: "request_failed" };
    }
  }
}
