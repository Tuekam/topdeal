export interface GetAnnonceFavoriteIdsUseCase {
  execute(userId: string, annonceIds: string[]): Promise<string[]>;
}
