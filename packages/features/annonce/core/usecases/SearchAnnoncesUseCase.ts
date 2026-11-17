import type { AnnonceSearchItem } from "../models/AnnonceSearchItem";
import type { SearchAnnonceInput } from "../models/SearchAnnonceInput";

export type SearchAnnoncesResult = {
  items: AnnonceSearchItem[];
  nextCursor: string | null;
};

export interface SearchAnnoncesUseCase {
  execute(input: SearchAnnonceInput): Promise<SearchAnnoncesResult>;
}
