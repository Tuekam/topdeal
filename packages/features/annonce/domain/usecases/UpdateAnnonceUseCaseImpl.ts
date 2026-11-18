import type { AnnoncePhotoStorage } from "../../core/repositories/AnnoncePhotoStorage";
import type { UpdateAnnonceRepository, UpdateAnnonceRepositoryResult } from "../../core/repositories/UpdateAnnonceRepository";
import type {
  UpdateAnnonceInput,
  UpdateAnnonceResult,
  UpdateAnnonceUseCase,
} from "../../core/usecases/UpdateAnnonceUseCase";

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PRICE_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;
const AFFILIATE_REWARD_PATTERN = /^[1-9]\d{0,9}$/;

type Dependencies = {
  updateAnnonceRepository: UpdateAnnonceRepository;
  annoncePhotoStorage: AnnoncePhotoStorage;
};

async function deletePhotos(storage: AnnoncePhotoStorage, keys: string[]): Promise<void> {
  await Promise.allSettled(keys.map((key) => storage.delete(key)));
}

function isValidInput(input: UpdateAnnonceInput): boolean {
  return Boolean(
    input.titre.trim() && input.titre.length <= 255 &&
    input.description.trim() && input.etat &&
    input.categorieId && PRICE_PATTERN.test(input.prix) &&
    Number.isInteger(input.quantite) && input.quantite > 0 &&
    input.quartier.trim() && input.quartier.length <= 150 &&
    (!input.trocAccepte || input.souhaitEchangeDescription?.trim()) &&
    new Set(input.retainedPhotoIds).size === input.retainedPhotoIds.length &&
    input.retainedPhotoIds.every((id) => /^[0-9a-f-]{36}$/i.test(id)) &&
    input.photos.every((photo) =>
      Boolean(photo.originalName.trim()) && photo.originalName.length <= 255 &&
      ALLOWED_PHOTO_TYPES.has(photo.contentType) &&
      photo.content.byteLength > 0 && photo.content.byteLength <= MAX_PHOTO_SIZE_BYTES,
    ) &&
    input.retainedPhotoIds.length + input.photos.length >= 1 &&
    input.retainedPhotoIds.length + input.photos.length <= 6 &&
    (!input.affiliationActive || (!input.trocAccepte && AFFILIATE_REWARD_PATTERN.test(input.remunerationAffiliation))) &&
    (!input.affiliationActive || Number(input.prix) + Number(input.remunerationAffiliation) <= 9_999_999_999.99)
  );
}

export class UpdateAnnonceUseCaseImpl implements UpdateAnnonceUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: UpdateAnnonceInput): Promise<UpdateAnnonceResult> {
    if (!isValidInput(input)) return "invalid_input";
    const categorieSouhaiteeId = input.trocAccepte ? input.categorieSouhaiteeId : null;
    if (!await this.dependencies.updateAnnonceRepository.categoriesAreActive(input.categorieId, categorieSouhaiteeId)) {
      return "invalid_input";
    }

    const uploadResults = await Promise.allSettled(
      input.photos.map((photo) => this.dependencies.annoncePhotoStorage.store(photo)),
    );
    const storedPhotos = uploadResults.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
    if (uploadResults.some((result) => result.status === "rejected")) {
      await deletePhotos(this.dependencies.annoncePhotoStorage, storedPhotos.map((photo) => photo.key));
      throw uploadResults.find((result) => result.status === "rejected")?.reason;
    }

    let result: UpdateAnnonceRepositoryResult;
    try {
      result = await this.dependencies.updateAnnonceRepository.update(input.annonceId, input.userId, {
        titre: input.titre,
        description: input.description,
        etat: input.etat,
        categorieId: input.categorieId,
        prix: input.prix,
        quantite: input.quantite,
        quartier: input.quartier,
        trocAccepte: input.trocAccepte,
        categorieSouhaiteeId,
        souhaitEchangeDescription: input.trocAccepte ? input.souhaitEchangeDescription : null,
        affiliationActive: input.affiliationActive && !input.trocAccepte,
        remunerationAffiliation: input.remunerationAffiliation,
        retainedPhotoIds: input.retainedPhotoIds,
        photos: storedPhotos,
      });
    } catch (error) {
      await deletePhotos(this.dependencies.annoncePhotoStorage, storedPhotos.map((photo) => photo.key));
      throw error;
    }

    if (result.status !== "updated") {
      await deletePhotos(this.dependencies.annoncePhotoStorage, storedPhotos.map((photo) => photo.key));
      return result.status;
    }

    await deletePhotos(this.dependencies.annoncePhotoStorage, result.removedPhotoKeys);
    return "updated";
  }
}
