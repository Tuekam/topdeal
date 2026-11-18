"use client";

import type { FavoriteAnnonceItem } from "@topdeal/feature-annonce/core";
import type { AnnonceCategory } from "@topdeal/feature-annonce/core";
import type { AnnonceBrowseFilters } from "@topdeal/feature-annonce/presentation";
import { FavoriteAnnoncesScreen } from "@topdeal/feature-annonce/presentation";

type FavoriteAnnoncesPageClientProps = {
  items: FavoriteAnnonceItem[];
  query: string;
  filters: AnnonceBrowseFilters;
  categories: AnnonceCategory[];
  currentPage: number;
  previousPageHref: string | null;
  nextPageHref: string | null;
};

export function FavoriteAnnoncesPageClient(props: FavoriteAnnoncesPageClientProps) {
  const key = props.query + ":" + props.filters.sort + ":" + props.currentPage + ":" + props.items.map((item) => item.annonceId).join(",");
  return <FavoriteAnnoncesScreen key={key} initialItems={props.items} initialQuery={props.query} initialFilters={props.filters} categories={props.categories} currentPage={props.currentPage} previousPageHref={props.previousPageHref} nextPageHref={props.nextPageHref} />;
}
