import type { AuthIdentityProvider } from "../../core/repositories/AuthIdentityProvider";
import type { AuthUserRepository } from "../../core/repositories/AuthUserRepository";
import type {
  VerifyWebSessionResult,
  VerifyWebSessionUseCase,
} from "../../core/usecases/VerifyWebSessionUseCase";

type Dependencies = {
  identityProvider: AuthIdentityProvider;
  userRepository: AuthUserRepository;
};

export class VerifyWebSessionUseCaseImpl implements VerifyWebSessionUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(sessionCookie: string | null): Promise<VerifyWebSessionResult> {
    if (!sessionCookie) return { status: "unauthenticated" };

    const identity = await this.dependencies.identityProvider.verifySessionCookie(
      sessionCookie,
    );
    if (!identity || !identity.emailVerified) {
      return { status: "unauthenticated" };
    }

    const account = await this.dependencies.userRepository.findByExternalIdentity(
      identity.externalId,
    );
    if (!account) return { status: "unauthenticated" };
    if (!account.profileComplete) return { status: "profile_required" };
    if (account.status !== "active") return { status: "account_unavailable" };

    return { status: "authenticated", userId: account.userId };
  }
}
