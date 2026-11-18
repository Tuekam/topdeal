import type { FavoriteAnnoncePage } from "../models/FavoriteAnnoncePage";
import type { FavoriteAnnonceFilters } from "../repositories/GetFavoriteAnnoncesRepository";

export interface GetFavoriteAnnoncesUseCase {
  execute(userId: string, filters: FavoriteAnnonceFilters, cursor: string | null): Promise<FavoriteAnnoncePage>;
}
