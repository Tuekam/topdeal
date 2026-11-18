import type { SetAnnonceFavoriteRepository } from "../../core/repositories/SetAnnonceFavoriteRepository";
import type { SetAnnonceFavoriteUseCase } from "../../core/usecases/SetAnnonceFavoriteUseCase";

type Dependencies = { setAnnonceFavoriteRepository: SetAnnonceFavoriteRepository };

export class SetAnnonceFavoriteUseCaseImpl implements SetAnnonceFavoriteUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  execute(userId: string, annonceId: string, isFavorite: boolean): Promise<boolean> {
    return this.dependencies.setAnnonceFavoriteRepository.set(userId, annonceId, isFavorite);
  }
}
