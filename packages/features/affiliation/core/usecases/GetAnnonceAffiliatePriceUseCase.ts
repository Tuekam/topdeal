export interface GetAnnonceAffiliatePriceUseCase {
  execute(annonceId: string, code: string): Promise<string | null>;
}
