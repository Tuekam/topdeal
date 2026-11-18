import type { OwnedAnnonceEditDetails } from "../models/OwnedAnnonceEditDetails";

export interface GetOwnedAnnonceForEditUseCase {
  execute(annonceId: string, userId: string): Promise<OwnedAnnonceEditDetails | null>;
}
