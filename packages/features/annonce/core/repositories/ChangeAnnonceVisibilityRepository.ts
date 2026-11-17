export type SellerAnnonceVisibility = "PUBLIEE" | "MASQUEE";

export interface ChangeAnnonceVisibilityRepository {
  changeVisibility(
    annonceId: string,
    userId: string,
    visibility: SellerAnnonceVisibility,
  ): Promise<boolean>;
}
