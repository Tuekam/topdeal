import type { PrismaClient } from "@topdeal/database";
import type {
  UpdateAnnonceRecord,
  UpdateAnnonceRepository,
  UpdateAnnonceRepositoryResult,
} from "../../core/repositories/UpdateAnnonceRepository";

type Dependencies = { prisma: PrismaClient };

export class UpdateAnnonceRepositoryImpl implements UpdateAnnonceRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async categoriesAreActive(categorieId: string, categorieSouhaiteeId: string | null): Promise<boolean> {
    const categoryIds = [categorieId, categorieSouhaiteeId].filter((id): id is string => Boolean(id));
    const count = await this.dependencies.prisma.categorie.count({
      where: { id: { in: categoryIds }, active: true },
    });
    return count === new Set(categoryIds).size;
  }

  async update(
    annonceId: string,
    userId: string,
    record: UpdateAnnonceRecord,
  ): Promise<UpdateAnnonceRepositoryResult> {
    return this.dependencies.prisma.$transaction(async (transaction) => {
      const current = await transaction.annonce.findFirst({
        where: { id: annonceId, utilisateur_id: userId },
        select: { photo_annonce: { select: { id: true, cle: true } } },
      });
      if (!current) return { status: "not_found" } as const;

      const activeOrders = await transaction.commande.count({
        where: {
          annonce_id: annonceId,
          statut: { notIn: ["TERMINEE", "ANNULEE", "REMBOURSEE"] },
        },
      });
      if (activeOrders > 0) return { status: "locked" } as const;

      const currentPhotoIds = new Set(current.photo_annonce.map((photo) => photo.id));
      const retainedIdsAreValid = record.retainedPhotoIds.every((id) => currentPhotoIds.has(id));
      const finalPhotoCount = record.retainedPhotoIds.length + record.photos.length;
      if (!retainedIdsAreValid || finalPhotoCount < 1 || finalPhotoCount > 6) {
        return { status: "invalid_input" } as const;
      }

      const categoryIds = [record.categorieId, record.categorieSouhaiteeId]
        .filter((id): id is string => Boolean(id));
      const activeCategoryCount = await transaction.categorie.count({
        where: { id: { in: categoryIds }, active: true },
      });
      if (activeCategoryCount !== new Set(categoryIds).size) {
        return { status: "invalid_input" } as const;
      }

      const removedPhotos = current.photo_annonce.filter((photo) => !record.retainedPhotoIds.includes(photo.id));
      await transaction.annonce.update({
        where: { id: annonceId },
        data: {
          titre: record.titre.trim(),
          description: record.description.trim(),
          etat: record.etat,
          categorie_id: record.categorieId,
          prix: record.prix,
          quantite: record.quantite,
          quartier: record.quartier.trim(),
          troc_accepte: record.trocAccepte,
          categorie_souhaitee_id: record.trocAccepte ? record.categorieSouhaiteeId : null,
          souhait_echange_description: record.trocAccepte
            ? record.souhaitEchangeDescription?.trim() || null
            : null,
        },
      });

      if (record.affiliationActive && !record.trocAccepte) {
        await transaction.affiliation.upsert({
          where: { annonce_id: annonceId },
          create: { annonce_id: annonceId, active: true, remuneration_fixe: record.remunerationAffiliation },
          update: { active: true, remuneration_fixe: record.remunerationAffiliation },
        });
      } else {
        await transaction.affiliation.updateMany({
          where: { annonce_id: annonceId },
          data: { active: false },
        });
      }

      if (removedPhotos.length > 0) {
        await transaction.photo_annonce.deleteMany({
          where: { annonce_id: annonceId, id: { in: removedPhotos.map((photo) => photo.id) } },
        });
      }
      if (record.photos.length > 0) {
        await transaction.photo_annonce.createMany({
          data: record.photos.map((photo, index) => ({
            annonce_id: annonceId,
            cle: photo.key,
            nom_original: photo.originalName,
            type_mime: photo.contentType,
            taille: photo.size,
            ordre: record.retainedPhotoIds.length + index,
          })),
        });
      }

      return { status: "updated", removedPhotoKeys: removedPhotos.map((photo) => photo.cle) } as const;
    });
  }
}
