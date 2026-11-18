"use client";

import type { AnnonceOwnerItem } from "@topdeal/feature-annonce/core";
import type { AnnonceCategory, OwnedAnnonceFilters } from "@topdeal/feature-annonce/core";
import { OwnedAnnoncesScreen } from "@topdeal/feature-annonce/presentation";

type OwnedAnnoncesPageClientProps = {
  items: AnnonceOwnerItem[];
  categories: AnnonceCategory[];
  filters: OwnedAnnonceFilters;
  currentPage: number;
  previousPageHref: string | null;
  nextPageHref: string | null;
};

export function OwnedAnnoncesPageClient({ items, categories, filters, currentPage, previousPageHref, nextPageHref }: OwnedAnnoncesPageClientProps) {
  const key = currentPage + ":" + JSON.stringify(filters) + ":" + items.map((item) => item.id).join(",");
  return (
    <OwnedAnnoncesScreen
      key={key}
      items={items}
      categories={categories}
      filters={filters}
      currentPage={currentPage}
      previousPageHref={previousPageHref}
      nextPageHref={nextPageHref}
    />
  );
}
