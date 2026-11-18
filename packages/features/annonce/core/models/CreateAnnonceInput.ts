import type { AnnoncePhotoInput } from "./AnnoncePhotoInput";

export type CreateAnnonceInput = {
  titre: string;
  description: string;
  etat: "NEUF" | "OCCASION";
  prix: string;
  quantite: number;
  quartier: string;
  trocAccepte: boolean;
  categorieId: string;
  categorieSouhaiteeId: string | null;
  souhaitEchangeDescription: string | null;
  affiliationActive: boolean;
  remunerationAffiliation: string;
  photos: AnnoncePhotoInput[];
};
