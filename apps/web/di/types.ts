import type { PrismaClient } from "@topdeal/database";
import type {
  AuthIdentityProvider,
  AuthUserRepository,
  CheckAuthRegistrationEligibilityUseCase,
  CompleteAuthProfileUseCase,
  CreateWebSessionUseCase,
} from "@topdeal/feature-auth/core";

export type AuthCradle = {
  prisma: PrismaClient;
  identityProvider: AuthIdentityProvider;
  userRepository: AuthUserRepository;
  createWebSessionUseCase: CreateWebSessionUseCase;
  checkAuthRegistrationEligibilityUseCase: CheckAuthRegistrationEligibilityUseCase;
  completeAuthProfileUseCase: CompleteAuthProfileUseCase;
};
