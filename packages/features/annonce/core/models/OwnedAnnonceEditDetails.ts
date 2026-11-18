export type OwnedAnnonceEditDetails = {
  id: string;
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
  photos: Array<{ id: string; url: string }>;
};
