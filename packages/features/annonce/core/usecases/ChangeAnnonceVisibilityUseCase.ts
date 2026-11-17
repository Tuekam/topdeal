import type { SellerAnnonceVisibility } from "../repositories/ChangeAnnonceVisibilityRepository";

export type ChangeAnnonceVisibilityInput = {
  annonceId: string;
  userId: string;
  visibility: SellerAnnonceVisibility;
};

export type ChangeAnnonceVisibilityResult = "updated" | "not_found";

export interface ChangeAnnonceVisibilityUseCase {
  execute(input: ChangeAnnonceVisibilityInput): Promise<ChangeAnnonceVisibilityResult>;
}
