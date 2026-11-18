export interface SetAnnonceFavoriteUseCase {
  execute(userId: string, annonceId: string, isFavorite: boolean): Promise<boolean>;
}
