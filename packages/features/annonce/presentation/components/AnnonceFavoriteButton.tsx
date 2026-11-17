"use client";

import { useState } from "react";

type AnnonceFavoriteButtonProps = {
  annonceTitle: string;
};

export function AnnonceFavoriteButton({ annonceTitle }: AnnonceFavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <button
      aria-label={isFavorite ? `Retirer ${annonceTitle} des favoris` : `Ajouter ${annonceTitle} aux favoris`}
      aria-pressed={isFavorite}
      className={`absolute right-3 top-3 z-[1] grid h-9 w-9 place-items-center rounded-full border border-border bg-surface ${isFavorite ? "text-accent" : "text-text"}`}
      onClick={() => setIsFavorite((current) => !current)}
      type="button"
    >
      <svg aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} height="18" viewBox="0 0 24 24" width="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      </svg>
    </button>
  );
}
