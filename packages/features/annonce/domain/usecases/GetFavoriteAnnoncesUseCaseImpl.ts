import type { FavoriteAnnonceItem } from "../../core/models/FavoriteAnnonceItem";
import type { FavoriteAnnonceFilters, GetFavoriteAnnoncesRepository } from "../../core/repositories/GetFavoriteAnnoncesRepository";
import type { AnnoncePhotoStorage } from "../../core/repositories/AnnoncePhotoStorage";
import type { GetFavoriteAnnoncesUseCase } from "../../core/usecases/GetFavoriteAnnoncesUseCase";

const PAGE_SIZE = 20;

type Dependencies = {
  getFavoriteAnnoncesRepository: GetFavoriteAnnoncesRepository;
  annoncePhotoStorage: AnnoncePhotoStorage;
};

export class GetFavoriteAnnoncesUseCaseImpl implements GetFavoriteAnnoncesUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(userId: string, filters: FavoriteAnnonceFilters, cursor: string | null) {
    const page = await this.dependencies.getFavoriteAnnoncesRepository.findByUser(
      userId,
      filters,
      cursor,
      PAGE_SIZE,
    );
    const items: FavoriteAnnonceItem[] = await Promise.all(page.items.map(async (item) => {
      const publiclyVisible = item.annonce.visibilite === "PUBLIEE" && item.annonce.categorieActive;
      return {
        annonceId: item.annonceId,
        dateAjout: item.dateAjout,
        indisponible: !publiclyVisible || item.annonce.disponibilite !== "DISPONIBLE",
        annonce: {
          titre: item.annonce.titre,
          prix: item.annonce.prix,
          etat: item.annonce.etat,
          trocAccepte: item.annonce.trocAccepte,
          quantite: item.annonce.quantite,
          disponibilite: item.annonce.disponibilite,
          quartier: item.annonce.quartier,
          categorie: item.annonce.categorie,
          photoUrl: item.annonce.photoReference
            ? await this.dependencies.annoncePhotoStorage.createReadUrl(item.annonce.photoReference)
            : null,
        },
      };
    }));
    return { items, nextCursor: page.nextCursor };
  }
}
