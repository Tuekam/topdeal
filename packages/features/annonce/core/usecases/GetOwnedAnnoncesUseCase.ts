import type { AnnonceOwnerItem } from "../models/AnnonceOwnerItem";
import type { OwnedAnnonceFilters } from "../repositories/GetOwnedAnnoncesRepository";

export type GetOwnedAnnoncesResult = {
  items: AnnonceOwnerItem[];
  nextCursor: string | null;
};

export interface GetOwnedAnnoncesUseCase {
  execute(userId: string, filters: OwnedAnnonceFilters, cursor: string | null): Promise<GetOwnedAnnoncesResult>;
}
