import type { PrismaClient } from "@topdeal/database";
import type {
  ChangeAnnonceVisibilityRepository,
  SellerAnnonceVisibility,
} from "../../core/repositories/ChangeAnnonceVisibilityRepository";

type Dependencies = {
  prisma: PrismaClient;
};

export class ChangeAnnonceVisibilityRepositoryImpl implements ChangeAnnonceVisibilityRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async changeVisibility(
    annonceId: string,
    userId: string,
    visibility: SellerAnnonceVisibility,
  ): Promise<boolean> {
    const result = await this.dependencies.prisma.annonce.updateMany({
      where: {
        id: annonceId,
        utilisateur_id: userId,
        visibilite: { in: ["PUBLIEE", "MASQUEE"] },
      },
      data: { visibilite: visibility },
    });
    return result.count === 1;
  }
}
