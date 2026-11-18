import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@topdeal/database";
import type { AnnonceAffiliateLinkRepository } from "../../core/repositories/AnnonceAffiliateLinkRepository";

type Dependencies = { prisma: PrismaClient };

export class AnnonceAffiliateLinkRepositoryImpl implements AnnonceAffiliateLinkRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async createOrGetActive(annonceId: string, userId: string): Promise<string | null> {
    const eligibleAnnonce = await this.dependencies.prisma.annonce.findFirst({
      where: {
        id: annonceId,
        utilisateur_id: { not: userId },
        visibilite: "PUBLIEE",
        disponibilite: "DISPONIBLE",
        troc_accepte: false,
        affiliation: { is: { active: true } },
      },
      select: { affiliation: { select: { id: true } } },
    });
    const affiliationId = eligibleAnnonce?.affiliation?.id;
    if (!affiliationId) return null;

    await this.dependencies.prisma.lien_affiliation.createMany({
      data: [{
        affiliation_id: affiliationId,
        utilisateur_id: userId,
        code_unique: randomUUID(),
        actif: true,
      }],
      // The partial unique index makes concurrent creates idempotent for active links.
      skipDuplicates: true,
    });

    const link = await this.dependencies.prisma.lien_affiliation.findFirst({
      where: { affiliation_id: affiliationId, utilisateur_id: userId, actif: true },
      select: { code_unique: true },
    });
    return link?.code_unique ?? null;
  }

  async findActivePrice(annonceId: string, code: string) {
    const link = await this.dependencies.prisma.lien_affiliation.findFirst({
      where: {
        code_unique: code,
        actif: true,
        affiliation: {
          is: {
            active: true,
            annonce: {
              is: {
                id: annonceId,
                visibilite: "PUBLIEE",
                disponibilite: "DISPONIBLE",
                troc_accepte: false,
              },
            },
          },
        },
      },
      select: {
        affiliation: {
          select: {
            remuneration_fixe: true,
            annonce: { select: { prix: true } },
          },
        },
      },
    });
    if (!link) return null;
    return {
      basePrice: link.affiliation.annonce.prix.toString(),
      remuneration: link.affiliation.remuneration_fixe.toString(),
    };
  }
}
