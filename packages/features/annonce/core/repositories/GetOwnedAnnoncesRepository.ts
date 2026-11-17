import type { AnnonceOwnerItem } from "../models/AnnonceOwnerItem";

export type OwnedAnnonceRecord = Omit<AnnonceOwnerItem, "photoUrl"> & {
  photoReference: string | null;
};

export type OwnedAnnoncePage = {
  items: OwnedAnnonceRecord[];
  nextCursor: string | null;
};

export interface GetOwnedAnnoncesRepository {
  findByOwner(userId: string, cursor: string | null, pageSize: number): Promise<OwnedAnnoncePage>;
}
