import type { OwnedAnnonceEditDetails } from "../models/OwnedAnnonceEditDetails";

export type OwnedAnnonceEditRecord = Omit<OwnedAnnonceEditDetails, "photos"> & {
  photos: Array<{ id: string; reference: string }>;
};

export interface GetOwnedAnnonceForEditRepository {
  findByOwner(annonceId: string, userId: string): Promise<OwnedAnnonceEditRecord | null>;
}
