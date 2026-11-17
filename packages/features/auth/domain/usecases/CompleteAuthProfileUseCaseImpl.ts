import { AUTH_SESSION_MAX_AGE_MS } from "../../core/models/AuthSessionPolicy";
import type { AuthIdentityProvider } from "../../core/repositories/AuthIdentityProvider";
import type { AuthUserRepository, NewAuthProfile } from "../../core/repositories/AuthUserRepository";
import type {
  CompleteAuthProfileInput,
  CompleteAuthProfileResult,
  CompleteAuthProfileUseCase,
} from "../../core/usecases/CompleteAuthProfileUseCase";

type Dependencies = {
  identityProvider: AuthIdentityProvider;
  userRepository: AuthUserRepository;
};

function isValidBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const birthDate = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime()) || birthDate.toISOString().slice(0, 10) !== value) return false;

  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Douala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const parts = Object.fromEntries(dateParts.map((part) => [part.type, part.value]));
  const today = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00.000Z`);
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayHasPassed =
    today.getUTCMonth() > birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() >= birthDate.getUTCDate());
  if (!birthdayHasPassed) age -= 1;
  return age >= 18;
}

function validateProfile(input: CompleteAuthProfileInput): boolean {
  return (
    input.givenName.trim().length > 0 && input.givenName.trim().length <= 100 &&
    input.familyName.trim().length > 0 && input.familyName.trim().length <= 100 &&
    input.telephone.trim().length > 0 && input.telephone.trim().length <= 30 &&
    isValidBirthDate(input.birthDate)
  );
}

export class CompleteAuthProfileUseCaseImpl implements CompleteAuthProfileUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: CompleteAuthProfileInput): Promise<CompleteAuthProfileResult> {
    if (!validateProfile(input)) return { status: "invalid_profile" };

    const identity = await this.dependencies.identityProvider.verifyIdentityToken(input.identityToken);
    if (!identity) return { status: "unauthenticated" };
    if (!identity.email || !identity.emailVerified) return { status: "email_unverified" };

    const creationResult = await this.dependencies.userRepository.createProfileForExternalIdentity({
      externalId: identity.externalId,
      email: identity.email.trim().toLowerCase(),
      givenName: input.givenName.trim(),
      familyName: input.familyName.trim(),
      telephone: input.telephone.trim(),
      birthDate: input.birthDate,
    });

    if (creationResult !== "created") return { status: "profile_conflict" };

    const sessionCookie = await this.dependencies.identityProvider.createSessionCookie(
      input.identityToken,
      AUTH_SESSION_MAX_AGE_MS,
    );
    return { status: "authenticated", sessionCookie };
  }
}
