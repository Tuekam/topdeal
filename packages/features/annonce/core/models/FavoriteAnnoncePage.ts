import type { FavoriteAnnonceItem } from "./FavoriteAnnonceItem";

export type FavoriteAnnoncePage = {
  items: FavoriteAnnonceItem[];
  nextCursor: string | null;
};
