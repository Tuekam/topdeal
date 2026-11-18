import type { FavoriteAnnonceRecord } from "../models/FavoriteAnnonceRecord";
import type { AnnonceSort } from "../models/AnnonceSort";

export type FavoriteAnnonceFilters = {
  query: string;
  categorieId: string | null;
  etat: "NEUF" | "OCCASION" | null;
  prixMin: string | null;
  prixMax: string | null;
  quartier: string | null;
  trocAccepte: boolean | null;
  sort: AnnonceSort;
};

export type FavoriteAnnonceRecordPage = {
  items: FavoriteAnnonceRecord[];
  nextCursor: string | null;
};

export interface GetFavoriteAnnoncesRepository {
  findByUser(
    userId: string,
    filters: FavoriteAnnonceFilters,
    cursor: string | null,
    pageSize: number,
  ): Promise<FavoriteAnnonceRecordPage>;
}
