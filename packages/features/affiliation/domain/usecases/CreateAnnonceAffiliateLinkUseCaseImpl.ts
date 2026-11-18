import type { AnnonceAffiliateLinkRepository } from "../../core/repositories/AnnonceAffiliateLinkRepository";
import type { CreateAnnonceAffiliateLinkUseCase } from "../../core/usecases/CreateAnnonceAffiliateLinkUseCase";

type Dependencies = { annonceAffiliateLinkRepository: AnnonceAffiliateLinkRepository };

export class CreateAnnonceAffiliateLinkUseCaseImpl implements CreateAnnonceAffiliateLinkUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  execute(annonceId: string, userId: string): Promise<string | null> {
    return this.dependencies.annonceAffiliateLinkRepository.createOrGetActive(annonceId, userId);
  }
}
