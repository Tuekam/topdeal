import { AuthSignInFailure } from "../../core/models/AuthSignInFailure";
import type { AuthSignInProvider } from "../../core/repositories/AuthSignInProvider";
import type { WebSessionGateway } from "../../core/repositories/WebSessionGateway";
import type {
  BeginAuthRegistrationInput,
  BeginAuthRegistrationResult,
  BeginAuthRegistrationUseCase,
} from "../../core/usecases/BeginAuthRegistrationUseCase";

type Dependencies = {
  signInProvider: AuthSignInProvider;
  webSessionGateway: WebSessionGateway;
};

export class BeginAuthRegistrationUseCaseImpl implements BeginAuthRegistrationUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: BeginAuthRegistrationInput): Promise<BeginAuthRegistrationResult> {
    try {
      if (input.method === "email_password") {
        await this.dependencies.signInProvider.createEmailPasswordIdentity(input.email, input.password);
        try {
          await this.dependencies.signInProvider.sendEmailVerification();
        } catch {
          // L'écran de vérification permet de relancer l'envoi sans recréer l'identité Firebase.
        }
        return { status: "email_verification_required" };
      }

      await this.dependencies.signInProvider.getIdentityToken({ method: "google" });
      const eligibility = await this.checkEligibility();
      if (eligibility.status === "email_already_in_use") return eligibility;
      if (!this.dependencies.signInProvider.hasEmailPasswordCredential()) {
        return { status: "password_setup_required" };
      }
      return eligibility;
    } catch (error) {
      if (error instanceof AuthSignInFailure) {
        if (error.code === "cancelled") return { status: "cancelled" };
        if (error.code === "email_already_associated") return { status: "email_already_associated" };
        if (error.code === "weak_password") return { status: "weak_password" };
      }
      return { status: "request_failed" };
    }
  }

  private async checkEligibility(): Promise<BeginAuthRegistrationResult> {
    const identityToken = await this.dependencies.signInProvider.getCurrentIdentityToken();
    return identityToken
      ? this.dependencies.webSessionGateway.checkRegistrationEligibility(identityToken)
      : { status: "unauthenticated" };
  }
}
