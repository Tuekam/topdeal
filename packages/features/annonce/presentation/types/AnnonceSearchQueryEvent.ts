export const ANNONCE_SEARCH_QUERY_EVENT = "topdeal:annonce-search-query";

export type AnnonceSearchQueryEvent = CustomEvent<{
  query: string;
}>;
