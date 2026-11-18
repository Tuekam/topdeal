import type { AnnonceSort } from "./AnnonceSort";

export type SearchAnnonceInput = {
  query: string;
  categorieId: string | null;
  etat: "NEUF" | "OCCASION" | null;
  prixMin: string | null;
  prixMax: string | null;
  quartier: string | null;
  trocAccepte: boolean | null;
  sort: AnnonceSort;
  cursor: string | null;
};
