import type { AuthIdentityProvider } from "../interfaces/AuthIdentityProvider";
import type { AuthUserRepository } from "../interfaces/AuthUserRepository";

type Dependencies = {
  identityProvider: AuthIdentityProvider;
  userRepository: AuthUserRepository;
};

export type CheckAuthRegistrationEligibilityResult =
  | { status: "registration_eligible" }
  | { status: "unauthenticated" }
  | { status: "email_unverified" }
  | { status: "email_already_in_use" };

export class CheckAuthRegistrationEligibilityUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(identityToken: string): Promise<CheckAuthRegistrationEligibilityResult> {
    const identity = await this.dependencies.identityProvider.verifyIdentityToken(identityToken);
    if (!identity) return { status: "unauthenticated" };
    if (!identity.email || !identity.emailVerified) return { status: "email_unverified" };

    const linkedAccount = await this.dependencies.userRepository.findByExternalIdentity(identity.externalId);
    if (linkedAccount) {
      return linkedAccount.profileComplete
        ? { status: "email_already_in_use" }
        : { status: "registration_eligible" };
    }

    const emailAlreadyUsed = await this.dependencies.userRepository.isEmailAlreadyUsed(
      identity.email.trim().toLowerCase(),
    );
    return emailAlreadyUsed
      ? { status: "email_already_in_use" }
      : { status: "registration_eligible" };
  }
}
