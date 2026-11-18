"use client";

import type { AnnonceCategory } from "../../core/models/AnnonceCategory";
import type { AnnonceSearchItem } from "../../core/models/AnnonceSearchItem";
import { Button, Select, useToast } from "@topdeal/ui";
import type { AnnonceSort } from "../../core/models/AnnonceSort";
import { AnnoncePagination } from "./AnnoncePagination";
import { AnnonceFilterFields, getAnnonceCategoryLabel, sortAnnonceRootCategories } from "./AnnonceFilterFields";
import { AnnonceFavoriteButton } from "./AnnonceFavoriteButton";
import { AnnonceProductCard } from "./AnnonceProductCard";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ANNONCE_SEARCH_QUERY_EVENT, type AnnonceSearchQueryEvent } from "../types/AnnonceSearchQueryEvent";

type AnnonceSearchFilters = {
  query: string;
  categorieId: string | null;
  etat: "NEUF" | "OCCASION" | null;
  prixMin: string | null;
  prixMax: string | null;
  quartier: string | null;
  trocAccepte: boolean | null;
  sort: AnnonceSort;
};

type AnnonceSearchScreenProps = {
  categories: AnnonceCategory[];
  filters: AnnonceSearchFilters;
  items: AnnonceSearchItem[];
  currentPage: number;
  previousPageHref: string | null;
  nextPageHref: string | null;
};

function hasActiveFilters(filters: AnnonceSearchFilters): boolean {
  return Boolean(
    filters.categorieId || filters.etat || filters.prixMin || filters.prixMax ||
    filters.quartier || filters.trocAccepte !== null,
  );
}

function createSearchParams(filters: AnnonceSearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categorieId) params.set("categorieId", filters.categorieId);
  if (filters.etat) params.set("etat", filters.etat);
  if (filters.prixMin) params.set("prixMin", filters.prixMin);
  if (filters.prixMax) params.set("prixMax", filters.prixMax);
  if (filters.quartier) params.set("quartier", filters.quartier);
  if (filters.trocAccepte !== null) params.set("trocAccepte", String(filters.trocAccepte));
  if (filters.sort !== "recent") params.set("sort", filters.sort);
  return params;
}

export function AnnonceSearchScreen({
  categories,
  filters,
  items,
  currentPage,
  previousPageHref,
  nextPageHref,
}: AnnonceSearchScreenProps) {
  const filterTimer = useRef<number | null>(null);
  const filterRequest = useRef<AbortController | null>(null);
  const filterDetails = useRef<HTMLDetailsElement>(null);
  const filterDialog = useRef<HTMLDialogElement>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCompactFilterViewport, setIsCompactFilterViewport] = useState(true);
  const [visibleItems, setVisibleItems] = useState(items);
  const [favoriteState, setFavoriteState] = useState<{ itemIds: string; ids: Set<string> }>(() => ({ itemIds: "", ids: new Set() }));
  const [visibleNextPageHref, setVisibleNextPageHref] = useState(nextPageHref);
  const [visiblePreviousPageHref, setVisiblePreviousPageHref] = useState(previousPageHref);
  const [visiblePage, setVisiblePage] = useState(currentPage);
  const [displayFilters, setDisplayFilters] = useState(filters);
  const [isFiltering, setIsFiltering] = useState(false);
  const showToast = useToast();
  const visibleItemIds = visibleItems.map((item) => item.id).join(",");
  const favoriteIdsLoaded = !visibleItemIds || favoriteState.itemIds === visibleItemIds;
  const favoriteIds = favoriteState.ids;
  useEffect(() => {
    const controller = new AbortController();
    if (!visibleItemIds) return () => controller.abort();

    void fetch(`/api/annonces/favoris?ids=${visibleItemIds}`, {
      cache: "no-store",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) {
        if (response.status !== 401 && !controller.signal.aborted) {
          showToast({ kind: "error", title: "Favoris non chargés", description: "Impossible de vérifier les annonces enregistrées." });
        }
        if (!controller.signal.aborted) setFavoriteState({ itemIds: visibleItemIds, ids: new Set() });
        return;
      }
      const result: { favoriteIds: string[] } = await response.json();
      if (!controller.signal.aborted) setFavoriteState({ itemIds: visibleItemIds, ids: new Set(result.favoriteIds) });
    }).catch(() => {
      if (!controller.signal.aborted) {
        setFavoriteState({ itemIds: visibleItemIds, ids: new Set() });
        showToast({ kind: "error", title: "Favoris non chargés", description: "Vérifiez votre connexion puis réessayez." });
      }
    });
    return () => controller.abort();
  }, [visibleItemIds]);
  useEffect(() => () => {
    if (filterTimer.current !== null) window.clearTimeout(filterTimer.current);
    filterRequest.current?.abort();
    filterRequest.current = null;
  }, []);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    function updateViewportMode() {
      setIsCompactFilterViewport(mediaQuery.matches);
    }
    updateViewportMode();
    mediaQuery.addEventListener("change", updateViewportMode);
    return () => mediaQuery.removeEventListener("change", updateViewportMode);
  }, []);
  useEffect(() => {
    const dialog = filterDialog.current;
    if (isCompactFilterViewport && isFiltersOpen && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [isCompactFilterViewport, isFiltersOpen]);
  useEffect(() => {
    function closeFiltersOnOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !filterDetails.current?.contains(event.target) &&
        !filterDialog.current?.contains(event.target)
      ) {
        if (filterDetails.current) filterDetails.current.open = false;
        setIsFiltersOpen(false);
      }
    }

    function closeFiltersOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && filterDetails.current) {
        filterDetails.current.open = false;
        setIsFiltersOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeFiltersOnOutsideClick);
    document.addEventListener("keydown", closeFiltersOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFiltersOnOutsideClick);
      document.removeEventListener("keydown", closeFiltersOnEscape);
    };
  }, []);
  useEffect(() => {
    function handleHeaderSearch(event: Event) {
      const query = (event as AnnonceSearchQueryEvent).detail.query;
      const nextFilters = { ...displayFilters, query };
      scheduleSearch(createSearchParams(nextFilters), nextFilters);
    }

    window.addEventListener(ANNONCE_SEARCH_QUERY_EVENT, handleHeaderSearch);
    return () => window.removeEventListener(ANNONCE_SEARCH_QUERY_EVENT, handleHeaderSearch);
  }, [displayFilters]);

  function scheduleSearch(
    params: URLSearchParams,
    nextFilters: AnnonceSearchFilters,
    delay = 220,
  ) {
    if (filterTimer.current !== null) window.clearTimeout(filterTimer.current);
    filterRequest.current?.abort();
    setDisplayFilters(nextFilters);
    filterTimer.current = window.setTimeout(async () => {
      const controller = new AbortController();
      filterRequest.current = controller;
      setIsFiltering(true);
      try {
        const response = await fetch(`/api/annonces?${params.toString()}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) {
          if (!controller.signal.aborted) showToast({ kind: "error", title: "Recherche impossible", description: "Impossible de charger les annonces. Réessayez." });
          return;
        }
        const result: { items: AnnonceSearchItem[]; nextCursor: string | null } = await response.json();
        setVisibleItems(result.items);
        setVisiblePreviousPageHref(null);
        setVisiblePage(1);
        const nextPageParams = new URLSearchParams(params);
        if (result.nextCursor) {
          nextPageParams.set("cursor", result.nextCursor);
          setVisibleNextPageHref(`/annonces?${nextPageParams.toString()}`);
        } else setVisibleNextPageHref(null);
        window.history.replaceState(null, "", `/annonces${params.size ? `?${params.toString()}` : ""}`);
      } catch {
        if (!controller.signal.aborted) showToast({ kind: "error", title: "Recherche impossible", description: "Vérifiez votre connexion puis réessayez." });
      } finally {
        if (filterRequest.current === controller) {
          filterRequest.current = null;
          setIsFiltering(false);
        }
      }
    }, delay);
  }
  function readFilters(form: HTMLFormElement): AnnonceSearchFilters {
    const formData = new FormData(form);
    const parentCategoryId = String(formData.get("categorieParentId") ?? "");
    const subcategoryId = String(formData.get("sousCategorieId") ?? "");
    const isSelectedSubcategory = categories.some(
      (category) => category.id === subcategoryId && category.parentId === parentCategoryId,
    );
    const categoryId = isSelectedSubcategory ? subcategoryId : parentCategoryId;
    return {
      ...displayFilters,
      categorieId: categoryId || null,
      etat: formData.get("etat") === "NEUF" || formData.get("etat") === "OCCASION" ? formData.get("etat") as "NEUF" | "OCCASION" : null,
      prixMin: String(formData.get("prixMin") ?? "").trim() || null,
      prixMax: String(formData.get("prixMax") ?? "").trim() || null,
      quartier: String(formData.get("quartier") ?? "").trim() || null,
      trocAccepte: formData.get("trocAccepte") === "true" ? true : formData.get("trocAccepte") === "false" ? false : null,
    };
  }
  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFilters = readFilters(event.currentTarget);
    const params = createSearchParams(nextFilters);
    scheduleSearch(params, nextFilters, 0);
    if (filterDetails.current) filterDetails.current.open = false;
    setIsFiltersOpen(false);
  }
  function closeFilters() {
    if (filterDetails.current) filterDetails.current.open = false;
    setIsFiltersOpen(false);
  }
  function chooseCategory(categoryId: string | null) {
    const nextFilters = { ...displayFilters, categorieId: categoryId };
    scheduleSearch(createSearchParams(nextFilters), nextFilters);
  }
  function clearFilters() {
    const nextFilters: AnnonceSearchFilters = {
      ...displayFilters,
      categorieId: null,
      etat: null,
      prixMin: null,
      prixMax: null,
      quartier: null,
      trocAccepte: null,
    };
    scheduleSearch(createSearchParams(nextFilters), nextFilters);
  }
  const rootCategories = sortAnnonceRootCategories(categories.filter((category) => category.parentId === null));
  const activeCategory = categories.find((category) => category.id === displayFilters.categorieId);
  const filterForm = (
    <form
      aria-label="Filtres des annonces"
      className={isCompactFilterViewport
        ? "relative grid max-h-[calc(100dvh-1rem)] w-full max-w-[680px] gap-4 overflow-y-auto overscroll-contain rounded-card border border-border bg-surface p-4 shadow-xl sm:p-5"
        : "absolute right-0 top-[calc(100%+8px)] z-20 grid max-h-[calc(100dvh-48px)] w-[min(680px,calc(100vw-32px))] gap-4 overflow-y-auto overscroll-contain rounded-card border border-border bg-surface p-5 shadow-xl"}
      onSubmit={applyFilters}
      style={isCompactFilterViewport
        ? { maxHeight: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 16px)" }
        : undefined}
    >
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-lg font-semibold text-text">Filtres</h2>
        <button
          aria-label="Fermer les filtres"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-xl text-text"
          onClick={closeFilters}
          type="button"
        >
          ×
        </button>
      </div>
      <input name="q" type="hidden" value={displayFilters.query} readOnly />
      <AnnonceFilterFields
        categories={categories}
        filters={displayFilters}
        onChange={(change) => {
          const nextFilters = { ...displayFilters, ...change };
          scheduleSearch(createSearchParams(nextFilters), nextFilters);
        }}
      />
      <div className="flex flex-col items-stretch gap-3 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
        <button className="order-3 cursor-pointer self-start border-0 bg-transparent p-0 text-sm font-medium text-text-secondary underline md:order-1" onClick={clearFilters} type="button">Effacer les filtres</button>
        <span aria-live="polite" className="order-2 text-xs text-text-secondary">Les résultats se mettent à jour automatiquement.</span>
        <Button className="order-1 w-full px-5 md:order-3 md:w-auto" type="submit">Valider les filtres</Button>
      </div>
    </form>
  );
  return (
    <>
      <section className="mx-auto flex w-full max-w-content flex-wrap items-end justify-between gap-6 px-4 pt-10 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text sm:text-[30px]">Bonjour</h1>
          <p className="mt-1.5 text-text-secondary">Les dernières annonces de Bafoussam.</p>
        </div>
        <div aria-label="Résumé du compte" className="flex rounded-xl border border-border bg-surface">
        </div>
      </section>

      <section className="mx-auto w-full max-w-content px-4 pt-8 sm:px-6" aria-label="Parcourir les annonces">
        <div className="relative flex flex-wrap items-end justify-between gap-4 border-b border-border">
          <nav aria-label="Catégories" className="flex max-w-full gap-8 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              aria-current={displayFilters.categorieId ? undefined : "page"}
              aria-pressed={!displayFilters.categorieId}
              className={`mb-[-1px] shrink-0 cursor-pointer border-b-2 bg-transparent px-0 pb-[14px] text-left font-medium no-underline ${displayFilters.categorieId ? "border-transparent text-text-secondary" : "border-text font-semibold text-text"}`}
              onClick={() => chooseCategory(null)}
              type="button"
            >Tout</button>
            {rootCategories.map((category) => (
              <button
                aria-current={activeCategory?.id === category.id || activeCategory?.parentId === category.id ? "page" : undefined}
                aria-pressed={activeCategory?.id === category.id || activeCategory?.parentId === category.id}
                className={`mb-[-1px] shrink-0 cursor-pointer border-b-2 bg-transparent px-0 pb-[14px] text-left font-medium no-underline ${activeCategory?.id === category.id || activeCategory?.parentId === category.id ? "border-text font-semibold text-text" : "border-transparent text-text-secondary hover:text-text"}`}
                onClick={() => chooseCategory(category.id)}
                type="button"
                key={category.id}
              >{getAnnonceCategoryLabel(category.name)}</button>
            ))}
          </nav>

          <div className="mb-2 flex shrink-0 gap-2">
            <details className="group relative" onToggle={(event) => setIsFiltersOpen(event.currentTarget.open)} ref={filterDetails}>
              <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-[10px] border border-input-border bg-surface px-[14px] text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
                <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
                  <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
                  <circle cx="16" cy="7" r="2" />
                  <circle cx="8" cy="17" r="2" />
                </svg>
                Filtres
                {hasActiveFilters(displayFilters) && <span aria-label="Filtres actifs" className="h-1.5 w-1.5 rounded-full bg-accent" />}
              </summary>
              {isFiltersOpen && isCompactFilterViewport && (
                <dialog
                  aria-label="Filtres des annonces"
                  className="fixed top-1/2 left-1/2 z-50 m-0 max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[680px] -translate-x-1/2 -translate-y-1/2 overflow-hidden border-0 bg-transparent p-0 shadow-none backdrop:bg-overlay"
                  onCancel={(event) => {
                    event.preventDefault();
                    closeFilters();
                  }}
                  onClick={(event) => {
                    if (event.target === event.currentTarget) closeFilters();
                  }}
                  onClose={closeFilters}
                  ref={filterDialog}
                  style={{
                    top: "calc((100dvh + env(safe-area-inset-top) - env(safe-area-inset-bottom)) / 2)",
                    left: "calc((100vw + env(safe-area-inset-left) - env(safe-area-inset-right)) / 2)",
                    maxHeight: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 16px)",
                    width: "calc(100vw - max(1rem, env(safe-area-inset-left)) - max(1rem, env(safe-area-inset-right)))",
                  }}
                >
                  {filterForm}
                </dialog>
              )}
              {isFiltersOpen && !isCompactFilterViewport && filterForm}
            </details>
            <Select aria-label="Trier les annonces" className="!h-9 !min-h-0 !w-auto !min-w-0 px-[14px] text-sm font-medium" fieldClassName="!w-auto" label="Trier les annonces" labelClassName="sr-only" onChange={(event) => {
              const nextFilters = { ...displayFilters, sort: event.currentTarget.value as AnnonceSort };
              scheduleSearch(createSearchParams(nextFilters), nextFilters, 0);
            }} value={displayFilters.sort}>
              <option value="recent">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </Select>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-content px-4 pt-7 sm:px-6">
        <div aria-busy={isFiltering} className="relative">
        {visibleItems.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-8 text-center">
            <h2 className="text-lg font-semibold text-text">Aucune annonce trouvée</h2>
            <p className="mt-2 text-sm text-text-secondary">Modifiez vos filtres ou lancez une autre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {visibleItems.map((item) => (
              <AnnonceProductCard
                annonce={item}
                favoriteControl={<AnnonceFavoriteButton
                  annonceId={item.id}
                  annonceTitle={item.titre}
                  favoriteStateReady={favoriteIdsLoaded}
                  isFavorite={favoriteIds.has(item.id)}
                />}
                key={item.id}
              />
            ))}
          </div>
        )}
        <div className="flex justify-center pt-12">
          <AnnoncePagination currentPage={visiblePage} previousPageHref={visiblePreviousPageHref} nextPageHref={visibleNextPageHref} />
        </div>
        {isFiltering && <p className="pt-3 text-center text-xs text-text-secondary" role="status">Mise à jour des annonces…</p>}
        </div>
      </main>
    </>
  );
}
