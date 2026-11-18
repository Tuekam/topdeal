import type { AnnoncePhotoStorage } from "../../core/repositories/AnnoncePhotoStorage";
import type { GetOwnedAnnonceForEditRepository } from "../../core/repositories/GetOwnedAnnonceForEditRepository";
import type { GetOwnedAnnonceForEditUseCase } from "../../core/usecases/GetOwnedAnnonceForEditUseCase";

type Dependencies = {
  getOwnedAnnonceForEditRepository: GetOwnedAnnonceForEditRepository;
  annoncePhotoStorage: AnnoncePhotoStorage;
};

export class GetOwnedAnnonceForEditUseCaseImpl implements GetOwnedAnnonceForEditUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(annonceId: string, userId: string) {
    const annonce = await this.dependencies.getOwnedAnnonceForEditRepository.findByOwner(annonceId, userId);
    if (!annonce) return null;

    return {
      ...annonce,
      photos: await Promise.all(annonce.photos.map(async (photo) => ({
        id: photo.id,
        url: await this.dependencies.annoncePhotoStorage.createReadUrl(photo.reference),
      }))),
    };
  }
}
