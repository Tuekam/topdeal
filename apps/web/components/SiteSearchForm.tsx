"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ANNONCE_SEARCH_QUERY_EVENT } from "@topdeal/feature-annonce/presentation/search-query-event";

export function SiteSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [value, setValue] = useState(query);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      setValue(query);
    }
  }, [pathname, query]);

  useEffect(() => {
    function syncSearchFromHistory() {
      setValue(new URLSearchParams(window.location.search).get("q") ?? "");
    }

    window.addEventListener("popstate", syncSearchFromHistory);
    return () => window.removeEventListener("popstate", syncSearchFromHistory);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = pathname === "/annonces"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
      const trimmedValue = value.trim();
      if (trimmedValue === query) return;
      if (pathname === "/annonces") {
        window.dispatchEvent(new CustomEvent(ANNONCE_SEARCH_QUERY_EVENT, { detail: { query: trimmedValue } }));
        return;
      }
      if (trimmedValue) params.set("q", trimmedValue);
      else params.delete("q");
      params.delete("cursor");
      params.delete("cursorHistory");
      const nextUrl = `/annonces${params.size ? `?${params.toString()}` : ""}`;
      router.replace(nextUrl, { scroll: false });
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [pathname, query, router, value]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = pathname === "/annonces"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
    const trimmedValue = value.trim();
    if (pathname === "/annonces") {
      window.dispatchEvent(new CustomEvent(ANNONCE_SEARCH_QUERY_EVENT, { detail: { query: trimmedValue } }));
      return;
    }
    if (trimmedValue) params.set("q", trimmedValue);
    else params.delete("q");
    params.delete("cursor");
    params.delete("cursorHistory");
    router.replace(`/annonces${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  return (
    <form action="/annonces" className="order-3 flex h-11 w-full items-center gap-3 rounded-search border border-input-border bg-surface px-3 text-text-secondary lg:order-none lg:h-[46px] lg:max-w-[560px] lg:flex-1" onSubmit={submit} role="search">
      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
        <path d="M12 21s6-5.6 6-10a6 6 0 0 0-12 0c0 4.4 6 10 6 10Z" />
        <circle cx="12" cy="11" r="2" />
      </svg>
      <span className="shrink-0 text-sm font-medium text-text-secondary">Bafoussam</span>
      <span aria-hidden="true" className="h-5 border-l border-border" />
      <input aria-label="Rechercher un produit" className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-text outline-none placeholder:text-text-secondary" maxLength={200} onChange={(event) => setValue(event.target.value)} placeholder="Rechercher un produit" type="search" value={value} />
      <button aria-label="Rechercher" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-text hover:bg-surface-muted" type="submit">
        <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </svg>
      </button>
    </form>
  );
}
