import type { SearchAnnonceInput } from "../models/SearchAnnonceInput";

export type SearchAnnonceRecord = {
  id: string;
  titre: string;
  prix: string;
  etat: "NEUF" | "OCCASION";
  trocAccepte: boolean;
  quantite: number;
  disponibilite: "DISPONIBLE" | "INDISPONIBLE" | "EPUISEE";
  quartier: string | null;
  categorie: { id: string; nom: string };
  photoReference: string | null;
};

export type SearchAnnoncePage = {
  items: SearchAnnonceRecord[];
  nextCursor: string | null;
};

export interface SearchAnnoncesRepository {
  search(input: SearchAnnonceInput, pageSize: number): Promise<SearchAnnoncePage>;
}
