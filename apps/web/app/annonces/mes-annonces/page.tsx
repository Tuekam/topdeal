import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import type { OwnedAnnonceFilters } from "@topdeal/feature-annonce/core";
import { resolveGetActiveAnnonceCategoriesUseCase, resolveGetOwnedAnnoncesUseCase } from "../../../di/container";
import { verifyCurrentWebSession } from "../../../security/verifiedSession";
import { OwnedAnnoncesPageClient } from "./OwnedAnnoncesPageClient";
import { DEFAULT_ANNONCE_SORT, isAnnonceSort } from "@topdeal/feature-annonce/core";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;
const VISIBILITIES = ["PUBLIEE", "MASQUEE", "SUSPENDUE"] as const;

function getFilters(params: Record<string, string | string[] | undefined>): OwnedAnnonceFilters {
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const etat = value("etat");
  const troc = value("trocAccepte");
  const sort = value("sort");
  const visibilite = value("visibilite");
  const prixMin = value("prixMin");
  const prixMax = value("prixMax");
  const categorieId = value("categorieId");
  const quartier = value("quartier").trim();
  return {
    query: value("q").trim().slice(0, 200),
    categorieId: UUID_PATTERN.test(categorieId) ? categorieId : null,
    etat: etat === "NEUF" || etat === "OCCASION" ? etat : null,
    prixMin: PRICE_PATTERN.test(prixMin) ? prixMin : null,
    prixMax: PRICE_PATTERN.test(prixMax) ? prixMax : null,
    quartier: quartier.length <= 150 ? quartier || null : null,
    trocAccepte: troc === "true" ? true : troc === "false" ? false : null,
    sort: isAnnonceSort(sort) ? sort : DEFAULT_ANNONCE_SORT,
    visibilite: VISIBILITIES.includes(visibilite as typeof VISIBILITIES[number])
      ? visibilite as typeof VISIBILITIES[number]
      : null,
  };
}

function addFilters(params: URLSearchParams, filters: OwnedAnnonceFilters): void {
  if (filters.query) params.set("q", filters.query);
  if (filters.categorieId) params.set("categorieId", filters.categorieId);
  if (filters.etat) params.set("etat", filters.etat);
  if (filters.prixMin) params.set("prixMin", filters.prixMin);
  if (filters.prixMax) params.set("prixMax", filters.prixMax);
  if (filters.quartier) params.set("quartier", filters.quartier);
  if (filters.trocAccepte !== null) params.set("trocAccepte", String(filters.trocAccepte));
  if (filters.sort !== DEFAULT_ANNONCE_SORT) params.set("sort", filters.sort);
  if (filters.visibilite) params.set("visibilite", filters.visibilite);
}

function getCursorHistory(value: string | string[] | undefined): string[] {
  const cursors = Array.isArray(value) ? value : value ? value.split(",") : [];
  return cursors.length <= 50 && cursors.every((value) => UUID_PATTERN.test(value)) ? cursors : [];
}

export default function MyAnnoncesPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<main aria-busy="true" className="mx-auto min-h-[60vh] w-full max-w-content px-4 py-8 text-sm text-text-secondary sm:px-6 sm:py-10">Chargement de vos annonces…</main>}>
      <MyAnnoncesContent searchParams={searchParams} />
    </Suspense>
  );
}

async function MyAnnoncesContent({ searchParams }: PageProps) {
  await connection();
  const session = await verifyCurrentWebSession();
  if (session.status === "unavailable") redirect("/connexion?sessionError=unavailable");
  if (session.status !== "authenticated") redirect("/connexion");
  const { userId } = session;

  const params = await searchParams;
  const filters = getFilters(params);
  const cursor = typeof params.cursor === "string" && UUID_PATTERN.test(params.cursor)
    ? params.cursor
    : null;
  const cursorHistory = getCursorHistory(params.cursorHistory);
  const [result, categories] = await Promise.all([
    resolveGetOwnedAnnoncesUseCase().execute(userId, filters, cursor),
    resolveGetActiveAnnonceCategoriesUseCase().execute(),
  ]);
  const currentPage = cursor ? cursorHistory.length + 2 : 1;
  const nextParams = new URLSearchParams();
  addFilters(nextParams, filters);
  if (result.nextCursor) {
    nextParams.set("cursor", result.nextCursor);
    for (const historyCursor of [...cursorHistory, ...(cursor ? [cursor] : [])]) {
      nextParams.append("cursorHistory", historyCursor);
    }
  }
  const previousParams = new URLSearchParams();
  addFilters(previousParams, filters);
  const previousCursor = cursorHistory.at(-1);
  if (previousCursor) {
    previousParams.set("cursor", previousCursor);
    for (const historyCursor of cursorHistory.slice(0, -1)) {
      previousParams.append("cursorHistory", historyCursor);
    }
  }

  return (
    <OwnedAnnoncesPageClient
      items={result.items}
      categories={categories}
      filters={filters}
      currentPage={currentPage}
      previousPageHref={cursor ? `/annonces/mes-annonces${previousParams.size ? `?${previousParams.toString()}` : ""}` : null}
      nextPageHref={result.nextCursor ? `/annonces/mes-annonces?${nextParams.toString()}` : null}
    />
  );
}
