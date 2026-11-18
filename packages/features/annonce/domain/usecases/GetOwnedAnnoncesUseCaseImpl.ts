import type { AnnoncePhotoStorage } from "../../core/repositories/AnnoncePhotoStorage";
import type { GetOwnedAnnoncesRepository, OwnedAnnonceFilters } from "../../core/repositories/GetOwnedAnnoncesRepository";
import type { GetOwnedAnnoncesUseCase } from "../../core/usecases/GetOwnedAnnoncesUseCase";

const PAGE_SIZE = 20;

type Dependencies = {
  getOwnedAnnoncesRepository: GetOwnedAnnoncesRepository;
  annoncePhotoStorage: AnnoncePhotoStorage;
};

export class GetOwnedAnnoncesUseCaseImpl implements GetOwnedAnnoncesUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(userId: string, filters: OwnedAnnonceFilters, cursor: string | null) {
    const page = await this.dependencies.getOwnedAnnoncesRepository.findByOwner(
      userId,
      filters,
      cursor,
      PAGE_SIZE,
    );
    const items = await Promise.all(page.items.map(async (item) => {
      const photos = await Promise.all(item.editDetails.photos.map(async (photo) => ({
        id: photo.id,
        url: await this.dependencies.annoncePhotoStorage.createReadUrl(photo.reference),
      })));
      return {
        id: item.id,
        titre: item.titre,
        etat: item.etat,
        trocAccepte: item.trocAccepte,
        prix: item.prix,
        quantite: item.quantite,
        quartier: item.quartier,
        categorie: item.categorie,
        disponibilite: item.disponibilite,
        visibilite: item.visibilite,
        photoUrl: photos[0]?.url ?? null,
        editDetails: { ...item.editDetails, photos },
      };
    }));
    return { items, nextCursor: page.nextCursor };
  }
}
