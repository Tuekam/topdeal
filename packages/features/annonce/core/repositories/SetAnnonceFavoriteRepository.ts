export interface SetAnnonceFavoriteRepository {
  set(userId: string, annonceId: string, isFavorite: boolean): Promise<boolean>;
}
