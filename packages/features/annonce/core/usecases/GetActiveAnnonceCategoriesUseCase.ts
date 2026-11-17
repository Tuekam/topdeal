import type { AnnonceCategory } from "../models/AnnonceCategory";

export interface GetActiveAnnonceCategoriesUseCase {
  execute(): Promise<AnnonceCategory[]>;
}
