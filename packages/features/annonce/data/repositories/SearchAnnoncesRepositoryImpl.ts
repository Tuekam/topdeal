import { Prisma, type PrismaClient } from "@topdeal/database";
import type { SearchAnnonceInput } from "../../core/models/SearchAnnonceInput";
import type {
  SearchAnnoncePage,
  SearchAnnoncesRepository,
} from "../../core/repositories/SearchAnnoncesRepository";

type Dependencies = {
  prisma: PrismaClient;
};

export class SearchAnnoncesRepositoryImpl implements SearchAnnoncesRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async search(input: SearchAnnonceInput, pageSize: number): Promise<SearchAnnoncePage> {
    const categoryFilter = input.categorieId
      ? {
          active: true,
          OR: [{ id: input.categorieId }, { parent_id: input.categorieId }],
        }
      : { active: true };

    const where: Prisma.annonceWhereInput = {
      visibilite: "PUBLIEE",
      categorie_annonce_categorie_idTocategorie: categoryFilter,
    };

    if (input.query) {
      where.OR = [
        { titre: { contains: input.query, mode: "insensitive" } },
        { description: { contains: input.query, mode: "insensitive" } },
      ];
    }
    if (input.etat) where.etat = input.etat;
    if (input.quartier) {
      where.quartier = { contains: input.quartier, mode: "insensitive" };
    }
    if (input.trocAccepte !== null) where.troc_accepte = input.trocAccepte;
    if (input.prixMin !== null || input.prixMax !== null) {
      where.prix = {
        ...(input.prixMin !== null ? { gte: new Prisma.Decimal(input.prixMin) } : {}),
        ...(input.prixMax !== null ? { lte: new Prisma.Decimal(input.prixMax) } : {}),
      };
    }
    const annonces = await this.dependencies.prisma.annonce.findMany({
      where,
      orderBy: input.sort === "price-asc"
        ? [{ prix: "asc" }, { id: "desc" }]
        : input.sort === "price-desc"
          ? [{ prix: "desc" }, { id: "desc" }]
          : [{ date_publication: input.sort === "oldest" ? "asc" : "desc" }, { id: "desc" }],
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      take: pageSize + 1,
      select: {
        id: true,
        titre: true,
        prix: true,
        etat: true,
        troc_accepte: true,
        quantite: true,
        disponibilite: true,
        quartier: true,
        categorie_annonce_categorie_idTocategorie: {
          select: { id: true, nom: true },
        },
        photo_annonce: {
          orderBy: [{ ordre: "asc" }, { id: "asc" }],
          take: 1,
          select: { cle: true },
        },
      },
    });

    const hasMore = annonces.length > pageSize;
    const resultItems = hasMore ? annonces.slice(0, pageSize) : annonces;
    return {
      items: resultItems.map((annonce) => ({
        id: annonce.id,
        titre: annonce.titre,
        prix: annonce.prix.toString(),
        etat: annonce.etat,
        trocAccepte: annonce.troc_accepte,
        quantite: annonce.quantite,
        disponibilite: annonce.disponibilite,
        quartier: annonce.quartier,
        categorie: annonce.categorie_annonce_categorie_idTocategorie,
        photoReference: annonce.photo_annonce[0]?.cle ?? null,
      })),
      nextCursor: hasMore ? resultItems.at(-1)?.id ?? null : null,
    };
  }
}
