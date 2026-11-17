import type { StoredAnnoncePhoto } from "../models/StoredAnnoncePhoto";

export type PublicAnnonceRecord = {
  id: string;
  titre: string;
  description: string | null;
  etat: "NEUF" | "OCCASION";
  prix: string;
  quantite: number;
  disponibilite: "DISPONIBLE" | "INDISPONIBLE" | "EPUISEE";
  quartier: string | null;
  trocAccepte: boolean;
  categorie: { id: string; nom: string; parent: { id: string; nom: string } | null };
  vendeur: { prenom: string; nom: string; dateCreation: string };
  photos: Array<StoredAnnoncePhoto & { id: string; ordre: number }>;
};

export interface GetPublicAnnonceRepository {
  findById(id: string): Promise<PublicAnnonceRecord | null>;
}
