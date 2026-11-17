"use client";

import type { AnnonceCategory } from "../../core/models/AnnonceCategory";
import type { AnnonceSearchItem } from "../../core/models/AnnonceSearchItem";
import { Input, Select } from "@topdeal/ui";
import { AnnoncePagination } from "./AnnoncePagination";
import { AnnonceFavoriteButton } from "./AnnonceFavoriteButton";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ANNONCE_SEARCH_QUERY_EVENT, type AnnonceSearchQueryEvent } from "../types/AnnonceSearchQueryEvent";

type AnnonceSearchFilters = {
  query: string;
  categorieId: string | null;
  etat: "NEUF" | "OCCASION" | null;
  prixMin: string | null;
  prixMax: string | null;
  quartier: string | null;
  trocAccepte: boolean | null;
};

type AnnonceSearchScreenProps = {
  categories: AnnonceCategory[];
  filters: AnnonceSearchFilters;
  items: AnnonceSearchItem[];
  currentPage: number;
  previousPageHref: string | null;
  nextPageHref: string | null;
};

function formatPrice(value: string): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function getCategoryLabel(name: string): string {
  return name === "Électronique" ? "Appareils électroniques" : name;
}

function orderCategories(categories: AnnonceCategory[]): AnnonceCategory[] {
  const displayOrder = [
    "Appareils électroniques",
    "Vêtements et mode",
    "Accessoires",
    "Maison et mobilier",
    "Autres",
  ];

  return [...categories].sort((first, second) => {
    const firstIndex = displayOrder.indexOf(getCategoryLabel(first.name));
    const secondIndex = displayOrder.indexOf(getCategoryLabel(second.name));
    return (firstIndex < 0 ? displayOrder.length : firstIndex) -
      (secondIndex < 0 ? displayOrder.length : secondIndex);
  });
}

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
  const [visibleNextPageHref, setVisibleNextPageHref] = useState(nextPageHref);
  const [visiblePreviousPageHref, setVisiblePreviousPageHref] = useState(previousPageHref);
  const [visiblePage, setVisiblePage] = useState(currentPage);
  const [displayFilters, setDisplayFilters] = useState(filters);
  const [isFiltering, setIsFiltering] = useState(false);
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
    setVisibleItems(items);
    setVisibleNextPageHref(nextPageHref);
    setVisiblePreviousPageHref(previousPageHref);
    setVisiblePage(currentPage);
    setDisplayFilters(filters);
  }, [currentPage, filters, items, nextPageHref, previousPageHref]);
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
        if (!response.ok) return;
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
        // Les résultats affichés restent disponibles si la recherche échoue ou est remplacée.
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
  function updateFilters(event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
    const form = event.currentTarget.form;
    if (!form) return;
    const nextFilters = readFilters(form);
    scheduleSearch(createSearchParams(nextFilters), nextFilters);
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
  const rootCategories = orderCategories(categories.filter((category) => category.parentId === null));
  const activeCategory = categories.find((category) => category.id === displayFilters.categorieId);
  const selectedRootId = activeCategory?.parentId ?? activeCategory?.id ?? "";
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
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <Select onChange={updateFilters} value={selectedRootId} label="Catégorie" name="categorieParentId">
          <option value="">Toutes les catégories</option>
          {rootCategories.map((category) => <option key={category.id} value={category.id}>{getCategoryLabel(category.name)}</option>)}
        </Select>
        <Select onChange={updateFilters} value={activeCategory?.parentId ? activeCategory.id : ""} label="Sous-catégorie" name="sousCategorieId">
          <option value="">Toutes les sous-catégories</option>
          {categories.filter((category) => category.parentId === selectedRootId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </Select>
        <Select onChange={updateFilters} value={displayFilters.etat ?? ""} label="État" name="etat">
          <option value="">Tous les états</option>
          <option value="NEUF">Neuf</option>
          <option value="OCCASION">Occasion</option>
        </Select>
        <Select onChange={updateFilters} value={displayFilters.trocAccepte === null ? "" : String(displayFilters.trocAccepte)} label="Troc" name="trocAccepte">
          <option value="">Avec ou sans troc</option>
          <option value="true">Troc accepté</option>
          <option value="false">Troc non accepté</option>
        </Select>
        <Input onChange={updateFilters} value={displayFilters.quartier ?? ""} label="Quartier / secteur" maxLength={150} name="quartier" />
        <Input onChange={updateFilters} value={displayFilters.prixMin ?? ""} label="Prix minimum (FCFA)" min="0" max="9999999999.99" name="prixMin" step="0.01" type="number" />
        <Input onChange={updateFilters} value={displayFilters.prixMax ?? ""} label="Prix maximum (FCFA)" min="0" max="9999999999.99" name="prixMax" step="0.01" type="number" />
      </div>
      <div className="flex flex-col items-stretch gap-3 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
        <button className="order-3 cursor-pointer self-start border-0 bg-transparent p-0 text-sm font-medium text-text-secondary underline md:order-1" onClick={clearFilters} type="button">Effacer les filtres</button>
        <span aria-live="polite" className="order-2 text-xs text-text-secondary">Les résultats se mettent à jour automatiquement.</span>
        <button className="td-button td-button--primary order-1 min-h-11 w-full px-5 md:order-3 md:w-auto" type="submit">Valider les filtres</button>
      </div>
    </form>
  );
  return (
    <>
      <section className="mx-auto flex w-full max-w-content flex-wrap items-end justify-between gap-6 px-4 pt-10 sm:px-6">
        <div>
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-text">Bonjour</h1>
          <p className="mt-1.5 text-text-secondary">Les dernières annonces de Bafoussam.</p>
        </div>
        <div aria-label="Résumé du compte" className="flex rounded-xl border border-border bg-surface">
        </div>
      </section>

      <section className="mx-auto w-full max-w-content px-4 pt-8 sm:px-6" aria-label="Parcourir les annonces">
        <div className="relative flex flex-wrap items-end justify-between gap-4 border-b border-border">
          <nav aria-label="Catégories" className="flex max-w-full gap-8 overflow-x-auto">
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
              >{getCategoryLabel(category.name)}</button>
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
                  className="fixed top-1/2 left-1/2 z-50 m-0 max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[680px] -translate-x-1/2 -translate-y-1/2 overflow-hidden border-0 bg-transparent p-0 shadow-none backdrop:bg-black/40"
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
            <span aria-label="Tri : plus récentes" className="flex h-9 items-center gap-2 rounded-[10px] border border-input-border bg-surface px-[14px] text-sm font-medium text-text">
              Plus récentes
              <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {visibleItems.map((item) => (
              <article className="relative overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-input-border" key={item.id}>
                <div className="relative flex aspect-[4/3] items-center justify-center bg-image-tile">
                  {item.photoUrl ? (
                    <img alt={`${item.titre}, photo du produit`} className="h-full w-full object-cover" height="240" loading="lazy" src={item.photoUrl} width="320" />
                  ) : (
                    <svg aria-hidden="true" className="text-[#A39A91]" fill="none" height="60" viewBox="0 0 64 64" width="60" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                      <rect height="40" rx="3" width="48" x="8" y="12" />
                      <circle cx="22" cy="25" r="4" />
                      <path d="m12 48 15-15 9 9 7-7 9 13" />
                    </svg>
                  )}
                  {item.trocAccepte && <span className="pointer-events-none absolute left-3 top-3 z-[1] rounded-[6px] border border-border bg-surface px-[9px] py-[3px] text-xs font-medium text-text">Troc accepté</span>}
                  <AnnonceFavoriteButton annonceTitle={item.titre} />
                </div>
                <div className="p-3 sm:p-4">
                  <div className="tabular-nums text-lg font-semibold tracking-tight text-text">{formatPrice(item.prix)}</div>
                  <a className="mt-0.5 block truncate text-[15px] text-text after:absolute after:inset-0" href={`/annonces/${item.id}`} title={item.titre}>{item.titre}</a>
                  <div className="mt-2.5 flex items-center gap-3.5 text-[13px] text-text-secondary">
                    <span>{item.etat === "NEUF" ? "Neuf" : "Occasion"}</span>
                    <span className="flex min-w-0 items-center gap-1 truncate">
                      <svg aria-hidden="true" className="shrink-0" fill="none" height="13" viewBox="0 0 24 24" width="13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
                        <path d="M12 21s6-5.6 6-10a6 6 0 0 0-12 0c0 4.4 6 10 6 10Z" />
                        <circle cx="12" cy="11" r="2" />
                      </svg>
                      {item.quartier ?? "Bafoussam"}
                    </span>
                  </div>
                </div>
              </article>
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
