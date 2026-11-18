import type { AnnoncePhoto } from "./AnnoncePhoto";

export type AnnonceDetails = {
  id: string;
  titre: string;
  description: string;
  etat: "NEUF" | "OCCASION";
  prix: string;
  quantite: number;
  disponibilite: "DISPONIBLE" | "INDISPONIBLE" | "EPUISEE";
  quartier: string;
  trocAccepte: boolean;
  affiliationDisponible: boolean;
  categorie: { id: string; nom: string; parent: { id: string; nom: string } | null };
  vendeur: { nomComplet: string; dateCreation: string };
  photos: AnnoncePhoto[];
};
