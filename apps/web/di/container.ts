import {
  asClass,
  asValue,
  createContainer,
  InjectionMode,
  type AwilixContainer,
} from "awilix";
import { createDatabaseClient } from "@topdeal/database";
import {
  FirebaseAdminIdentityProvider,
  PrismaAuthUserRepository,
} from "@topdeal/feature-auth/data";
import { CheckAuthRegistrationEligibilityUseCase, CompleteAuthProfileUseCase, CreateWebSessionUseCase } from "@topdeal/feature-auth/domain";
import type { AuthCradle } from "./types";

let containerInstance: AwilixContainer<AuthCradle> | null = null;

export function buildContainer(): AwilixContainer<AuthCradle> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for the Auth feature.");
  }

  const container = createContainer<AuthCradle>({
    injectionMode: InjectionMode.PROXY,
  });

  container.register({
    prisma: asValue(createDatabaseClient(connectionString)),
    identityProvider: asClass(FirebaseAdminIdentityProvider).singleton(),
    userRepository: asClass(PrismaAuthUserRepository).singleton(),
    createWebSessionUseCase: asClass(CreateWebSessionUseCase).singleton(),
    checkAuthRegistrationEligibilityUseCase: asClass(CheckAuthRegistrationEligibilityUseCase).singleton(),
    completeAuthProfileUseCase: asClass(CompleteAuthProfileUseCase).singleton(),
  });

  return container;
}

export function getContainer(): AwilixContainer<AuthCradle> {
  if (!containerInstance) {
    containerInstance = buildContainer();
  }

  return containerInstance;
}

export function resolveCreateWebSessionUseCase(): CreateWebSessionUseCase {
  return getContainer().resolve("createWebSessionUseCase");
}

export function resolveCheckAuthRegistrationEligibilityUseCase(): CheckAuthRegistrationEligibilityUseCase {
  return getContainer().resolve("checkAuthRegistrationEligibilityUseCase");
}

export function resolveCompleteAuthProfileUseCase(): CompleteAuthProfileUseCase {
  return getContainer().resolve("completeAuthProfileUseCase");
}
