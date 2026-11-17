import type { UpdateAnnonceRepository } from "../../core/repositories/UpdateAnnonceRepository";
import type {
  UpdateAnnonceInput,
  UpdateAnnonceResult,
  UpdateAnnonceUseCase,
} from "../../core/usecases/UpdateAnnonceUseCase";

const PRICE_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;

type Dependencies = {
  updateAnnonceRepository: UpdateAnnonceRepository;
};

export class UpdateAnnonceUseCaseImpl implements UpdateAnnonceUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(input: UpdateAnnonceInput): Promise<UpdateAnnonceResult> {
    if (
      !PRICE_PATTERN.test(input.prix) ||
      !Number.isInteger(input.quantite) ||
      input.quantite <= 0
    ) return "invalid_input";

    const updated = await this.dependencies.updateAnnonceRepository.updatePriceAndQuantity(
      input.annonceId,
      input.userId,
      input.prix,
      input.quantite,
    );
    return updated ? "updated" : "not_found";
  }
}
