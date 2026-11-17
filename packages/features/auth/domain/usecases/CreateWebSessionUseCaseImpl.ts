import { AUTH_SESSION_MAX_AGE_MS } from "../../core/models/AuthSessionPolicy";
import type { AuthIdentityProvider } from "../../core/repositories/AuthIdentityProvider";
import type { AuthUserRepository } from "../../core/repositories/AuthUserRepository";
import type {
  CreateWebSessionInput,
  CreateWebSessionResult,
  CreateWebSessionUseCase,
} from "../../core/usecases/CreateWebSessionUseCase";

type Dependencies = {
  identityProvider: AuthIdentityProvider;
  userRepository: AuthUserRepository;
};

export class CreateWebSessionUseCaseImpl implements CreateWebSessionUseCase {
  private readonly dependencies: Dependencies;

  constructor(dependencies: Dependencies) {
    this.dependencies = dependencies;
  }

  async execute(input: CreateWebSessionInput): Promise<CreateWebSessionResult> {
    const identity = await this.dependencies.identityProvider.verifyIdentityToken(
      input.identityToken,
    );

    if (!identity) {
      return { status: "unauthenticated" };
    }

    if (!identity.email || !identity.emailVerified) {
      return { status: "email_unverified" };
    }

    const account = await this.dependencies.userRepository.findByExternalIdentity(
      identity.externalId,
    );

    if (!account) {
      return { status: "registration_required" };
    }

    if (!account.profileComplete) {
      return { status: "profile_required" };
    }

    if (account.status !== "active") {
      return { status: "account_unavailable" };
    }

    const sessionCookie =
      await this.dependencies.identityProvider.createSessionCookie(
        input.identityToken,
        AUTH_SESSION_MAX_AGE_MS,
      );

    return { status: "authenticated", sessionCookie };
  }
}
