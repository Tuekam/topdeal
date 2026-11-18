"use client";

import { useEffect, useRef, useState } from "react";
import type { AnnonceCategory } from "../../core/models/AnnonceCategory";
import type { AnnonceOwnerItem } from "../../core/models/AnnonceOwnerItem";
import type { OwnedAnnonceEditDetails } from "../../core/models/OwnedAnnonceEditDetails";
import type { OwnedAnnonceFilters } from "../../core/repositories/GetOwnedAnnoncesRepository";
import { ANNONCE_SEARCH_QUERY_EVENT, type AnnonceSearchQueryEvent } from "../types/AnnonceSearchQueryEvent";
import { AnnoncePagination } from "./AnnoncePagination";
import { AnnonceBrowseControls, type AnnonceBrowseFilters } from "./AnnonceBrowseControls";
import { OwnedAnnonceCard } from "./OwnedAnnonceCard";
import { EditOwnedAnnonceDialog } from "./EditOwnedAnnonceDialog";
import { useToast } from "@topdeal/ui";

type OwnedAnnoncesScreenProps = {
  items: AnnonceOwnerItem[];
  categories: AnnonceCategory[];
  filters: OwnedAnnonceFilters;
  currentPage: number;
  previousPageHref: string | null;
  nextPageHref: string | null;
};

function createParams(filters: OwnedAnnonceFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categorieId) params.set("categorieId", filters.categorieId);
  if (filters.etat) params.set("etat", filters.etat);
  if (filters.prixMin) params.set("prixMin", filters.prixMin);
  if (filters.prixMax) params.set("prixMax", filters.prixMax);
  if (filters.quartier) params.set("quartier", filters.quartier);
  if (filters.trocAccepte !== null) params.set("trocAccepte", String(filters.trocAccepte));
  if (filters.sort !== "recent") params.set("sort", filters.sort);
  if (filters.visibilite) params.set("visibilite", filters.visibilite);
  return params;
}

export function OwnedAnnoncesScreen({
  items,
  categories,
  filters,
  currentPage,
  previousPageHref,
  nextPageHref,
}: OwnedAnnoncesScreenProps) {
  const timer = useRef<number | null>(null);
  const request = useRef<AbortController | null>(null);
  const [visibleItems, setVisibleItems] = useState(items);
  const [displayFilters, setDisplayFilters] = useState(filters);
  const [visiblePage, setVisiblePage] = useState(currentPage);
  const [visiblePreviousPageHref, setVisiblePreviousPageHref] = useState(previousPageHref);
  const [visibleNextPageHref, setVisibleNextPageHref] = useState(nextPageHref);
  const [isFiltering, setIsFiltering] = useState(false);
  const [editingAnnonceId, setEditingAnnonceId] = useState<string | null>(null);
  const [editingDetails, setEditingDetails] = useState<OwnedAnnonceEditDetails | null>(null);
  const editDetailsCache = useRef(new Map<string, OwnedAnnonceEditDetails>());
  const editDetailsRequests = useRef(new Map<string, Promise<OwnedAnnonceEditDetails | null>>());
  const activeEditId = useRef<string | null>(null);
  const showToast = useToast();

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    request.current?.abort();
  }, []);

  function loadEditDetails(annonceId: string): Promise<OwnedAnnonceEditDetails | null> {
    const cached = editDetailsCache.current.get(annonceId);
    if (cached) return Promise.resolve(cached);

    const pending = editDetailsRequests.current.get(annonceId);
    if (pending) return pending;

    const request = fetch(`/api/annonces/${annonceId}/modification`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const details = await response.json() as OwnedAnnonceEditDetails;
        editDetailsCache.current.set(annonceId, details);
        return details;
      })
      .catch(() => null)
      .finally(() => editDetailsRequests.current.delete(annonceId));
    editDetailsRequests.current.set(annonceId, request);
    return request;
  }

  function prefetchEditDetails(annonceId: string) {
    void loadEditDetails(annonceId);
  }

  async function openEdit(annonceId: string) {
    activeEditId.current = annonceId;
    setEditingAnnonceId(annonceId);
    const details = await loadEditDetails(annonceId);
    if (activeEditId.current !== annonceId) return;
    if (!details) {
      showToast({ kind: "error", title: "Annonce non chargée", description: "Impossible de charger les informations pour la modifier. Réessayez." });
      activeEditId.current = null;
      setEditingAnnonceId(null);
      return;
    }
    setEditingDetails(details);
  }

  function closeEdit() {
    activeEditId.current = null;
    setEditingAnnonceId(null);
    setEditingDetails(null);
  }

  async function search(nextFilters: OwnedAnnonceFilters, delay = 100) {
    if (timer.current !== null) window.clearTimeout(timer.current);
    request.current?.abort();
    setDisplayFilters(nextFilters);
    timer.current = window.setTimeout(async () => {
      const controller = new AbortController();
      request.current = controller;
      setIsFiltering(true);
      const params = createParams(nextFilters);
      try {
        const response = await fetch("/api/annonces/mes-annonces?" + params.toString(), {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          if (!controller.signal.aborted) showToast({ kind: "error", title: "Annonces non chargées", description: "Impossible de mettre à jour la liste. Réessayez." });
          return;
        }
        const result: { items: AnnonceOwnerItem[]; nextCursor: string | null } = await response.json();
        setVisibleItems(result.items);
        setVisiblePage(1);
        setVisiblePreviousPageHref(null);
        const nextParams = new URLSearchParams(params);
        if (result.nextCursor) {
          nextParams.set("cursor", result.nextCursor);
          setVisibleNextPageHref("/annonces/mes-annonces?" + nextParams.toString());
        } else setVisibleNextPageHref(null);
        window.history.replaceState(null, "", "/annonces/mes-annonces" + (params.size ? "?" + params.toString() : ""));
      } catch {
        if (!controller.signal.aborted) showToast({ kind: "error", title: "Annonces non chargées", description: "Vérifiez votre connexion puis réessayez." });
      } finally {
        if (request.current === controller) {
          request.current = null;
          setIsFiltering(false);
        }
      }
    }, delay);
  }

  function handleChanged() {
    void search(displayFilters, 0);
  }

  useEffect(() => {
    function handleHeaderSearch(event: Event) {
      const query = (event as AnnonceSearchQueryEvent).detail.query;
      void search({ ...displayFilters, query });
    }
    window.addEventListener(ANNONCE_SEARCH_QUERY_EVENT, handleHeaderSearch);
    return () => window.removeEventListener(ANNONCE_SEARCH_QUERY_EVENT, handleHeaderSearch);
  }, [displayFilters]);

  function updateBrowseFilters(next: AnnonceBrowseFilters) {
    void search(next as OwnedAnnonceFilters);
  }

  return (
    <main className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-text-secondary">Espace vendeur</p>
          <h1 className="text-2xl font-semibold text-text sm:text-3xl">Mes annonces</h1>
        </div>
        <a className="td-button td-button--primary w-full justify-center sm:w-auto" href="/annonces/nouvelle">Publier une annonce</a>
      </header>

      <AnnonceBrowseControls categories={categories} filters={displayFilters} includeVisibility onChange={updateBrowseFilters} />

      <div aria-busy={isFiltering}>
        {visibleItems.length === 0 ? (
          <p className="mt-7 rounded-card border border-border bg-surface p-8 text-center text-text-secondary">
            {displayFilters.query || displayFilters.categorieId || displayFilters.etat || displayFilters.visibilite || displayFilters.prixMin || displayFilters.prixMax || displayFilters.quartier || displayFilters.trocAccepte !== null
              ? "Aucune annonce ne correspond à ces critères."
              : "Vous n’avez pas encore publié d’annonce."}
          </p>
        ) : (
          <section aria-label="Mes annonces" className="mt-7 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {visibleItems.map((annonce) => (
              <OwnedAnnonceCard annonce={annonce} key={annonce.id} onEdit={(id) => void openEdit(id)} onPrefetchEdit={prefetchEditDetails} onChanged={handleChanged} />
            ))}
          </section>
        )}
        <div className="flex justify-center pt-8">
          <AnnoncePagination currentPage={visiblePage} label="Pagination de mes annonces" nextPageHref={visibleNextPageHref} previousPageHref={visiblePreviousPageHref} />
        </div>
        {isFiltering && <p className="pt-3 text-center text-xs text-text-secondary" role="status">Mise à jour des annonces…</p>}
      </div>
      {editingAnnonceId && editingDetails && (
        <EditOwnedAnnonceDialog
          annonceId={editingAnnonceId}
          initialDetails={editingDetails}
          categories={categories}
          key={editingAnnonceId}
          onClose={closeEdit}
          onSaved={() => {
            editDetailsCache.current.delete(editingAnnonceId);
            handleChanged();
          }}
          open
        />
      )}
    </main>
  );
}
