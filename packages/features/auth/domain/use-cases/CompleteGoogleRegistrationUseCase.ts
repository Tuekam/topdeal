import type { AuthSignInProvider } from "../interfaces/AuthSignInProvider";
import type { WebSessionGateway } from "../interfaces/WebSessionGateway";
import { AuthSignInFailure } from "../errors/AuthSignInFailure";
import type { AuthRegistrationResult } from "./AuthRegistrationResult";

type Dependencies = {
  signInProvider: AuthSignInProvider;
  webSessionGateway: WebSessionGateway;
};

export type CompleteGoogleRegistrationResult = AuthRegistrationResult;

export class CompleteGoogleRegistrationUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(password: string): Promise<CompleteGoogleRegistrationResult> {
    try {
      await this.dependencies.signInProvider.linkEmailPasswordCredential(password);
      const identityToken = await this.dependencies.signInProvider.getCurrentIdentityToken();
      if (!identityToken) return { status: "identity_unavailable" };
      const result = await this.dependencies.webSessionGateway.checkRegistrationEligibility(identityToken);
      if (result.status !== "registration_eligible" && result.status !== "email_unverified") {
        await this.clearIdentity();
      }
      return result;
    } catch (error) {
      if (error instanceof AuthSignInFailure && (error.code === "weak_password" || error.code === "email_already_associated" || error.code === "identity_unavailable")) {
        return { status: error.code };
      }
      return { status: "request_failed" };
    }
  }

  private async clearIdentity(): Promise<void> {
    try {
      await this.dependencies.signInProvider.clearIdentity();
    } catch {
      // Aucun compte TopDeal ne doit être créé après un refus d'inscription.
    }
  }
}
