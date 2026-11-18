import type { PrismaClient } from "@topdeal/database";
import type {
  AnnoncePhotoStorage,
  GetActiveAnnonceCategoriesRepository,
  GetActiveAnnonceCategoriesUseCase,
  CreateAnnonceRepository,
  CreateAnnonceUseCase,
  GetPublicAnnonceRepository,
  GetPublicAnnonceUseCase,
  SearchAnnoncesRepository,
  SearchAnnoncesUseCase,
  UpdateAnnonceRepository,
  UpdateAnnonceUseCase,
  ChangeAnnonceVisibilityRepository,
  ChangeAnnonceVisibilityUseCase,
  GetOwnedAnnoncesRepository,
  GetOwnedAnnoncesUseCase,
  GetOwnedAnnonceForEditRepository,
  GetOwnedAnnonceForEditUseCase,
  SetAnnonceFavoriteRepository,
  GetAnnonceFavoriteIdsRepository,
  GetFavoriteAnnoncesRepository,
  SetAnnonceFavoriteUseCase,
  GetAnnonceFavoriteIdsUseCase,
  GetFavoriteAnnoncesUseCase,
} from "@topdeal/feature-annonce/core";
import type {
  AnnonceAffiliateLinkRepository,
  CreateAnnonceAffiliateLinkUseCase,
  GetAnnonceAffiliatePriceUseCase,
} from "@topdeal/feature-affiliation/core";
import type {
  AuthIdentityProvider,
  AuthUserRepository,
  CheckAuthRegistrationEligibilityUseCase,
  CompleteAuthProfileUseCase,
  CreateWebSessionUseCase,
  VerifyWebSessionUseCase,
} from "@topdeal/feature-auth/core";

export type AppCradle = {
  prisma: PrismaClient;
  annoncePhotoStorage: AnnoncePhotoStorage;
  createAnnonceRepository: CreateAnnonceRepository;
  getPublicAnnonceRepository: GetPublicAnnonceRepository;
  createAnnonceUseCase: CreateAnnonceUseCase;
  getPublicAnnonceUseCase: GetPublicAnnonceUseCase;
  getActiveAnnonceCategoriesRepository: GetActiveAnnonceCategoriesRepository;
  getActiveAnnonceCategoriesUseCase: GetActiveAnnonceCategoriesUseCase;
  searchAnnoncesRepository: SearchAnnoncesRepository;
  searchAnnoncesUseCase: SearchAnnoncesUseCase;
  updateAnnonceRepository: UpdateAnnonceRepository;
  updateAnnonceUseCase: UpdateAnnonceUseCase;
  changeAnnonceVisibilityRepository: ChangeAnnonceVisibilityRepository;
  changeAnnonceVisibilityUseCase: ChangeAnnonceVisibilityUseCase;
  getOwnedAnnoncesRepository: GetOwnedAnnoncesRepository;
  getOwnedAnnoncesUseCase: GetOwnedAnnoncesUseCase;
  getOwnedAnnonceForEditRepository: GetOwnedAnnonceForEditRepository;
  getOwnedAnnonceForEditUseCase: GetOwnedAnnonceForEditUseCase;
  setAnnonceFavoriteRepository: SetAnnonceFavoriteRepository;
  getAnnonceFavoriteIdsRepository: GetAnnonceFavoriteIdsRepository;
  getFavoriteAnnoncesRepository: GetFavoriteAnnoncesRepository;
  setAnnonceFavoriteUseCase: SetAnnonceFavoriteUseCase;
  getAnnonceFavoriteIdsUseCase: GetAnnonceFavoriteIdsUseCase;
  getFavoriteAnnoncesUseCase: GetFavoriteAnnoncesUseCase;
  annonceAffiliateLinkRepository: AnnonceAffiliateLinkRepository;
  createAnnonceAffiliateLinkUseCase: CreateAnnonceAffiliateLinkUseCase;
  getAnnonceAffiliatePriceUseCase: GetAnnonceAffiliatePriceUseCase;
  identityProvider: AuthIdentityProvider;
  userRepository: AuthUserRepository;
  createWebSessionUseCase: CreateWebSessionUseCase;
  checkAuthRegistrationEligibilityUseCase: CheckAuthRegistrationEligibilityUseCase;
  completeAuthProfileUseCase: CompleteAuthProfileUseCase;
  verifyWebSessionUseCase: VerifyWebSessionUseCase;
};
