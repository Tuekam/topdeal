export type AffiliatePriceRecord = {
  basePrice: string;
  remuneration: string;
};

export interface AnnonceAffiliateLinkRepository {
  createOrGetActive(annonceId: string, userId: string): Promise<string | null>;
  findActivePrice(annonceId: string, code: string): Promise<AffiliatePriceRecord | null>;
}
