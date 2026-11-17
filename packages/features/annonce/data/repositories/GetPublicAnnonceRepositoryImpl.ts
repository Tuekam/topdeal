import type { PrismaClient } from "@topdeal/database";
import type { GetPublicAnnonceRepository, PublicAnnonceRecord } from "../../core/repositories/GetPublicAnnonceRepository";

type Dependencies = {
  prisma: PrismaClient;
};

export class GetPublicAnnonceRepositoryImpl implements GetPublicAnnonceRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async findById(id: string): Promise<PublicAnnonceRecord | null> {
    const annonce = await this.dependencies.prisma.annonce.findFirst({
      where: {
        id,
        visibilite: "PUBLIEE",
        categorie_annonce_categorie_idTocategorie: { active: true },
      },
      select: {
        id: true,
        titre: true,
        description: true,
        etat: true,
        prix: true,
        quantite: true,
        disponibilite: true,
        quartier: true,
        troc_accepte: true,
        categorie_annonce_categorie_idTocategorie: {
          select: {
            id: true,
            nom: true,
            categorie: { select: { id: true, nom: true } },
          },
        },
        utilisateur: { select: { prenom: true, nom: true, date_creation: true } },
        photo_annonce: {
          orderBy: [{ ordre: "asc" }, { id: "asc" }],
          select: {
            id: true,
            cle: true,
            nom_original: true,
            type_mime: true,
            taille: true,
            ordre: true,
          },
        },
      },
    });
    if (!annonce) return null;

    return {
      id: annonce.id,
      titre: annonce.titre,
      description: annonce.description,
      etat: annonce.etat,
      prix: annonce.prix.toString(),
      quantite: annonce.quantite,
      disponibilite: annonce.disponibilite,
      quartier: annonce.quartier,
      trocAccepte: annonce.troc_accepte,
      categorie: {
        id: annonce.categorie_annonce_categorie_idTocategorie.id,
        nom: annonce.categorie_annonce_categorie_idTocategorie.nom,
        parent: annonce.categorie_annonce_categorie_idTocategorie.categorie,
      },
      vendeur: {
        prenom: annonce.utilisateur.prenom,
        nom: annonce.utilisateur.nom,
        dateCreation: annonce.utilisateur.date_creation.toISOString(),
      },
      photos: annonce.photo_annonce.map((photo) => ({
        id: photo.id,
        key: photo.cle,
        originalName: photo.nom_original,
        contentType: photo.type_mime,
        size: photo.taille,
        ordre: photo.ordre,
      })),
    };
  }
}
