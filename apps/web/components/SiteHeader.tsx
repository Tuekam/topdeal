import Link from "next/link";
import { Suspense } from "react";
import { SiteSearchForm } from "./SiteSearchForm";

const disabledNavigationClassName = "hidden items-center text-[15px] font-medium text-text-secondary lg:inline-flex";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex min-h-[76px] max-w-content flex-wrap items-center gap-4 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-7 lg:py-0">
        <Link aria-label="TopDeal, accueil" className="shrink-0 text-2xl font-bold tracking-tight text-text" href="/annonces">TopDeal</Link>
        <Suspense fallback={<div aria-hidden="true" className="order-3 h-11 w-full rounded-search border border-input-border bg-surface lg:order-none lg:h-[46px] lg:max-w-[560px] lg:flex-1" />}>
          <SiteSearchForm />
        </Suspense>
        <nav aria-label="Navigation principale" className="ml-auto flex items-center gap-3 text-[15px] sm:gap-5 lg:gap-[26px]">
          <Link className="hidden font-medium text-text-secondary hover:text-text lg:inline" href="/annonces?trocAccepte=true">Troc</Link>
          <span aria-disabled="true" className={disabledNavigationClassName} title="Les favoris seront disponibles prochainement">Favoris</span>
          <span aria-disabled="true" className="hidden items-center gap-2 font-medium text-text-secondary lg:inline-flex" title="La messagerie sera disponible prochainement">
            <span>Messages</span><span className="min-w-[18px] rounded-full bg-text px-[5px] text-center text-[11px] font-semibold leading-[18px] text-surface">3</span>
          </span>
          <span aria-disabled="true" aria-label="Notifications indisponibles" className="hidden text-text-secondary lg:inline-flex" title="Les notifications seront disponibles prochainement">
            <svg aria-hidden="true" fill="none" height="21" viewBox="0 0 24 24" width="21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
              <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 21a2 2 0 0 0 4 0" />
            </svg>
          </span>
          <Link aria-current="page" className="hidden font-medium text-text lg:inline" href="/annonces/mes-annonces">Mon espace</Link>
          <Link className="td-button td-button--primary h-11 min-h-11 rounded-[10px] px-6" href="/annonces/nouvelle">Vendre</Link>
        </nav>
      </div>
    </header>
  );
}
