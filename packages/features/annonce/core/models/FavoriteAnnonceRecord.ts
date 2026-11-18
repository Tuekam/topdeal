export type FavoriteAnnonceRecord = {
  annonceId: string;
  dateAjout: string;
  annonce: {
    titre: string;
    prix: string;
    etat: "NEUF" | "OCCASION";
    trocAccepte: boolean;
    quantite: number;
    disponibilite: "DISPONIBLE" | "INDISPONIBLE" | "EPUISEE";
    quartier: string | null;
    visibilite: "PUBLIEE" | "MASQUEE" | "SUSPENDUE";
    categorieActive: boolean;
    categorie: { id: string; nom: string };
    photoReference: string | null;
  };
};
