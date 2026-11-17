"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Input } from "@topdeal/ui";
import type { AnnonceOwnerItem } from "../../core/models/AnnonceOwnerItem";

type OwnedAnnonceCardProps = {
  annonce: AnnonceOwnerItem;
  onChanged(): void;
};

export function OwnedAnnonceCard({ annonce, onChanged }: OwnedAnnonceCardProps) {
  const [price, setPrice] = useState(annonce.prix);
  const [quantity, setQuantity] = useState(String(annonce.quantite));
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/annonces/${annonce.id}/modification`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-topdeal-request": "1",
        },
        body: JSON.stringify({ prix: price, quantite: Number(quantity) }),
      });
      if (!response.ok) {
        setFeedback("La modification n’a pas été enregistrée.");
        return;
      }
      setFeedback("Annonce mise à jour.");
      onChanged();
    } catch {
      setFeedback("Une erreur est survenue. Réessayez.");
    } finally {
      setIsSaving(false);
    }
  }

  async function changeVisibility() {
    setIsSaving(true);
    setFeedback(null);
    const visibility = annonce.visibilite === "PUBLIEE" ? "MASQUEE" : "PUBLIEE";
    try {
      const response = await fetch(`/api/annonces/${annonce.id}/visibilite`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-topdeal-request": "1",
        },
        body: JSON.stringify({ visibilite: visibility }),
      });
      if (!response.ok) {
        setFeedback("La visibilité n’a pas pu être modifiée.");
        return;
      }
      setFeedback(visibility === "MASQUEE" ? "Annonce masquée." : "Annonce republiée.");
      onChanged();
    } catch {
      setFeedback("Une erreur est survenue. Réessayez.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="grid gap-5 overflow-hidden p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:p-5">
      {annonce.photoUrl ? (
        <img
          alt={`${annonce.titre}, photo du produit`}
          className="aspect-square w-full rounded-field object-cover"
          height="160"
          loading="lazy"
          src={annonce.photoUrl}
          width="160"
        />
      ) : (
        <div aria-hidden="true" className="aspect-square rounded-field bg-image-tile" />
      )}
      <div className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-text">{annonce.titre}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {annonce.visibilite === "PUBLIEE"
                ? annonce.disponibilite === "DISPONIBLE" ? "Publiée · Disponible" : `Publiée · ${annonce.disponibilite}`
                : annonce.visibilite === "MASQUEE" ? "Masquée" : "Suspendue par l’administration"}
            </p>
          </div>
          {annonce.visibilite === "PUBLIEE" && (
            <a className="text-sm font-medium text-accent underline" href={`/annonces/${annonce.id}`}>
              Voir l’annonce
            </a>
          )}
        </div>

        <form className="grid gap-4 sm:grid-cols-3" onSubmit={update}>
          <Input
            label="Prix (FCFA)"
            max="9999999999.99"
            min="0"
            onChange={(event) => setPrice(event.target.value)}
            required
            step="0.01"
            type="number"
            value={price}
          />
          <Input
            label="Quantité"
            min="1"
            onChange={(event) => setQuantity(event.target.value)}
            required
            step="1"
            type="number"
            value={quantity}
          />
          <div className="flex items-end">
            <Button className="w-full" disabled={isSaving} type="submit">
              Enregistrer
            </Button>
          </div>
        </form>

        {annonce.visibilite !== "SUSPENDUE" && (
          <Button
            className="justify-self-start"
            disabled={isSaving}
            onClick={changeVisibility}
            variant="secondary"
          >
            {annonce.visibilite === "PUBLIEE" ? "Masquer l’annonce" : "Republier l’annonce"}
          </Button>
        )}
        {feedback && <p aria-live="polite" className="text-sm text-text-secondary">{feedback}</p>}
      </div>
    </Card>
  );
}
