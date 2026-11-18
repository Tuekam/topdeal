"use client";

import { useEffect, useState } from "react";
import { useToast } from "@topdeal/ui";

type AnnonceFavoriteButtonProps = {
  annonceId: string;
  annonceTitle: string;
  isFavorite?: boolean;
  favoriteStateReady?: boolean;
  presentation?: "icon" | "button";
  onFavoriteChange?(isFavorite: boolean): void;
};

export function AnnonceFavoriteButton({
  annonceId,
  annonceTitle,
  isFavorite: initialFavorite,
  favoriteStateReady = true,
  presentation = "icon",
  onFavoriteChange,
}: AnnonceFavoriteButtonProps) {
  const [localFavorite, setLocalFavorite] = useState(initialFavorite ?? false);
  const [hasLocalChange, setHasLocalChange] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const showToast = useToast();
  const isFavorite = initialFavorite !== undefined && !hasLocalChange ? initialFavorite : localFavorite;
  const favoriteReady = initialFavorite !== undefined ? favoriteStateReady : isReady;

  useEffect(() => {
    if (initialFavorite !== undefined) return;

    const controller = new AbortController();
    void fetch(`/api/annonces/favoris?ids=${annonceId}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setIsReady(true);
          return;
        }
        const result: { favoriteIds: string[] } = await response.json();
        setLocalFavorite(result.favoriteIds.includes(annonceId));
        setIsReady(true);
      })
      .catch(() => { if (!controller.signal.aborted) setIsReady(true); });
    return () => controller.abort();
  }, [annonceId, initialFavorite]);

  async function toggleFavorite() {
    if (isSaving || !favoriteReady) return;
    const nextFavorite = !isFavorite;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/annonces/${annonceId}/favori`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-topdeal-request": "1" },
        body: JSON.stringify({ isFavorite: nextFavorite }),
      });
      if (response.status === 401) {
        showToast({ kind: "error", title: "Connexion requise", description: "Connectez-vous pour enregistrer des annonces." });
        return;
      }
      if (!response.ok) throw new Error("favorite_request_failed");
      const result: { isFavorite: boolean } = await response.json();
      setLocalFavorite(result.isFavorite);
      setHasLocalChange(true);
      onFavoriteChange?.(result.isFavorite);
      showToast({ kind: "success", title: result.isFavorite ? "Annonce ajoutée aux favoris" : "Annonce retirée des favoris" });
    } catch {
      showToast({ kind: "error", title: "Favori non modifié", description: "Impossible de mettre à jour ce favori. Réessayez." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <span className={presentation === "icon" ? "contents" : "inline-flex flex-col items-start gap-2"}>
      <button
        aria-label={isFavorite ? `Retirer ${annonceTitle} des favoris` : `Ajouter ${annonceTitle} aux favoris`}
        aria-pressed={isFavorite}
        className={presentation === "icon"
          ? `absolute right-3 top-3 z-[1] grid h-9 w-9 place-items-center rounded-full border border-border bg-surface cursor-pointer disabled:cursor-wait ${isFavorite ? "text-accent" : "text-text"}`
          : `td-button ${isFavorite ? "td-button--primary" : "td-button--secondary"} h-11 min-h-11 w-full cursor-pointer px-5 sm:w-auto disabled:cursor-wait`}
        disabled={!favoriteReady || isSaving}
        onClick={toggleFavorite}
        type="button"
      >
        <svg aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} height="18" viewBox="0 0 24 24" width="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
        </svg>
        {presentation === "button" && (isFavorite ? "Retirer des favoris" : "Ajouter aux favoris")}
      </button>
    </span>
  );
}
