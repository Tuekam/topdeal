import type { PrismaClient } from "@topdeal/database";
import type { SetAnnonceFavoriteRepository } from "../../core/repositories/SetAnnonceFavoriteRepository";

type Dependencies = { prisma: PrismaClient };

export class SetAnnonceFavoriteRepositoryImpl implements SetAnnonceFavoriteRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async set(userId: string, annonceId: string, isFavorite: boolean): Promise<boolean> {
    const { prisma } = this.dependencies;
    if (!isFavorite) {
      await prisma.favori.deleteMany({ where: { utilisateur_id: userId, annonce_id: annonceId } });
      return false;
    }

    const annonce = await prisma.annonce.findFirst({
      where: {
        id: annonceId,
        visibilite: "PUBLIEE",
        categorie_annonce_categorie_idTocategorie: { active: true },
      },
      select: { id: true },
    });
    if (!annonce) return false;

    await prisma.favori.upsert({
      where: { utilisateur_id_annonce_id: { utilisateur_id: userId, annonce_id: annonceId } },
      create: { utilisateur_id: userId, annonce_id: annonceId },
      update: {},
    });
    return true;
  }
}
