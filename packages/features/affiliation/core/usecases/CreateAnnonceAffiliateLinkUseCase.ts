export interface CreateAnnonceAffiliateLinkUseCase {
  execute(annonceId: string, userId: string): Promise<string | null>;
}
