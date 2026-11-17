import type { PrismaClient } from "@topdeal/database";
import type {
  GetOwnedAnnoncesRepository,
  OwnedAnnoncePage,
} from "../../core/repositories/GetOwnedAnnoncesRepository";

type Dependencies = {
  prisma: PrismaClient;
};

export class GetOwnedAnnoncesRepositoryImpl implements GetOwnedAnnoncesRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async findByOwner(
    userId: string,
    cursor: string | null,
    pageSize: number,
  ): Promise<OwnedAnnoncePage> {
    const annonces = await this.dependencies.prisma.annonce.findMany({
      where: { utilisateur_id: userId },
      orderBy: [{ date_publication: "desc" }, { id: "desc" }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: pageSize + 1,
      select: {
        id: true,
        titre: true,
        prix: true,
        quantite: true,
        disponibilite: true,
        visibilite: true,
        photo_annonce: {
          orderBy: [{ ordre: "asc" }, { id: "asc" }],
          take: 1,
          select: { cle: true },
        },
      },
    });

    const hasMore = annonces.length > pageSize;
    const items = hasMore ? annonces.slice(0, pageSize) : annonces;
    return {
      items: items.map((annonce) => ({
        id: annonce.id,
        titre: annonce.titre,
        prix: annonce.prix.toString(),
        quantite: annonce.quantite,
        disponibilite: annonce.disponibilite,
        visibilite: annonce.visibilite,
        photoReference: annonce.photo_annonce[0]?.cle ?? null,
      })),
      nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
    };
  }
}
