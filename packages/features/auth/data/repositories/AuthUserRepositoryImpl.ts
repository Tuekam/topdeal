import type { PrismaClient } from "@topdeal/database";
import type {
  AuthAccount,
  AuthUserRepository,
  NewAuthProfile,
} from "../../core/repositories/AuthUserRepository";

type Dependencies = {
  prisma: PrismaClient;
};

type StoredAuthProfile = {
  prenom: string;
  nom: string;
  telephone: string | null;
  date_naissance: Date | null;
};

function isProfileComplete(profile: StoredAuthProfile): boolean {
  return Boolean(
    profile.prenom.trim() &&
    profile.nom.trim() &&
    profile.telephone?.trim() &&
    profile.date_naissance,
  );
}

export class AuthUserRepositoryImpl implements AuthUserRepository {
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
      profileComplete: isProfileComplete(user),
    };
  }

  async createProfileForExternalIdentity(profile: NewAuthProfile): Promise<"created" | "conflict"> {
    try {
      // Le profil TopDeal et son identité Firebase doivent être créés ensemble ou pas du tout.
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
          if (
            user.statut !== "ACTIF" || isProfileComplete(user) ||
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
