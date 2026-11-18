import {
  asClass,
  asValue,
  createContainer,
  InjectionMode,
  type AwilixContainer,
} from "awilix";
import { createDatabaseClient } from "@topdeal/database";
import {
  CreateAnnonceRepositoryImpl,
  GetActiveAnnonceCategoriesRepositoryImpl,
  GetPublicAnnonceRepositoryImpl,
  SearchAnnoncesRepositoryImpl,
  UpdateAnnonceRepositoryImpl,
  ChangeAnnonceVisibilityRepositoryImpl,
  GetOwnedAnnoncesRepositoryImpl,
  GetOwnedAnnonceForEditRepositoryImpl,
  S3AnnoncePhotoStorage,
  SetAnnonceFavoriteRepositoryImpl,
  GetAnnonceFavoriteIdsRepositoryImpl,
  GetFavoriteAnnoncesRepositoryImpl,
} from "@topdeal/feature-annonce/data";
import { AnnonceAffiliateLinkRepositoryImpl } from "@topdeal/feature-affiliation/data";
import {
  CreateAnnonceUseCaseImpl,
  GetPublicAnnonceUseCaseImpl,
  GetActiveAnnonceCategoriesUseCaseImpl,
  SearchAnnoncesUseCaseImpl,
  UpdateAnnonceUseCaseImpl,
  ChangeAnnonceVisibilityUseCaseImpl,
  GetOwnedAnnoncesUseCaseImpl,
  GetOwnedAnnonceForEditUseCaseImpl,
  SetAnnonceFavoriteUseCaseImpl,
  GetAnnonceFavoriteIdsUseCaseImpl,
  GetFavoriteAnnoncesUseCaseImpl,
} from "@topdeal/feature-annonce/domain";
import { CreateAnnonceAffiliateLinkUseCaseImpl, GetAnnonceAffiliatePriceUseCaseImpl } from "@topdeal/feature-affiliation/domain";
import type {
  CreateAnnonceUseCase,
  GetPublicAnnonceUseCase,
  GetActiveAnnonceCategoriesUseCase,
  SearchAnnoncesUseCase,
  UpdateAnnonceUseCase,
  ChangeAnnonceVisibilityUseCase,
  GetOwnedAnnoncesUseCase,
  GetOwnedAnnonceForEditUseCase,
  SetAnnonceFavoriteUseCase,
  GetAnnonceFavoriteIdsUseCase,
  GetFavoriteAnnoncesUseCase,
} from "@topdeal/feature-annonce/core";
import type {
  CreateAnnonceAffiliateLinkUseCase,
  GetAnnonceAffiliatePriceUseCase,
} from "@topdeal/feature-affiliation/core";
import {
  FirebaseAdminIdentityProvider,
  AuthUserRepositoryImpl,
} from "@topdeal/feature-auth/data";
import {
  CheckAuthRegistrationEligibilityUseCaseImpl,
  CompleteAuthProfileUseCaseImpl,
  CreateWebSessionUseCaseImpl,
  VerifyWebSessionUseCaseImpl,
} from "@topdeal/feature-auth/domain";
import type {
  CheckAuthRegistrationEligibilityUseCase,
  CompleteAuthProfileUseCase,
  CreateWebSessionUseCase,
  VerifyWebSessionUseCase,
} from "@topdeal/feature-auth/core";
import type { AppCradle } from "./types";

let containerInstance: AwilixContainer<AppCradle> | null = null;

function getDatabasePoolMax(): number {
  const configuredValue = process.env.DATABASE_POOL_MAX;
  if (!configuredValue) return 10;

  const maxConnections = Number(configuredValue);
  if (!Number.isInteger(maxConnections) || maxConnections < 1 || maxConnections > 50) {
    throw new Error("DATABASE_POOL_MAX must be an integer between 1 and 50.");
  }
  return maxConnections;
}

export function buildContainer(): AwilixContainer<AppCradle> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for the Auth feature.");
  }

  const container = createContainer<AppCradle>({
    injectionMode: InjectionMode.PROXY,
  });

  container.register({
    prisma: asValue(createDatabaseClient(connectionString, {
      maxConnections: getDatabasePoolMax(),
    })),
    annoncePhotoStorage: asClass(S3AnnoncePhotoStorage).singleton(),
    createAnnonceRepository: asClass(CreateAnnonceRepositoryImpl).singleton(),
    getPublicAnnonceRepository: asClass(GetPublicAnnonceRepositoryImpl).singleton(),
    createAnnonceUseCase: asClass(CreateAnnonceUseCaseImpl).singleton(),
    getPublicAnnonceUseCase: asClass(GetPublicAnnonceUseCaseImpl).singleton(),
    getActiveAnnonceCategoriesRepository: asClass(GetActiveAnnonceCategoriesRepositoryImpl).singleton(),
    getActiveAnnonceCategoriesUseCase: asClass(GetActiveAnnonceCategoriesUseCaseImpl).singleton(),
    searchAnnoncesRepository: asClass(SearchAnnoncesRepositoryImpl).singleton(),
    searchAnnoncesUseCase: asClass(SearchAnnoncesUseCaseImpl).singleton(),
    updateAnnonceRepository: asClass(UpdateAnnonceRepositoryImpl).singleton(),
    updateAnnonceUseCase: asClass(UpdateAnnonceUseCaseImpl).singleton(),
    changeAnnonceVisibilityRepository: asClass(ChangeAnnonceVisibilityRepositoryImpl).singleton(),
    changeAnnonceVisibilityUseCase: asClass(ChangeAnnonceVisibilityUseCaseImpl).singleton(),
    getOwnedAnnoncesRepository: asClass(GetOwnedAnnoncesRepositoryImpl).singleton(),
    getOwnedAnnoncesUseCase: asClass(GetOwnedAnnoncesUseCaseImpl).singleton(),
    getOwnedAnnonceForEditRepository: asClass(GetOwnedAnnonceForEditRepositoryImpl).singleton(),
    getOwnedAnnonceForEditUseCase: asClass(GetOwnedAnnonceForEditUseCaseImpl).singleton(),
    setAnnonceFavoriteRepository: asClass(SetAnnonceFavoriteRepositoryImpl).singleton(),
    getAnnonceFavoriteIdsRepository: asClass(GetAnnonceFavoriteIdsRepositoryImpl).singleton(),
    getFavoriteAnnoncesRepository: asClass(GetFavoriteAnnoncesRepositoryImpl).singleton(),
    annonceAffiliateLinkRepository: asClass(AnnonceAffiliateLinkRepositoryImpl).singleton(),
    setAnnonceFavoriteUseCase: asClass(SetAnnonceFavoriteUseCaseImpl).singleton(),
    getAnnonceFavoriteIdsUseCase: asClass(GetAnnonceFavoriteIdsUseCaseImpl).singleton(),
    getFavoriteAnnoncesUseCase: asClass(GetFavoriteAnnoncesUseCaseImpl).singleton(),
    createAnnonceAffiliateLinkUseCase: asClass(CreateAnnonceAffiliateLinkUseCaseImpl).singleton(),
    getAnnonceAffiliatePriceUseCase: asClass(GetAnnonceAffiliatePriceUseCaseImpl).singleton(),
    identityProvider: asClass(FirebaseAdminIdentityProvider).singleton(),
    userRepository: asClass(AuthUserRepositoryImpl).singleton(),
    createWebSessionUseCase: asClass(CreateWebSessionUseCaseImpl).singleton(),
    checkAuthRegistrationEligibilityUseCase: asClass(CheckAuthRegistrationEligibilityUseCaseImpl).singleton(),
    completeAuthProfileUseCase: asClass(CompleteAuthProfileUseCaseImpl).singleton(),
    verifyWebSessionUseCase: asClass(VerifyWebSessionUseCaseImpl).singleton(),
  });

  return container;
}

export function getContainer(): AwilixContainer<AppCradle> {
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

export function resolveVerifyWebSessionUseCase(): VerifyWebSessionUseCase {
  return getContainer().resolve("verifyWebSessionUseCase");
}

export function resolveCreateAnnonceUseCase(): CreateAnnonceUseCase {
  return getContainer().resolve("createAnnonceUseCase");
}

export function resolveGetPublicAnnonceUseCase(): GetPublicAnnonceUseCase {
  return getContainer().resolve("getPublicAnnonceUseCase");
}

export function resolveGetActiveAnnonceCategoriesUseCase(): GetActiveAnnonceCategoriesUseCase {
  return getContainer().resolve("getActiveAnnonceCategoriesUseCase");
}

export function resolveSearchAnnoncesUseCase(): SearchAnnoncesUseCase {
  return getContainer().resolve("searchAnnoncesUseCase");
}

export function resolveUpdateAnnonceUseCase(): UpdateAnnonceUseCase {
  return getContainer().resolve("updateAnnonceUseCase");
}

export function resolveChangeAnnonceVisibilityUseCase(): ChangeAnnonceVisibilityUseCase {
  return getContainer().resolve("changeAnnonceVisibilityUseCase");
}

export function resolveGetOwnedAnnoncesUseCase(): GetOwnedAnnoncesUseCase {
  return getContainer().resolve("getOwnedAnnoncesUseCase");
}

export function resolveGetOwnedAnnonceForEditUseCase(): GetOwnedAnnonceForEditUseCase {
  return getContainer().resolve("getOwnedAnnonceForEditUseCase");
}

export function resolveSetAnnonceFavoriteUseCase(): SetAnnonceFavoriteUseCase {
  return getContainer().resolve("setAnnonceFavoriteUseCase");
}

export function resolveGetAnnonceFavoriteIdsUseCase(): GetAnnonceFavoriteIdsUseCase {
  return getContainer().resolve("getAnnonceFavoriteIdsUseCase");
}

export function resolveGetFavoriteAnnoncesUseCase(): GetFavoriteAnnoncesUseCase {
  return getContainer().resolve("getFavoriteAnnoncesUseCase");
}

export function resolveCreateAnnonceAffiliateLinkUseCase(): CreateAnnonceAffiliateLinkUseCase {
  return getContainer().resolve("createAnnonceAffiliateLinkUseCase");
}

export function resolveGetAnnonceAffiliatePriceUseCase(): GetAnnonceAffiliatePriceUseCase {
  return getContainer().resolve("getAnnonceAffiliatePriceUseCase");
}
