import type { GetActiveAnnonceCategoriesRepository } from "../../core/repositories/GetActiveAnnonceCategoriesRepository";
import type { GetActiveAnnonceCategoriesUseCase } from "../../core/usecases/GetActiveAnnonceCategoriesUseCase";

type Dependencies = {
  getActiveAnnonceCategoriesRepository: GetActiveAnnonceCategoriesRepository;
};

export class GetActiveAnnonceCategoriesUseCaseImpl implements GetActiveAnnonceCategoriesUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  execute() {
    return this.dependencies.getActiveAnnonceCategoriesRepository.findAll();
  }
}
