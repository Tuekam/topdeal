import type { PrismaClient } from "@topdeal/database";
import type {
  AuthAccount,
  AuthUserRepository,
  NewAuthProfile,
} from "../../domain/interfaces/AuthUserRepository";

type Dependencies = {
  prisma: PrismaClient;
};

export class PrismaAuthUserRepository implements AuthUserRepository {
  constructor(private readonly dependencies: Dependencies) {}

  async isEmailAlreadyUsed(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const matches = await this.dependencies.prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM "utilisateur"
        WHERE "email" IS NOT NULL
          AND lower("email") = ${normalizedEmail}
      ) AS "exists"
    `;

    return matches[0]?.exists ?? false;
  }

  async findByExternalIdentity(
    externalId: string,
  ): Promise<AuthAccount | null> {
    const identity =
      await this.dependencies.prisma.identite_externe.findUnique({
        where: {
          fournisseur_identifiant_externe: {
            fournisseur: "FIREBASE",
            identifiant_externe: externalId,
          },
        },
        select: {
          utilisateur: {
            select: {
              date_naissance: true,
              nom: true,
              prenom: true,
              statut: true,
              telephone: true,
            },
          },
        },
      });

    if (!identity) {
      return null;
    }

    const user = identity.utilisateur;

    return {
      status: user.statut === "ACTIF" ? "active" : "suspended",
      profileComplete:
        user.prenom.trim().length > 0 &&
        user.nom.trim().length > 0 &&
        Boolean(user.telephone?.trim()) &&
        user.date_naissance !== null,
    };
  }

  async createProfileForExternalIdentity(profile: NewAuthProfile): Promise<"created" | "conflict"> {
    try {
      const created = await this.dependencies.prisma.$transaction(async (transaction) => {
        const existingIdentity = await transaction.identite_externe.findUnique({
          where: {
            fournisseur_identifiant_externe: {
              fournisseur: "FIREBASE",
              identifiant_externe: profile.externalId,
            },
          },
          select: {
            utilisateur: {
              select: {
                id: true,
                email: true,
                date_naissance: true,
                nom: true,
                prenom: true,
                statut: true,
                telephone: true,
              },
            },
          },
        });
        if (existingIdentity) {
          const user = existingIdentity.utilisateur;
          const profileComplete = Boolean(
            user.prenom.trim() && user.nom.trim() && user.telephone?.trim() && user.date_naissance,
          );
          if (
            user.statut !== "ACTIF" || profileComplete ||
            (user.email !== null && user.email.toLowerCase() !== profile.email)
          ) return false;

          await transaction.utilisateur.update({
            where: { id: user.id },
            data: {
              prenom: profile.givenName,
              nom: profile.familyName,
              telephone: profile.telephone,
              email: user.email ?? profile.email,
              date_naissance: new Date(`${profile.birthDate}T00:00:00.000Z`),
            },
          });
          return true;
        }

        const user = await transaction.utilisateur.create({
          data: {
            prenom: profile.givenName,
            nom: profile.familyName,
            telephone: profile.telephone,
            email: profile.email,
            date_naissance: new Date(`${profile.birthDate}T00:00:00.000Z`),
          },
          select: { id: true },
        });

        await transaction.identite_externe.create({
          data: {
            utilisateur_id: user.id,
            fournisseur: "FIREBASE",
            identifiant_externe: profile.externalId,
          },
        });
        return true;
      });

      return created ? "created" : "conflict";
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        return "conflict";
      }
      throw error;
    }
  }
}
