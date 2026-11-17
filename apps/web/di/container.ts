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
  AuthUserRepositoryImpl,
} from "@topdeal/feature-auth/data";
import {
  CheckAuthRegistrationEligibilityUseCaseImpl,
  CompleteAuthProfileUseCaseImpl,
  CreateWebSessionUseCaseImpl,
} from "@topdeal/feature-auth/domain";
import type {
  CheckAuthRegistrationEligibilityUseCase,
  CompleteAuthProfileUseCase,
  CreateWebSessionUseCase,
} from "@topdeal/feature-auth/core";
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
    userRepository: asClass(AuthUserRepositoryImpl).singleton(),
    createWebSessionUseCase: asClass(CreateWebSessionUseCaseImpl).singleton(),
    checkAuthRegistrationEligibilityUseCase: asClass(CheckAuthRegistrationEligibilityUseCaseImpl).singleton(),
    completeAuthProfileUseCase: asClass(CompleteAuthProfileUseCaseImpl).singleton(),
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
