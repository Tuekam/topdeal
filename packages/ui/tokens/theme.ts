export const THEME_OPTIONS = [
  { value: "orange", label: "Orange" },
  { value: "blue", label: "Bleu" },
  { value: "yellow", label: "Jaune" },
  { value: "red", label: "Rouge" },
  { value: "green", label: "Vert" },
] as const;

export type ThemeName = (typeof THEME_OPTIONS)[number]["value"];

export const DEFAULT_THEME: ThemeName = "orange";
export const THEME_STORAGE_KEY = "topdeal-theme";

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === "string" && THEME_OPTIONS.some((option) => option.value === value);
}
