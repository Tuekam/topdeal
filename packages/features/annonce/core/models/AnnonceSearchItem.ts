export type AnnonceSearchItem = {
  id: string;
  titre: string;
  prix: string;
  etat: "NEUF" | "OCCASION";
  trocAccepte: boolean;
  quantite: number;
  disponibilite: "DISPONIBLE" | "INDISPONIBLE" | "EPUISEE";
  quartier: string | null;
  categorie: { id: string; nom: string };
  photoUrl: string | null;
};
