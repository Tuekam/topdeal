export function formatAffiliatePrice(basePrice: string, remuneration: string): string {
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(basePrice) || !/^[1-9]\d{0,9}$/.test(remuneration)) {
    return "—";
  }
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 2,
  }).format(Number(basePrice) + Number(remuneration));
}
