"use client";

import type { AnnonceOwnerItem } from "../../core/models/AnnonceOwnerItem";
import { AnnoncePagination } from "./AnnoncePagination";
import { OwnedAnnonceCard } from "./OwnedAnnonceCard";

type OwnedAnnoncesScreenProps = {
  items: AnnonceOwnerItem[];
  currentPage: number;
  previousPageHref: string | null;
  nextPageHref: string | null;
  onChanged(): void;
};

export function OwnedAnnoncesScreen({
  items,
  currentPage,
  previousPageHref,
  nextPageHref,
  onChanged,
}: OwnedAnnoncesScreenProps) {
  return (
    <main className="mx-auto w-full max-w-content px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-text-secondary">Espace vendeur</p>
          <h1 className="text-3xl font-semibold text-text">Mes annonces</h1>
        </div>
        <a className="td-button td-button--primary" href="/annonces/nouvelle">Publier une annonce</a>
      </header>

      {items.length === 0 ? (
        <p className="rounded-card border border-border bg-surface p-8 text-center text-text-secondary">
          Vous n’avez pas encore publié d’annonce.
        </p>
      ) : (
        <section aria-label="Mes annonces" className="grid gap-4">
          {items.map((annonce) => (
            <OwnedAnnonceCard annonce={annonce} key={annonce.id} onChanged={onChanged} />
          ))}
        </section>
      )}

      <AnnoncePagination
        currentPage={currentPage}
        label="Pagination de mes annonces"
        nextPageHref={nextPageHref}
        previousPageHref={previousPageHref}
      />
    </main>
  );
}
