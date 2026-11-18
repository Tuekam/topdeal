import type { AnnoncePhotoStorage } from "../../core/repositories/AnnoncePhotoStorage";
import type { GetPublicAnnonceRepository } from "../../core/repositories/GetPublicAnnonceRepository";
import type { AnnonceDetails } from "../../core/models/AnnonceDetails";
import type { GetPublicAnnonceUseCase } from "../../core/usecases/GetPublicAnnonceUseCase";

type Dependencies = {
  getPublicAnnonceRepository: GetPublicAnnonceRepository;
  annoncePhotoStorage: AnnoncePhotoStorage;
};

export class GetPublicAnnonceUseCaseImpl implements GetPublicAnnonceUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(annonceId: string): Promise<AnnonceDetails | null> {
    const annonce = await this.dependencies.getPublicAnnonceRepository.findById(
      annonceId,
    );
    if (!annonce) return null;

    const photos = await Promise.all(
      annonce.photos.map(async (photo) => ({
        id: photo.id,
        url: await this.dependencies.annoncePhotoStorage.createReadUrl(photo.key),
        ordre: photo.ordre,
      })),
    );

    return {
      id: annonce.id,
      titre: annonce.titre,
      description: annonce.description ?? "",
      etat: annonce.etat,
      prix: annonce.prix,
      quantite: annonce.quantite,
      disponibilite: annonce.disponibilite,
      quartier: annonce.quartier ?? "",
      trocAccepte: annonce.trocAccepte,
      affiliationDisponible: annonce.affiliationDisponible,
      categorie: annonce.categorie,
      vendeur: {
        nomComplet: `${annonce.vendeur.prenom} ${annonce.vendeur.nom}`.trim(),
        dateCreation: annonce.vendeur.dateCreation,
      },
      photos,
    };
  }
}
