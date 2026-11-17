export type AnnonceOwnerItem = {
  id: string;
  titre: string;
  prix: string;
  quantite: number;
  disponibilite: "DISPONIBLE" | "INDISPONIBLE" | "EPUISEE";
  visibilite: "PUBLIEE" | "MASQUEE" | "SUSPENDUE";
  photoUrl: string | null;
};
