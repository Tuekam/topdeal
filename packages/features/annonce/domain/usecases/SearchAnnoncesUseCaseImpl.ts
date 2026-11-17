import type { AnnoncePhotoStorage } from "../../core/repositories/AnnoncePhotoStorage";
import type { SearchAnnoncesRepository } from "../../core/repositories/SearchAnnoncesRepository";
import type { SearchAnnonceInput } from "../../core/models/SearchAnnonceInput";
import type { SearchAnnoncesUseCase } from "../../core/usecases/SearchAnnoncesUseCase";

const SEARCH_PAGE_SIZE = 24;
const MAX_SEARCH_LENGTH = 200;

type Dependencies = {
  searchAnnoncesRepository: SearchAnnoncesRepository;
  annoncePhotoStorage: AnnoncePhotoStorage;
};

function isValidPrice(value: string | null): boolean {
  return value === null || /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value);
}

function validate(input: SearchAnnonceInput): void {
  if (input.query.length > MAX_SEARCH_LENGTH) throw new Error("Invalid search query.");
  if (!isValidPrice(input.prixMin) || !isValidPrice(input.prixMax)) {
    throw new Error("Invalid price filter.");
  }
  if (
    input.prixMin !== null && input.prixMax !== null &&
    Number(input.prixMin) > Number(input.prixMax)
  ) throw new Error("Invalid price range.");
}

export class SearchAnnoncesUseCaseImpl implements SearchAnnoncesUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: SearchAnnonceInput) {
    validate(input);
    const page = await this.dependencies.searchAnnoncesRepository.search(
      input,
      SEARCH_PAGE_SIZE,
    );
    const items = await Promise.all(page.items.map(async (item) => ({
      id: item.id,
      titre: item.titre,
      prix: item.prix,
      etat: item.etat,
      trocAccepte: item.trocAccepte,
      quantite: item.quantite,
      disponibilite: item.disponibilite,
      quartier: item.quartier,
      categorie: item.categorie,
      photoUrl: item.photoReference
        ? await this.dependencies.annoncePhotoStorage.createReadUrl(item.photoReference)
        : null,
    })));

    return { items, nextCursor: page.nextCursor };
  }
}
