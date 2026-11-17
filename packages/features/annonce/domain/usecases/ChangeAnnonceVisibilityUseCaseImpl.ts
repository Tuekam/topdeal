import type { ChangeAnnonceVisibilityRepository } from "../../core/repositories/ChangeAnnonceVisibilityRepository";
import type {
  ChangeAnnonceVisibilityInput,
  ChangeAnnonceVisibilityResult,
  ChangeAnnonceVisibilityUseCase,
} from "../../core/usecases/ChangeAnnonceVisibilityUseCase";

type Dependencies = {
  changeAnnonceVisibilityRepository: ChangeAnnonceVisibilityRepository;
};

export class ChangeAnnonceVisibilityUseCaseImpl implements ChangeAnnonceVisibilityUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(
    input: ChangeAnnonceVisibilityInput,
  ): Promise<ChangeAnnonceVisibilityResult> {
    const changed = await this.dependencies.changeAnnonceVisibilityRepository.changeVisibility(
      input.annonceId,
      input.userId,
      input.visibility,
    );
    return changed ? "updated" : "not_found";
  }
}
