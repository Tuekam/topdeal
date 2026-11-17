import { AuthSignInFailure } from "../../core/models/AuthSignInFailure";
import type { AuthSignInProvider } from "../../core/repositories/AuthSignInProvider";
import type { WebSessionGateway } from "../../core/repositories/WebSessionGateway";
import type { SignInInput, SignInResult, SignInUseCase } from "../../core/usecases/SignInUseCase";

type Dependencies = {
  signInProvider: AuthSignInProvider;
  webSessionGateway: WebSessionGateway;
};

export class SignInUseCaseImpl implements SignInUseCase {
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
