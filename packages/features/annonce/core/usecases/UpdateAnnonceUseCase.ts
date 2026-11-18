import type { AnnoncePhotoInput } from "../models/AnnoncePhotoInput";

export type UpdateAnnonceInput = {
  annonceId: string;
  userId: string;
  titre: string;
  description: string;
  etat: "NEUF" | "OCCASION";
  categorieId: string;
  prix: string;
  quantite: number;
  quartier: string;
  trocAccepte: boolean;
  categorieSouhaiteeId: string | null;
  souhaitEchangeDescription: string | null;
  affiliationActive: boolean;
  remunerationAffiliation: string;
  retainedPhotoIds: string[];
  photos: AnnoncePhotoInput[];
};

export type UpdateAnnonceResult = "updated" | "invalid_input" | "not_found" | "locked";

export interface UpdateAnnonceUseCase {
  execute(input: UpdateAnnonceInput): Promise<UpdateAnnonceResult>;
}
