import type { GetAnnonceFavoriteIdsRepository } from "../../core/repositories/GetAnnonceFavoriteIdsRepository";
import type { GetAnnonceFavoriteIdsUseCase } from "../../core/usecases/GetAnnonceFavoriteIdsUseCase";

type Dependencies = { getAnnonceFavoriteIdsRepository: GetAnnonceFavoriteIdsRepository };

export class GetAnnonceFavoriteIdsUseCaseImpl implements GetAnnonceFavoriteIdsUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  execute(userId: string, annonceIds: string[]): Promise<string[]> {
    return this.dependencies.getAnnonceFavoriteIdsRepository.find(userId, annonceIds);
  }
}
