import type { CreateAnnonceInput } from "../models/CreateAnnonceInput";
import type { StoredAnnoncePhoto } from "../models/StoredAnnoncePhoto";

export type CreateAnnonceRecord = Omit<CreateAnnonceInput, "photos"> & {
  userId: string;
  photos: StoredAnnoncePhoto[];
};

export interface CreateAnnonceRepository {
  categoriesAreActive(
    categorieId: string,
    categorieSouhaiteeId: string | null,
  ): Promise<boolean>;
  create(record: CreateAnnonceRecord): Promise<string | null>;
}
