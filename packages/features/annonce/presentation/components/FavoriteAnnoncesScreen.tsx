"use client";

import { useEffect, useRef, useState } from "react";
import type { FavoriteAnnonceItem } from "../../core/models/FavoriteAnnonceItem";
import type { AnnonceCategory } from "../../core/models/AnnonceCategory";
import { ANNONCE_SEARCH_QUERY_EVENT, type AnnonceSearchQueryEvent } from "../types/AnnonceSearchQueryEvent";
import { AnnonceBrowseControls, type AnnonceBrowseFilters } from "./AnnonceBrowseControls";
import { AnnoncePagination } from "./AnnoncePagination";
import { AnnonceFavoriteButton } from "./AnnonceFavoriteButton";
import { AnnonceProductCard } from "./AnnonceProductCard";
import { useToast } from "@topdeal/ui";

type FavoriteAnnoncesScreenProps = {
  initialItems: FavoriteAnnonceItem[];
  initialQuery: string;
  categories: AnnonceCategory[];
  initialFilters: AnnonceBrowseFilters;
  currentPage: number;
  previousPageHref: string | null;
  nextPageHref: string | null;
};

export function FavoriteAnnoncesScreen({
  initialItems,
  initialQuery,
  categories,
  initialFilters,
  currentPage,
  previousPageHref,
  nextPageHref,
}: FavoriteAnnoncesScreenProps) {
  const [items, setItems] = useState(initialItems);
  const [filters, setFilters] = useState<AnnonceBrowseFilters>({ ...initialFilters, query: initialQuery });
  const [nextHref, setNextHref] = useState(nextPageHref);
  const [previousHref, setPreviousHref] = useState(previousPageHref);
  const [visiblePage, setVisiblePage] = useState(currentPage);
  const [isSearching, setIsSearching] = useState(false);
  const showToast = useToast();
  const timer = useRef<number | null>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    request.current?.abort();
  }, []);

  function search(nextFilters: AnnonceBrowseFilters, delay = 100) {
    setFilters(nextFilters);
    if (timer.current !== null) window.clearTimeout(timer.current);
    request.current?.abort();
    timer.current = window.setTimeout(async () => {
      const controller = new AbortController();
      request.current = controller;
      setIsSearching(true);
      const params = new URLSearchParams();
      if (nextFilters.query.trim()) params.set("q", nextFilters.query.trim());
      if (nextFilters.categorieId) params.set("categorieId", nextFilters.categorieId);
      if (nextFilters.etat) params.set("etat", nextFilters.etat);
      if (nextFilters.prixMin) params.set("prixMin", nextFilters.prixMin);
      if (nextFilters.prixMax) params.set("prixMax", nextFilters.prixMax);
      if (nextFilters.quartier) params.set("quartier", nextFilters.quartier);
      if (nextFilters.trocAccepte !== null) params.set("trocAccepte", String(nextFilters.trocAccepte));
      if (nextFilters.sort !== "recent") params.set("sort", nextFilters.sort);
      try {
        const response = await fetch("/api/annonces/favoris?" + params.toString(), {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          showToast({ kind: "error", title: "Favoris non chargés", description: "Impossible de mettre à jour la liste. Réessayez." });
          return;
        }
        const result: { items: FavoriteAnnonceItem[]; nextCursor: string | null } = await response.json();
        setItems(result.items);
        setVisiblePage(1);
        setPreviousHref(null);
        const nextParams = new URLSearchParams(params);
        if (result.nextCursor) {
          nextParams.set("cursor", result.nextCursor);
          setNextHref("/annonces/favoris?" + nextParams.toString());
        } else setNextHref(null);
        window.history.replaceState(null, "", "/annonces/favoris" + (params.size ? "?" + params.toString() : ""));
      } catch {
        if (!controller.signal.aborted) {
          showToast({ kind: "error", title: "Favoris non chargés", description: "Vérifiez votre connexion puis réessayez." });
        }
      } finally {
        if (request.current === controller) {
          request.current = null;
          setIsSearching(false);
        }
      }
    }, delay);
  }

  useEffect(() => {
    function handleHeaderSearch(event: Event) {
      search({ ...filters, query: (event as AnnonceSearchQueryEvent).detail.query });
    }
    window.addEventListener(ANNONCE_SEARCH_QUERY_EVENT, handleHeaderSearch);
    return () => window.removeEventListener(ANNONCE_SEARCH_QUERY_EVENT, handleHeaderSearch);
  }, [filters]);

  return (
    <main className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-text-secondary">Votre sélection</p>
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Mes favoris</h1>
      </header>

      <div aria-busy={isSearching}><AnnonceBrowseControls categories={categories} filters={filters} onChange={(next) => search(next)} /></div>

      {items.length === 0 ? (
        <section className="mt-7 rounded-card border border-border bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold text-text">{filters.query || filters.categorieId || filters.etat || filters.prixMin || filters.prixMax || filters.quartier || filters.trocAccepte !== null ? "Aucun favori ne correspond à ces filtres" : "Aucune annonce dans vos favoris"}</h2>
          <p className="mt-2 text-sm text-text-secondary">Ajoutez des annonces avec le bouton cœur pour les retrouver ici.</p>
          {!filters.query && !filters.categorieId && !filters.etat && !filters.prixMin && !filters.prixMax && !filters.quartier && filters.trocAccepte === null && <a className="td-button td-button--primary mt-5" href="/annonces">Parcourir les annonces</a>}
        </section>
      ) : (
        <section aria-label="Mes annonces favorites" className="mt-7 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {items.map((item) => (
            <AnnonceProductCard
              annonce={{ ...item.annonce, id: item.annonceId }}
              favoriteControl={<AnnonceFavoriteButton annonceId={item.annonceId} annonceTitle={item.annonce.titre} isFavorite favoriteStateReady presentation="icon" onFavoriteChange={(isFavorite) => { if (!isFavorite) setItems((current) => current.filter((favorite) => favorite.annonceId !== item.annonceId)); }} />}
              linkDisabled={item.indisponible}
              key={item.annonceId}
              status={item.indisponible ? "Annonce indisponible" : undefined}
            />
          ))}
        </section>
      )}

      <AnnoncePagination currentPage={visiblePage} label="Pagination des favoris" nextPageHref={nextHref} previousPageHref={previousHref} />
    </main>
  );
}
