import type { AnnonceOwnerItem } from "../models/AnnonceOwnerItem";

export type GetOwnedAnnoncesResult = {
  items: AnnonceOwnerItem[];
  nextCursor: string | null;
};

export interface GetOwnedAnnoncesUseCase {
  execute(userId: string, cursor: string | null): Promise<GetOwnedAnnoncesResult>;
}
