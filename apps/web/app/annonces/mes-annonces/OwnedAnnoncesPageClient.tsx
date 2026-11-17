"use client";

import { useRouter } from "next/navigation";
import type { AnnonceOwnerItem } from "@topdeal/feature-annonce/core";
import { OwnedAnnoncesScreen } from "@topdeal/feature-annonce/presentation";

type OwnedAnnoncesPageClientProps = {
  items: AnnonceOwnerItem[];
  currentPage: number;
  previousPageHref: string | null;
  nextPageHref: string | null;
};

export function OwnedAnnoncesPageClient({ items, currentPage, previousPageHref, nextPageHref }: OwnedAnnoncesPageClientProps) {
  const router = useRouter();
  return (
    <OwnedAnnoncesScreen
      items={items}
      currentPage={currentPage}
      previousPageHref={previousPageHref}
      nextPageHref={nextPageHref}
      onChanged={() => router.refresh()}
    />
  );
}
