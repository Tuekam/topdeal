import type { AuthSignInProvider } from "../../core/repositories/AuthSignInProvider";
import type { WebSessionGateway } from "../../core/repositories/WebSessionGateway";
import type {
  CompleteAuthProfileFromWebInput,
  CompleteAuthProfileFromWebResult,
  CompleteAuthProfileFromWebUseCase,
} from "../../core/usecases/CompleteAuthProfileFromWebUseCase";

type Dependencies = {
  signInProvider: AuthSignInProvider;
  webSessionGateway: WebSessionGateway;
};

export class CompleteAuthProfileFromWebUseCaseImpl implements CompleteAuthProfileFromWebUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: CompleteAuthProfileFromWebInput): Promise<CompleteAuthProfileFromWebResult> {
    try {
      const identityToken = await this.dependencies.signInProvider.getCurrentIdentityToken();
      if (!identityToken) return { status: "unauthenticated" };

      const result = await this.dependencies.webSessionGateway.completeProfile(identityToken, input);
      if (result.status === "authenticated") {
        try {
          await this.dependencies.signInProvider.clearIdentity();
        } catch {
          // La session serveur a déjà été créée ; l’identité Firebase est en mémoire uniquement.
        }
      }
      return result;
    } catch {
      return { status: "request_failed" };
    }
  }
}
