import type { StoredAnnoncePhoto } from "../models/StoredAnnoncePhoto";
import type { UpdateAnnonceInput } from "../usecases/UpdateAnnonceUseCase";

export type UpdateAnnonceRecord = Omit<UpdateAnnonceInput, "userId" | "annonceId" | "photos" | "retainedPhotoIds"> & {
  photos: StoredAnnoncePhoto[];
  retainedPhotoIds: string[];
};

export type UpdateAnnonceRepositoryResult =
  | { status: "updated"; removedPhotoKeys: string[] }
  | { status: "not_found" | "invalid_input" | "locked" };

export interface UpdateAnnonceRepository {
  categoriesAreActive(categorieId: string, categorieSouhaiteeId: string | null): Promise<boolean>;
  update(annonceId: string, userId: string, record: UpdateAnnonceRecord): Promise<UpdateAnnonceRepositoryResult>;
}
