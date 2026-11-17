import type { AnnoncePhotoStorage } from "../../core/repositories/AnnoncePhotoStorage";
import type { GetOwnedAnnoncesRepository } from "../../core/repositories/GetOwnedAnnoncesRepository";
import type { GetOwnedAnnoncesUseCase } from "../../core/usecases/GetOwnedAnnoncesUseCase";

const PAGE_SIZE = 20;

type Dependencies = {
  getOwnedAnnoncesRepository: GetOwnedAnnoncesRepository;
  annoncePhotoStorage: AnnoncePhotoStorage;
};

export class GetOwnedAnnoncesUseCaseImpl implements GetOwnedAnnoncesUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(userId: string, cursor: string | null) {
    const page = await this.dependencies.getOwnedAnnoncesRepository.findByOwner(
      userId,
      cursor,
      PAGE_SIZE,
    );
    const items = await Promise.all(page.items.map(async (item) => ({
      id: item.id,
      titre: item.titre,
      prix: item.prix,
      quantite: item.quantite,
      disponibilite: item.disponibilite,
      visibilite: item.visibilite,
      photoUrl: item.photoReference
        ? await this.dependencies.annoncePhotoStorage.createReadUrl(item.photoReference)
        : null,
    })));
    return { items, nextCursor: page.nextCursor };
  }
}
