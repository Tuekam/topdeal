import type { PrismaClient } from "@topdeal/database";
import type { AnnonceCategory } from "../../core/models/AnnonceCategory";
import type { GetActiveAnnonceCategoriesRepository } from "../../core/repositories/GetActiveAnnonceCategoriesRepository";

type Dependencies = {
  prisma: PrismaClient;
};

export class GetActiveAnnonceCategoriesRepositoryImpl implements GetActiveAnnonceCategoriesRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async findAll(): Promise<AnnonceCategory[]> {
    const categories = await this.dependencies.prisma.categorie.findMany({
      where: { active: true },
      orderBy: { nom: "asc" },
      select: { id: true, nom: true, parent_id: true },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.nom,
      parentId: category.parent_id,
    }));
  }
}
