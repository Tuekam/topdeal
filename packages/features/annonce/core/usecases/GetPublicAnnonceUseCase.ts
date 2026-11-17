import type { AnnonceDetails } from "../models/AnnonceDetails";

export interface GetPublicAnnonceUseCase {
  execute(annonceId: string): Promise<AnnonceDetails | null>;
}
