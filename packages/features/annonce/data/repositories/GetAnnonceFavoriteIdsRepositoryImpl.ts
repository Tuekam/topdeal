import type { PrismaClient } from "@topdeal/database";
import type { GetAnnonceFavoriteIdsRepository } from "../../core/repositories/GetAnnonceFavoriteIdsRepository";

type Dependencies = { prisma: PrismaClient };

export class GetAnnonceFavoriteIdsRepositoryImpl implements GetAnnonceFavoriteIdsRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async find(userId: string, annonceIds: string[]): Promise<string[]> {
    if (annonceIds.length === 0) return [];
    const favorites = await this.dependencies.prisma.favori.findMany({
      where: { utilisateur_id: userId, annonce_id: { in: annonceIds } },
      select: { annonce_id: true },
    });
    return favorites.map(({ annonce_id }) => annonce_id);
  }
}
