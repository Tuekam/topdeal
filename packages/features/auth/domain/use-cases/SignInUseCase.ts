import type { AuthSignInProvider, SignInCredentials } from "../interfaces/AuthSignInProvider";
import type { WebSessionGateway, WebSessionResult } from "../interfaces/WebSessionGateway";
import { AuthSignInFailure } from "../errors/AuthSignInFailure";

type Dependencies = {
  signInProvider: AuthSignInProvider;
  webSessionGateway: WebSessionGateway;
};

export type SignInInput = SignInCredentials;
export type SignInResult = WebSessionResult | {
  status:
    | "invalid_credentials"
    | "cancelled"
    | "weak_password"
    | "email_already_associated"
    | "identity_unavailable";
};

export class SignInUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: SignInInput): Promise<SignInResult> {
    let result: SignInResult = { status: "request_failed" };

    try {
      const identityToken = await this.dependencies.signInProvider.getIdentityToken(input);
      result = await this.dependencies.webSessionGateway.create(identityToken);
    } catch (error) {
      result = error instanceof AuthSignInFailure
        ? { status: error.code }
        : { status: "request_failed" };
    }

    if (
      result.status !== "profile_required" &&
      result.status !== "email_unverified"
    ) {
      try {
        await this.dependencies.signInProvider.clearIdentity();
      } catch {
        // La session serveur reste l'unique session applicative.
      }
    }

    return result;
  }
}
