import type { PrismaClient } from "@topdeal/database";
import type {
  FirebaseAdminIdentityProvider,
  PrismaAuthUserRepository,
} from "@topdeal/feature-auth/data";
import type { CheckAuthRegistrationEligibilityUseCase, CompleteAuthProfileUseCase, CreateWebSessionUseCase } from "@topdeal/feature-auth/domain";

export type AuthCradle = {
  prisma: PrismaClient;
  identityProvider: FirebaseAdminIdentityProvider;
  userRepository: PrismaAuthUserRepository;
  createWebSessionUseCase: CreateWebSessionUseCase;
  checkAuthRegistrationEligibilityUseCase: CheckAuthRegistrationEligibilityUseCase;
  completeAuthProfileUseCase: CompleteAuthProfileUseCase;
};
