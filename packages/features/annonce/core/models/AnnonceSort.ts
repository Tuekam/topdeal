export const ANNONCE_SORT_VALUES = ["recent", "oldest", "price-asc", "price-desc"] as const;

export type AnnonceSort = (typeof ANNONCE_SORT_VALUES)[number];

export const DEFAULT_ANNONCE_SORT: AnnonceSort = "recent";

export function isAnnonceSort(value: unknown): value is AnnonceSort {
  return typeof value === "string" && ANNONCE_SORT_VALUES.some((sort) => sort === value);
}
