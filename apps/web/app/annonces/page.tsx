import { Suspense } from "react";
import { AnnonceSearchScreen } from "@topdeal/feature-annonce/presentation";
import {
  resolveGetActiveAnnonceCategoriesUseCase,
  resolveSearchAnnoncesUseCase,
} from "../../di/container";
import type { SearchAnnonceInput } from "@topdeal/feature-annonce/core";
import { DEFAULT_ANNONCE_SORT, isAnnonceSort } from "@topdeal/feature-annonce/core";

type SearchParams = Record<string, string | string[] | undefined>;

type AnnoncePageProps = {
  searchParams: Promise<SearchParams>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;

function getSingleValue(params: SearchParams, key: string): string | null {
  return typeof params[key] === "string" ? params[key] : null;
}

function getPrice(value: string | null): string | null {
  return value !== null && PRICE_PATTERN.test(value) ? value : null;
}

function getCursorHistory(value: string | string[] | undefined): string[] {
  const values = Array.isArray(value) ? value : value ? value.split(",") : [];
  return values.length <= 50 && values.every((cursor) => UUID_PATTERN.test(cursor))
    ? values
    : [];
}

function createSearchParams(filters: SearchAnnonceInput): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categorieId) params.set("categorieId", filters.categorieId);
  if (filters.etat) params.set("etat", filters.etat);
  if (filters.prixMin) params.set("prixMin", filters.prixMin);
  if (filters.prixMax) params.set("prixMax", filters.prixMax);
  if (filters.quartier) params.set("quartier", filters.quartier);
  if (filters.trocAccepte !== null) params.set("trocAccepte", String(filters.trocAccepte));
  if (filters.sort !== DEFAULT_ANNONCE_SORT) params.set("sort", filters.sort);
  return params;
}

async function AnnoncesPageContent({ searchParams }: AnnoncePageProps) {
  const params = await searchParams;
  const query = (getSingleValue(params, "q") ?? "").trim().slice(0, 200);
  const rawMinPrice = getPrice(getSingleValue(params, "prixMin"));
  const rawMaxPrice = getPrice(getSingleValue(params, "prixMax"));
  const invalidPriceRange =
    rawMinPrice !== null && rawMaxPrice !== null && Number(rawMinPrice) > Number(rawMaxPrice);
  const etatValue = getSingleValue(params, "etat");
  const trocValue = getSingleValue(params, "trocAccepte");
  const categoryValue = getSingleValue(params, "categorieId");
  const categoryParentValue = getSingleValue(params, "categorieParentId");
  const subcategoryValue = getSingleValue(params, "sousCategorieId");
  const cursorValue = getSingleValue(params, "cursor");
  const sortValue = getSingleValue(params, "sort");
  const cursorHistory = getCursorHistory(params.cursorHistory);
  const quartierValue = getSingleValue(params, "quartier")?.trim() ?? "";

  const categories = await resolveGetActiveAnnonceCategoriesUseCase().execute();
  const selectedParentId = categoryParentValue && UUID_PATTERN.test(categoryParentValue)
    ? categoryParentValue
    : null;
  const selectedSubcategory = subcategoryValue && UUID_PATTERN.test(subcategoryValue)
    ? categories.find((category) => category.id === subcategoryValue && category.parentId === selectedParentId)
    : null;
  const selectedRoot = selectedParentId
    ? categories.find((category) => category.id === selectedParentId && category.parentId === null)
    : null;
  const filters: SearchAnnonceInput = {
    query,
    categorieId: selectedSubcategory?.id ?? selectedRoot?.id ?? (categoryValue && UUID_PATTERN.test(categoryValue) ? categoryValue : null),
    etat: etatValue === "NEUF" || etatValue === "OCCASION" ? etatValue : null,
    prixMin: invalidPriceRange ? null : rawMinPrice,
    prixMax: invalidPriceRange ? null : rawMaxPrice,
    quartier: quartierValue && quartierValue.length <= 150 ? quartierValue : null,
    trocAccepte: trocValue === "true" ? true : trocValue === "false" ? false : null,
    sort: isAnnonceSort(sortValue) ? sortValue : DEFAULT_ANNONCE_SORT,
    cursor: cursorValue && UUID_PATTERN.test(cursorValue) ? cursorValue : null,
  };

  const result = await resolveSearchAnnoncesUseCase().execute(filters);

  const currentPage = filters.cursor ? cursorHistory.length + 2 : 1;
  const nextParams = createSearchParams(filters);
  if (result.nextCursor) {
    nextParams.set("cursor", result.nextCursor);
    for (const historyCursor of [...cursorHistory, ...(filters.cursor ? [filters.cursor] : [])]) {
      nextParams.append("cursorHistory", historyCursor);
    }
  }
  const previousParams = createSearchParams(filters);
  const previousCursor = cursorHistory.at(-1);
  if (previousCursor) {
    previousParams.set("cursor", previousCursor);
    for (const historyCursor of cursorHistory.slice(0, -1)) {
      previousParams.append("cursorHistory", historyCursor);
    }
  }

  const screenKey = currentPage + ":" + JSON.stringify(filters) + ":" + result.items.map((item) => item.id).join(",");
  return (
    <AnnonceSearchScreen
      key={screenKey}
      categories={categories}
      filters={filters}
      items={result.items}
      currentPage={currentPage}
      previousPageHref={filters.cursor ? `/annonces${previousParams.size ? `?${previousParams.toString()}` : ""}` : null}
      nextPageHref={result.nextCursor ? `/annonces?${nextParams.toString()}` : null}
    />
  );
}

function AnnoncesPageFallback() {
  return (
    <main aria-busy="true" className="mx-auto min-h-[60vh] w-full max-w-content px-4 py-10 text-sm text-text-secondary sm:px-6">
      <p role="status">Chargement des annonces…</p>
    </main>
  );
}

export default function AnnoncesPage(props: AnnoncePageProps) {
  return (
    <Suspense fallback={<AnnoncesPageFallback />}>
      <AnnoncesPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}
