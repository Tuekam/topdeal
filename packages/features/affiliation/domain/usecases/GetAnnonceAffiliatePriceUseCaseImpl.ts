import type { AnnonceAffiliateLinkRepository } from "../../core/repositories/AnnonceAffiliateLinkRepository";
import type { GetAnnonceAffiliatePriceUseCase } from "../../core/usecases/GetAnnonceAffiliatePriceUseCase";

type Dependencies = { annonceAffiliateLinkRepository: AnnonceAffiliateLinkRepository };

function toCents(value: string): number | null {
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

function fromCents(value: number): string {
  return `${Math.floor(value / 100)}.${String(value % 100).padStart(2, "0")}`;
}

export class GetAnnonceAffiliatePriceUseCaseImpl implements GetAnnonceAffiliatePriceUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(annonceId: string, code: string): Promise<string | null> {
    if (!/^[0-9a-f-]{36}$/i.test(code)) return null;
    const record = await this.dependencies.annonceAffiliateLinkRepository.findActivePrice(annonceId, code);
    if (!record) return null;
    const basePrice = toCents(record.basePrice);
    const remuneration = toCents(record.remuneration);
    if (basePrice === null || remuneration === null || basePrice + remuneration > 999_999_999_999) return null;
    return fromCents(basePrice + remuneration);
  }
}
