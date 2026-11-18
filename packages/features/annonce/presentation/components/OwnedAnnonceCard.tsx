"use client";

import { useState } from "react";
import { IconButton, useToast } from "@topdeal/ui";
import type { AnnonceOwnerItem } from "../../core/models/AnnonceOwnerItem";
import { AnnonceProductCard } from "./AnnonceProductCard";

type OwnedAnnonceCardProps = {
  annonce: AnnonceOwnerItem;
  onEdit(annonceId: string): void;
  onPrefetchEdit(annonceId: string): void;
  onChanged(): void;
};

export function OwnedAnnonceCard({ annonce, onEdit, onPrefetchEdit, onChanged }: OwnedAnnonceCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [visibility, setVisibility] = useState(annonce.visibilite);
  const showToast = useToast();

  async function changeVisibility() {
    const nextVisibility = visibility === "PUBLIEE" ? "MASQUEE" : "PUBLIEE";
    setIsSaving(true);
    const previousVisibility = visibility;
    setVisibility(nextVisibility);
    try {
      const response = await fetch("/api/annonces/" + annonce.id + "/visibilite", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-topdeal-request": "1",
        },
        body: JSON.stringify({ visibilite: nextVisibility }),
      });
      if (!response.ok) {
        setVisibility(previousVisibility);
        showToast({ kind: "error", title: "Visibilité inchangée", description: "La visibilité n’a pas pu être modifiée. Réessayez." });
        return;
      }
      showToast({ kind: "success", title: nextVisibility === "MASQUEE" ? "Annonce masquée" : "Annonce republiée" });
      onChanged();
    } catch {
      setVisibility(previousVisibility);
      showToast({ kind: "error", title: "Action non effectuée", description: "Une erreur est survenue. Réessayez." });
    } finally {
      setIsSaving(false);
    }
  }

  const visibilityLabel = visibility === "PUBLIEE"
    ? "Publiée"
    : visibility === "MASQUEE"
      ? "Masquée"
      : "Suspendue par l’administration";
  const availabilityLabel = annonce.disponibilite === "DISPONIBLE"
    ? "Disponible"
    : annonce.disponibilite === "EPUISEE" ? "Épuisée" : "Indisponible";

  return (
    <div>
      <AnnonceProductCard
        annonce={annonce}
        status={visibilityLabel + " · " + availabilityLabel}
        imageActions={
          <>
            <IconButton
              disabled={isSaving}
              label="Modifier l’annonce"
              onClick={() => onEdit(annonce.id)}
              onFocus={() => onPrefetchEdit(annonce.id)}
              onPointerEnter={() => onPrefetchEdit(annonce.id)}
            >
              <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
            </IconButton>
            {visibility !== "SUSPENDUE" && (
              <IconButton disabled={isSaving} label={visibility === "PUBLIEE" ? "Masquer l’annonce" : "Republier l’annonce"} onClick={() => void changeVisibility()}>
                {visibility === "PUBLIEE"
                  ? <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 5 9 7a8.8 8.8 0 0 1-2.1 3.2M6.2 6.2C3.9 7.7 3 10.2 3 12c0 2 4 7 9 7 1 0 2-.2 2.8-.6"/></svg>
                  : <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/><circle cx="12" cy="12" r="3"/></svg>}
              </IconButton>
            )}
          </>
        }
      />
    </div>
  );
}
