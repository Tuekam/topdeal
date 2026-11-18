import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { resolveGetActiveAnnonceCategoriesUseCase, resolveGetFavoriteAnnoncesUseCase } from "../../../di/container";
import { verifyCurrentWebSession } from "../../../security/verifiedSession";
import { FavoriteAnnoncesPageClient } from "./FavoriteAnnoncesPageClient";
import type { FavoriteAnnonceFilters } from "@topdeal/feature-annonce/core";
import { DEFAULT_ANNONCE_SORT, isAnnonceSort } from "@topdeal/feature-annonce/core";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;

export default function FavoriteAnnoncesPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<main aria-busy="true" className="mx-auto min-h-[60vh] w-full max-w-content px-4 py-8 text-sm text-text-secondary sm:px-6 sm:py-10">Chargement de vos favoris…</main>}>
      <FavoriteAnnoncesContent searchParams={searchParams} />
    </Suspense>
  );
}

async function FavoriteAnnoncesContent({ searchParams }: PageProps) {
  await connection();
  const session = await verifyCurrentWebSession();
  if (session.status === "unavailable") redirect("/connexion?sessionError=unavailable");
  if (session.status !== "authenticated") redirect("/connexion");
  const { userId } = session;

  const params = await searchParams;
  const cursor = typeof params.cursor === "string" && UUID_PATTERN.test(params.cursor) ? params.cursor : null;
  const sort = typeof params.sort === "string" && isAnnonceSort(params.sort) ? params.sort : DEFAULT_ANNONCE_SORT;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 200) : "";
  const etatValue = typeof params.etat === "string" ? params.etat : null;
  const trocValue = typeof params.trocAccepte === "string" ? params.trocAccepte : null;
  const rawMin = typeof params.prixMin === "string" && PRICE_PATTERN.test(params.prixMin) ? params.prixMin : null;
  const rawMax = typeof params.prixMax === "string" && PRICE_PATTERN.test(params.prixMax) ? params.prixMax : null;
  const minPrice = rawMin !== null && rawMax !== null && Number(rawMin) > Number(rawMax) ? null : rawMin;
  const maxPrice = rawMin !== null && rawMax !== null && Number(rawMin) > Number(rawMax) ? null : rawMax;
  const categorieId = typeof params.categorieId === "string" && UUID_PATTERN.test(params.categorieId) ? params.categorieId : null;
  const quartier = typeof params.quartier === "string" && params.quartier.trim().length <= 150 ? params.quartier.trim() || null : null;
  const filters: FavoriteAnnonceFilters = {
    query,
    categorieId,
    etat: etatValue === "NEUF" || etatValue === "OCCASION" ? etatValue : null,
    prixMin: minPrice,
    prixMax: maxPrice,
    quartier,
    trocAccepte: trocValue === "true" ? true : trocValue === "false" ? false : null,
    sort,
  };
  const cursorHistoryValues = Array.isArray(params.cursorHistory)
    ? params.cursorHistory
    : typeof params.cursorHistory === "string"
      ? params.cursorHistory.split(",")
      : [];
  const cursorHistory = cursorHistoryValues.length <= 50 && cursorHistoryValues.every((value) => UUID_PATTERN.test(value))
    ? cursorHistoryValues
    : [];
  const [result, categories] = await Promise.all([
    resolveGetFavoriteAnnoncesUseCase().execute(userId, filters, cursor),
    resolveGetActiveAnnonceCategoriesUseCase().execute(),
  ]);
  const currentPage = cursor ? cursorHistory.length + 2 : 1;
  const nextParams = new URLSearchParams();
  for (const [key, value] of Object.entries({ q: query, categorieId, etat: filters.etat, prixMin: minPrice, prixMax: maxPrice, quartier })) if (value) nextParams.set(key, value);
  if (filters.sort !== DEFAULT_ANNONCE_SORT) nextParams.set("sort", filters.sort);
  if (filters.trocAccepte !== null) nextParams.set("trocAccepte", String(filters.trocAccepte));
  if (result.nextCursor) {
    nextParams.set("cursor", result.nextCursor);
    for (const previousCursor of [...cursorHistory, ...(cursor ? [cursor] : [])]) nextParams.append("cursorHistory", previousCursor);
  }
  const previousParams = new URLSearchParams();
  for (const [key, value] of Object.entries({ q: query, categorieId, etat: filters.etat, prixMin: minPrice, prixMax: maxPrice, quartier })) if (value) previousParams.set(key, value);
  if (filters.sort !== DEFAULT_ANNONCE_SORT) previousParams.set("sort", filters.sort);
  if (filters.trocAccepte !== null) previousParams.set("trocAccepte", String(filters.trocAccepte));
  const previousCursor = cursorHistory.at(-1);
  if (previousCursor) {
    previousParams.set("cursor", previousCursor);
    for (const historyCursor of cursorHistory.slice(0, -1)) previousParams.append("cursorHistory", historyCursor);
  }

  return (
    <FavoriteAnnoncesPageClient
      items={result.items}
      query={query}
      filters={filters}
      categories={categories}
      currentPage={currentPage}
      previousPageHref={cursor ? `/annonces/favoris${previousParams.size ? `?${previousParams.toString()}` : ""}` : null}
      nextPageHref={result.nextCursor ? `/annonces/favoris?${nextParams.toString()}` : null}
    />
  );
}
