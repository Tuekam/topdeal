import type { AuthSignInProvider } from "../interfaces/AuthSignInProvider";
import type { CompleteProfileData, WebSessionGateway, WebSessionResult } from "../interfaces/WebSessionGateway";

type Dependencies = {
  signInProvider: AuthSignInProvider;
  webSessionGateway: WebSessionGateway;
};

export type CompleteAuthProfileFromWebInput = CompleteProfileData;
export type CompleteAuthProfileFromWebResult = WebSessionResult;

export class CompleteAuthProfileFromWebUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: CompleteAuthProfileFromWebInput): Promise<CompleteAuthProfileFromWebResult> {
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
  }
}
