export type FavoriteAnnonceItem = {
  annonceId: string;
  dateAjout: string;
  indisponible: boolean;
  annonce: {
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
};
