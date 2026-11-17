import type { PrismaClient } from "@topdeal/database";
import type { UpdateAnnonceRepository } from "../../core/repositories/UpdateAnnonceRepository";

type Dependencies = {
  prisma: PrismaClient;
};

export class UpdateAnnonceRepositoryImpl implements UpdateAnnonceRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async updatePriceAndQuantity(
    annonceId: string,
    userId: string,
    price: string,
    quantity: number,
  ): Promise<boolean> {
    const result = await this.dependencies.prisma.annonce.updateMany({
      where: { id: annonceId, utilisateur_id: userId },
      data: { prix: price, quantite: quantity },
    });
    return result.count === 1;
  }
}
