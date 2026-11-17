export type AnnonceDraft = {
  titre: string;
  description: string;
  etat: "NEUF" | "OCCASION" | "";
  categorieId: string;
  sousCategorieId: string;
  prix: string;
  quantite: string;
  quartier: string;
  photos: File[];
  trocAccepte: boolean;
  souhaitEchangeDescription: string;
};
