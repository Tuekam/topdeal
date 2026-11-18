"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Select } from "@topdeal/ui";
import type { AnnonceCategory } from "../../core/models/AnnonceCategory";
import type { AnnonceSort } from "../../core/models/AnnonceSort";
import { AnnonceFilterFields, type AnnonceFilterValues, sortAnnonceRootCategories } from "./AnnonceFilterFields";

export type AnnonceBrowseFilters = AnnonceFilterValues & {
  query: string;
  sort: AnnonceSort;
};

type Props = {
  categories: AnnonceCategory[];
  filters: AnnonceBrowseFilters;
  onChange(filters: AnnonceBrowseFilters): void;
  includeVisibility?: boolean;
};
function hasFilters(filters: AnnonceBrowseFilters) {
  return Boolean(filters.categorieId || filters.etat || filters.prixMin || filters.prixMax || filters.quartier || filters.trocAccepte !== null || filters.visibilite);
}

export function AnnonceBrowseControls({ categories, filters, onChange, includeVisibility = false }: Props) {
  const details = useRef<HTMLDetailsElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [compact, setCompact] = useState(true);
  const roots = sortAnnonceRootCategories(categories.filter((item) => item.parentId === null));
  const active = categories.find((category) => category.id === filters.categorieId);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (compact && isOpen && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [compact, isOpen]);

  useEffect(() => {
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !details.current?.contains(event.target) && !dialog.current?.contains(event.target)) close();
    };
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  function close() {
    if (details.current) details.current.open = false;
    setIsOpen(false);
  }

  function setCategory(id: string | null) {
    onChange({ ...filters, categorieId: id });
  }

  function clear() {
    onChange({ ...filters, categorieId: null, etat: null, prixMin: null, prixMax: null, quartier: null, trocAccepte: null, ...(includeVisibility ? { visibilite: null } : {}) });
  }

  const form = (
    <form aria-label="Filtres des annonces" className={compact
      ? "grid max-h-[calc(100dvh-1rem)] w-full max-w-[680px] gap-4 overflow-y-auto overscroll-contain rounded-card border border-border bg-surface p-4 shadow-xl sm:p-5"
      : "absolute right-0 top-[calc(100%+8px)] z-20 grid max-h-[calc(100dvh-48px)] w-[min(680px,calc(100vw-32px))] gap-4 overflow-y-auto overscroll-contain rounded-card border border-border bg-surface p-5 shadow-xl"}
      onSubmit={(event) => { event.preventDefault(); close(); }}
      style={compact ? { maxHeight: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 16px)" } : undefined}>
      <div className="flex items-center justify-between lg:hidden"><h2 className="text-lg font-semibold text-text">Filtres</h2><button aria-label="Fermer les filtres" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-border bg-surface text-xl text-text" onClick={close} type="button">×</button></div>
      <AnnonceFilterFields
        categories={categories}
        filters={filters}
        includeVisibility={includeVisibility}
        onChange={(change) => onChange({ ...filters, ...change })}
      />
      <div className="flex flex-col items-stretch gap-3 border-t border-border pt-4 md:flex-row md:items-center md:justify-between"><button className="cursor-pointer self-start border-0 bg-transparent p-0 text-sm font-medium text-text-secondary underline" onClick={clear} type="button">Effacer les filtres</button><span aria-live="polite" className="text-xs text-text-secondary">Les résultats se mettent à jour automatiquement.</span><Button className="w-full px-5 md:w-auto" type="submit">Valider les filtres</Button></div>
    </form>
  );

  return <section aria-label="Parcourir les annonces" className="mx-auto w-full max-w-content px-4 pt-8 sm:px-6"><div className="relative flex flex-wrap items-end justify-between gap-3 sm:gap-4 border-b border-border">
    <nav aria-label="Catégories" className="flex min-w-0 max-w-full gap-5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8">{[["", "Tout"] as const, ...roots.map((c) => [c.id, c.name === "Électronique" ? "Appareils électroniques" : c.name] as const)].map(([id, label]) => <button aria-pressed={(filters.categorieId ?? "") === id || (id !== "" && active?.parentId === id)} className={`mb-[-1px] shrink-0 cursor-pointer border-b-2 bg-transparent px-0 pb-[14px] text-left text-sm font-medium sm:text-base ${((filters.categorieId ?? "") === id || (id !== "" && active?.parentId === id)) ? "border-text font-semibold text-text" : "border-transparent text-text-secondary hover:text-text"}`} key={id || "all"} onClick={() => setCategory(id || null)} type="button">{label}</button>)}</nav>
    <div className="mb-2 flex shrink-0 gap-2"><details className="group relative" onToggle={(event) => setIsOpen(event.currentTarget.open)} ref={details}><summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-[10px] border border-input-border bg-surface px-3 text-xs font-medium text-text sm:h-9 sm:px-[14px] sm:text-sm [&::-webkit-details-marker]:hidden"><svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>Filtres{hasFilters(filters) && <span aria-label="Filtres actifs" className="h-1.5 w-1.5 rounded-full bg-accent" />}</summary>{isOpen && compact && <dialog aria-label="Filtres des annonces" className="fixed left-1/2 top-1/2 z-50 m-0 max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[680px] -translate-x-1/2 -translate-y-1/2 overflow-hidden border-0 bg-transparent p-0 shadow-none backdrop:bg-overlay" onCancel={(e) => { e.preventDefault(); close(); }} onClick={(e) => { if (e.target === e.currentTarget) close(); }} onClose={close} ref={dialog} style={{ top: "calc((100dvh + env(safe-area-inset-top) - env(safe-area-inset-bottom)) / 2)", left: "calc((100vw + env(safe-area-inset-left) - env(safe-area-inset-right)) / 2)", maxHeight: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 16px)", width: "calc(100vw - max(1rem, env(safe-area-inset-left)) - max(1rem, env(safe-area-inset-right)))" }}>{form}</dialog>}{isOpen && !compact && form}</details><Select aria-label="Trier les annonces" className="!h-10 !min-h-0 !w-auto !min-w-0 px-2.5 text-xs font-medium sm:!h-9 sm:px-[14px] sm:text-sm" fieldClassName="!w-auto" label="Trier les annonces" labelClassName="sr-only" onChange={(event) => onChange({ ...filters, sort: event.currentTarget.value as AnnonceSort })} value={filters.sort}><option value="recent">Plus récentes</option><option value="oldest">Plus anciennes</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option></Select></div>
  </div></section>;
}
