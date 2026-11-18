export interface GetAnnonceFavoriteIdsRepository {
  find(userId: string, annonceIds: string[]): Promise<string[]>;
}
