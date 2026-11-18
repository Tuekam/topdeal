import type { PrismaClient } from "@topdeal/database";
import type { CreateAnnonceRepository, CreateAnnonceRecord } from "../../core/repositories/CreateAnnonceRepository";

type Dependencies = {
  prisma: PrismaClient;
};

export class CreateAnnonceRepositoryImpl implements CreateAnnonceRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async categoriesAreActive(
    categorieId: string,
    categorieSouhaiteeId: string | null,
  ): Promise<boolean> {
    const categoryIds = [categorieId, categorieSouhaiteeId].filter(
      (id): id is string => Boolean(id),
    );
    const activeCategories = await this.dependencies.prisma.categorie.count({
      where: { id: { in: categoryIds }, active: true },
    });
    return activeCategories === new Set(categoryIds).size;
  }

  async create(record: CreateAnnonceRecord): Promise<string | null> {
    if (!await this.categoriesAreActive(record.categorieId, record.categorieSouhaiteeId)) {
      return null;
    }

    const created = await this.dependencies.prisma.annonce.create({
      data: {
        titre: record.titre.trim(),
        description: record.description.trim(),
        etat: record.etat,
        prix: record.prix,
        quantite: record.quantite,
        quartier: record.quartier.trim(),
        troc_accepte: record.trocAccepte,
        visibilite: "PUBLIEE",
        disponibilite: "DISPONIBLE",
        date_publication: new Date(),
        utilisateur_id: record.userId,
        categorie_id: record.categorieId,
        categorie_souhaitee_id: record.trocAccepte ? record.categorieSouhaiteeId : null,
        souhait_echange_description: record.trocAccepte
          ? record.souhaitEchangeDescription?.trim() || null
          : null,
        photo_annonce: {
          create: record.photos.map((photo, ordre) => ({
            cle: photo.key,
            nom_original: photo.originalName,
            type_mime: photo.contentType,
            taille: photo.size,
            ordre,
          })),
        },
        ...(record.affiliationActive && !record.trocAccepte
          ? { affiliation: { create: { remuneration_fixe: record.remunerationAffiliation, active: true } } }
          : {}),
      },
      select: { id: true },
    });

    return created.id;
  }
}
