import type { PrismaClient } from "@topdeal/database";
import type {
  GetOwnedAnnonceForEditRepository,
  OwnedAnnonceEditRecord,
} from "../../core/repositories/GetOwnedAnnonceForEditRepository";

type Dependencies = { prisma: PrismaClient };

export class GetOwnedAnnonceForEditRepositoryImpl implements GetOwnedAnnonceForEditRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async findByOwner(annonceId: string, userId: string): Promise<OwnedAnnonceEditRecord | null> {
    const annonce = await this.dependencies.prisma.annonce.findFirst({
      where: { id: annonceId, utilisateur_id: userId },
      select: {
        id: true,
        titre: true,
        description: true,
        etat: true,
        categorie_id: true,
        prix: true,
        quantite: true,
        quartier: true,
        troc_accepte: true,
        categorie_souhaitee_id: true,
        souhait_echange_description: true,
        affiliation: { select: { active: true, remuneration_fixe: true } },
        photo_annonce: {
          orderBy: [{ ordre: "asc" }, { id: "asc" }],
          select: { id: true, cle: true },
        },
      },
    });
    if (!annonce) return null;

    return {
      id: annonce.id,
      titre: annonce.titre,
      description: annonce.description ?? "",
      etat: annonce.etat,
      categorieId: annonce.categorie_id,
      prix: annonce.prix.toString(),
      quantite: annonce.quantite,
      quartier: annonce.quartier ?? "",
      trocAccepte: annonce.troc_accepte,
      categorieSouhaiteeId: annonce.categorie_souhaitee_id,
      souhaitEchangeDescription: annonce.souhait_echange_description,
      affiliationActive: annonce.affiliation?.active ?? false,
      remunerationAffiliation: annonce.affiliation?.remuneration_fixe.toString() ?? "0",
      photos: annonce.photo_annonce.map((photo) => ({ id: photo.id, reference: photo.cle })),
    };
  }
}
