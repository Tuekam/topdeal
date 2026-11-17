import type { AnnonceCategory } from "../models/AnnonceCategory";

export interface GetActiveAnnonceCategoriesRepository {
  findAll(): Promise<AnnonceCategory[]>;
}
