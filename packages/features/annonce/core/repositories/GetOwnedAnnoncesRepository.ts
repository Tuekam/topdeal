import type { AnnonceOwnerItem } from "../models/AnnonceOwnerItem";
import type { AnnonceSort } from "../models/AnnonceSort";

export type OwnedAnnonceFilters = {
  query: string;
  categorieId: string | null;
  etat: "NEUF" | "OCCASION" | null;
  prixMin: string | null;
  prixMax: string | null;
  quartier: string | null;
  trocAccepte: boolean | null;
  sort: AnnonceSort;
  visibilite: "PUBLIEE" | "MASQUEE" | "SUSPENDUE" | null;
};

export type OwnedAnnonceRecord = Omit<AnnonceOwnerItem, "photoUrl"> & {
  photoReference: string | null;
};

export type OwnedAnnoncePage = {
  items: OwnedAnnonceRecord[];
  nextCursor: string | null;
};

export interface GetOwnedAnnoncesRepository {
  findByOwner(userId: string, filters: OwnedAnnonceFilters, cursor: string | null, pageSize: number): Promise<OwnedAnnoncePage>;
}
