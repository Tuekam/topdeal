import { Prisma, type PrismaClient } from "@topdeal/database";
import type {
  GetOwnedAnnoncesRepository,
  OwnedAnnonceFilters,
  OwnedAnnoncePage,
} from "../../core/repositories/GetOwnedAnnoncesRepository";

type Dependencies = {
  prisma: PrismaClient;
};

export class GetOwnedAnnoncesRepositoryImpl implements GetOwnedAnnoncesRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async findByOwner(
    userId: string,
    filters: OwnedAnnonceFilters,
    cursor: string | null,
    pageSize: number,
  ): Promise<OwnedAnnoncePage> {
    const where: Prisma.annonceWhereInput = { utilisateur_id: userId };
    if (filters.query) {
      where.OR = [
        { titre: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
      ];
    }
    if (filters.categorieId) {
      where.categorie_annonce_categorie_idTocategorie = {
        OR: [{ id: filters.categorieId }, { parent_id: filters.categorieId }],
      };
    }
    if (filters.etat) where.etat = filters.etat;
    if (filters.trocAccepte !== null) where.troc_accepte = filters.trocAccepte;
    if (filters.visibilite) where.visibilite = filters.visibilite;
    if (filters.quartier) where.quartier = { contains: filters.quartier, mode: "insensitive" };
    if (filters.prixMin !== null || filters.prixMax !== null) {
      where.prix = {
        ...(filters.prixMin !== null ? { gte: new Prisma.Decimal(filters.prixMin) } : {}),
        ...(filters.prixMax !== null ? { lte: new Prisma.Decimal(filters.prixMax) } : {}),
      };
    }

    const annonces = await this.dependencies.prisma.annonce.findMany({
      where,
      orderBy: filters.sort === "price-asc"
        ? [{ prix: "asc" }, { id: "desc" }]
        : filters.sort === "price-desc"
          ? [{ prix: "desc" }, { id: "desc" }]
          : [{ date_publication: filters.sort === "oldest" ? "asc" : "desc" }, { id: "desc" }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: pageSize + 1,
      select: {
        id: true,
        titre: true,
        description: true,
        etat: true,
        categorie_id: true,
        troc_accepte: true,
        categorie_souhaitee_id: true,
        souhait_echange_description: true,
        affiliation: { select: { active: true, remuneration_fixe: true } },
        prix: true,
        quantite: true,
        quartier: true,
        disponibilite: true,
        visibilite: true,
        photo_annonce: {
          orderBy: [{ ordre: "asc" }, { id: "asc" }],
          select: { id: true, cle: true },
        },
        categorie_annonce_categorie_idTocategorie: { select: { id: true, nom: true } },
      },
    });

    const hasMore = annonces.length > pageSize;
    const items = hasMore ? annonces.slice(0, pageSize) : annonces;
    return {
      items: items.map((annonce) => ({
        id: annonce.id,
        titre: annonce.titre,
        etat: annonce.etat,
        trocAccepte: annonce.troc_accepte,
        prix: annonce.prix.toString(),
        quantite: annonce.quantite,
        quartier: annonce.quartier,
        categorie: annonce.categorie_annonce_categorie_idTocategorie,
        disponibilite: annonce.disponibilite,
        visibilite: annonce.visibilite,
        photoReference: annonce.photo_annonce[0]?.cle ?? null,
        editDetails: {
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
        },
      })),
      nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
    };
  }
}
