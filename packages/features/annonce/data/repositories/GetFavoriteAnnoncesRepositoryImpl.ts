import { Prisma, type PrismaClient } from "@topdeal/database";
import type { FavoriteAnnonceRecord } from "../../core/models/FavoriteAnnonceRecord";
import type {
  FavoriteAnnonceRecordPage,
  GetFavoriteAnnoncesRepository,
  FavoriteAnnonceFilters,
} from "../../core/repositories/GetFavoriteAnnoncesRepository";

type Dependencies = { prisma: PrismaClient };

export class GetFavoriteAnnoncesRepositoryImpl implements GetFavoriteAnnoncesRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async findByUser(
    userId: string,
    filters: FavoriteAnnonceFilters,
    cursor: string | null,
    pageSize: number,
  ): Promise<FavoriteAnnonceRecordPage> {
    const favorites = await this.dependencies.prisma.favori.findMany({
      where: {
        utilisateur_id: userId,
        annonce: {
          AND: [
            ...(filters.query ? [{ OR: [
              { titre: { contains: filters.query, mode: "insensitive" as const } },
              { description: { contains: filters.query, mode: "insensitive" as const } },
            ] }] : []),
            ...(filters.categorieId ? [{ categorie_annonce_categorie_idTocategorie: { OR: [{ id: filters.categorieId }, { parent_id: filters.categorieId }] } }] : []),
            ...(filters.etat ? [{ etat: filters.etat }] : []),
            ...(filters.trocAccepte !== null ? [{ troc_accepte: filters.trocAccepte }] : []),
            ...(filters.quartier ? [{ quartier: { contains: filters.quartier, mode: "insensitive" as const } }] : []),
            ...((filters.prixMin !== null || filters.prixMax !== null) ? [{ prix: {
              ...(filters.prixMin !== null ? { gte: new Prisma.Decimal(filters.prixMin) } : {}),
              ...(filters.prixMax !== null ? { lte: new Prisma.Decimal(filters.prixMax) } : {}),
            } }] : []),
          ],
        },
      },
      orderBy: filters.sort === "price-asc"
        ? [{ annonce: { prix: "asc" } }, { annonce_id: "desc" }]
        : filters.sort === "price-desc"
          ? [{ annonce: { prix: "desc" } }, { annonce_id: "desc" }]
          : [{ date_ajout: filters.sort === "oldest" ? "asc" : "desc" }, { annonce_id: "desc" }],
      ...(cursor ? { cursor: { utilisateur_id_annonce_id: { utilisateur_id: userId, annonce_id: cursor } }, skip: 1 } : {}),
      take: pageSize + 1,
      select: {
        annonce_id: true,
        date_ajout: true,
        annonce: {
          select: {
            titre: true,
            prix: true,
            etat: true,
            troc_accepte: true,
            quantite: true,
            disponibilite: true,
            quartier: true,
            visibilite: true,
            categorie_annonce_categorie_idTocategorie: {
              select: { id: true, nom: true, active: true },
            },
            photo_annonce: {
              orderBy: [{ ordre: "asc" }, { id: "asc" }],
              take: 1,
              select: { cle: true },
            },
          },
        },
      },
    });

    const hasMore = favorites.length > pageSize;
    const rows = hasMore ? favorites.slice(0, pageSize) : favorites;
    const items: FavoriteAnnonceRecord[] = rows.map((favorite) => ({
      annonceId: favorite.annonce_id,
      dateAjout: favorite.date_ajout.toISOString(),
      annonce: {
        titre: favorite.annonce.titre,
        prix: favorite.annonce.prix.toString(),
        etat: favorite.annonce.etat,
        trocAccepte: favorite.annonce.troc_accepte,
        quantite: favorite.annonce.quantite,
        disponibilite: favorite.annonce.disponibilite,
        quartier: favorite.annonce.quartier,
        visibilite: favorite.annonce.visibilite,
        categorieActive: favorite.annonce.categorie_annonce_categorie_idTocategorie.active,
        categorie: {
          id: favorite.annonce.categorie_annonce_categorie_idTocategorie.id,
          nom: favorite.annonce.categorie_annonce_categorie_idTocategorie.nom,
        },
        photoReference: favorite.annonce.photo_annonce[0]?.cle ?? null,
      },
    }));

    return { items, nextCursor: hasMore ? rows.at(-1)?.annonce_id ?? null : null };
  }
}
