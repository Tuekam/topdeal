import type { AnnoncePhotoStorage } from "../../core/repositories/AnnoncePhotoStorage";
import type { CreateAnnonceRepository } from "../../core/repositories/CreateAnnonceRepository";
import type { CreateAnnonceInput } from "../../core/models/CreateAnnonceInput";
import type {
  CreateAnnonceResult,
  CreateAnnonceUseCase,
} from "../../core/usecases/CreateAnnonceUseCase";

const MIN_PHOTOS = 1;
const MAX_PHOTOS = 6;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const PRICE_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;
const AFFILIATE_REWARD_PATTERN = /^[1-9]\d{0,9}$/;

type Dependencies = {
  createAnnonceRepository: CreateAnnonceRepository;
  annoncePhotoStorage: AnnoncePhotoStorage;
};

function isValidInput(input: CreateAnnonceInput): string | null {
  if (!input.titre.trim() || input.titre.length > 255) return "titre";
  if (!input.description.trim()) return "description";
  if (!input.quartier.trim() || input.quartier.length > 150) return "quartier";
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(input.prix)) return "prix";
  if (!Number.isInteger(input.quantite) || input.quantite <= 0) return "quantite";
  if (!input.categorieId) return "categorieId";
  if (
    input.trocAccepte &&
    !input.categorieSouhaiteeId &&
    !input.souhaitEchangeDescription?.trim()
  ) return "souhaitEchangeDescription";
  if (input.affiliationActive && (input.trocAccepte || !AFFILIATE_REWARD_PATTERN.test(input.remunerationAffiliation))) {
    return "remunerationAffiliation";
  }
  if (input.affiliationActive && Number(input.prix) + Number(input.remunerationAffiliation) > 9_999_999_999.99) {
    return "remunerationAffiliation";
  }
  if (input.photos.length < MIN_PHOTOS || input.photos.length > MAX_PHOTOS) {
    return "photos";
  }

  for (const photo of input.photos) {
    if (
      !photo.originalName.trim() ||
      photo.originalName.length > 255 ||
      /[\u0000-\u001f]/.test(photo.originalName)
    ) return "photos";
    if (!ALLOWED_PHOTO_TYPES.has(photo.contentType)) return "photos";
    if (photo.content.byteLength === 0 || photo.content.byteLength > MAX_PHOTO_SIZE_BYTES) {
      return "photos";
    }
  }

  return null;
}

async function deleteStoredPhotos(
  storage: AnnoncePhotoStorage,
  keys: string[],
): Promise<void> {
  await Promise.allSettled(keys.map((key) => storage.delete(key)));
}

export class CreateAnnonceUseCaseImpl implements CreateAnnonceUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(
    userId: string,
    input: CreateAnnonceInput,
  ): Promise<CreateAnnonceResult> {
    const invalidField = isValidInput(input);
    if (invalidField) return { status: "invalid_input", field: invalidField };

    const categoriesAreActive = await this.dependencies.createAnnonceRepository.categoriesAreActive(
      input.categorieId,
      input.trocAccepte ? input.categorieSouhaiteeId : null,
    );
    if (!categoriesAreActive) {
      return { status: "invalid_input", field: "categorieId" };
    }

    const uploadResults = await Promise.allSettled(
      input.photos.map((photo) => this.dependencies.annoncePhotoStorage.store(photo)),
    );
    const storedPhotos = uploadResults.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    const uploadFailed = uploadResults.some((result) => result.status === "rejected");

    if (uploadFailed) {
      await deleteStoredPhotos(
        this.dependencies.annoncePhotoStorage,
        storedPhotos.map((photo) => photo.key),
      );
      throw uploadResults.find((result) => result.status === "rejected")?.reason;
    }

    let annonceId: string | null;
    try {
      annonceId = await this.dependencies.createAnnonceRepository.create({
        ...input,
        userId,
        photos: storedPhotos,
      });
    } catch (error) {
      await deleteStoredPhotos(
        this.dependencies.annoncePhotoStorage,
        storedPhotos.map((photo) => photo.key),
      );
      throw error;
    }

    if (!annonceId) {
      await deleteStoredPhotos(
        this.dependencies.annoncePhotoStorage,
        storedPhotos.map((photo) => photo.key),
      );
      return { status: "invalid_input", field: "categorieId" };
    }

    return { status: "created", annonceId };
  }
}
