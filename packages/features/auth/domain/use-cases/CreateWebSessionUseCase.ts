import type { AuthIdentityProvider } from "../interfaces/AuthIdentityProvider";
import type { AuthUserRepository } from "../interfaces/AuthUserRepository";
import { AUTH_SESSION_MAX_AGE_MS } from "../sessionPolicy.ts";

type Dependencies = {
  identityProvider: AuthIdentityProvider;
  userRepository: AuthUserRepository;
};

type Input = {
  identityToken: string;
};

export type CreateWebSessionResult =
  | { status: "authenticated"; sessionCookie: string }
  | { status: "unauthenticated" }
  | { status: "email_unverified" }
  | { status: "registration_required" }
  | { status: "profile_required" }
  | { status: "account_unavailable" };

export class CreateWebSessionUseCase {
  private readonly dependencies: Dependencies;

  constructor(dependencies: Dependencies) {
    this.dependencies = dependencies;
  }

  async execute(input: Input): Promise<CreateWebSessionResult> {
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
