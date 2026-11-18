export type AnnonceOwnerItem = {
  id: string;
  titre: string;
  etat: "NEUF" | "OCCASION";
  trocAccepte: boolean;
  prix: string;
  quantite: number;
  quartier: string | null;
  categorie: { id: string; nom: string };
  disponibilite: "DISPONIBLE" | "INDISPONIBLE" | "EPUISEE";
  visibilite: "PUBLIEE" | "MASQUEE" | "SUSPENDUE";
  photoUrl: string | null;
};
