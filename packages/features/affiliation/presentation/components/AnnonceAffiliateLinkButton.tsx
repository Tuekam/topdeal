"use client";

import { useRef, useState } from "react";
import { Button, useToast } from "@topdeal/ui";

type Props = { annonceId: string };

export function AnnonceAffiliateLinkButton({ annonceId }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const showToast = useToast();

  async function createLink() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/annonces/${annonceId}/affiliation`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-topdeal-request": "1" },
        body: "{}",
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok || typeof result !== "object" || result === null || !("code" in result) || typeof result.code !== "string") {
        showToast({ kind: "error", title: "Lien indisponible", description: response.status === 401 ? "Connecte-toi pour créer ton lien de revente." : response.status === 503 ? "Le service d’authentification est momentanément indisponible." : response.status === 404 ? "Cette annonce ne peut pas être revendue par affiliation." : "Impossible de créer le lien. Réessaie." });
        return;
      }
      setLink(`${window.location.origin}/annonces/${annonceId}?affiliation=${encodeURIComponent(result.code)}`);
      dialog.current?.showModal();
    } catch {
      showToast({ kind: "error", title: "Lien indisponible", description: "Impossible de joindre le serveur. Réessaie." });
    } finally {
      setIsLoading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      showToast({ kind: "success", title: "Lien copié" });
      dialog.current?.close();
    } catch {
      linkInput.current?.focus();
      linkInput.current?.select();
      showToast({ kind: "error", title: "Copie impossible", description: "Sélectionne le lien pour le copier." });
    }
  }

  return (
    <>
      <Button disabled={isLoading} onClick={createLink} type="button" variant="secondary">
        {isLoading ? "Création du lien…" : "Revendre"}
      </Button>
      <dialog
        aria-labelledby={`affiliate-link-title-${annonceId}`}
        className="fixed inset-0 m-auto w-[calc(100vw-2rem)] max-w-sm rounded-card border border-border bg-surface p-0 text-text shadow-xl backdrop:bg-overlay"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        ref={dialog}
      >
        <div className="grid gap-3 p-4 sm:p-5">
          <h2 className="text-base font-semibold" id={`affiliate-link-title-${annonceId}`}>Ton lien de revente</h2>
          <p className="text-sm text-text-secondary">Partage ce lien. La personne verra le prix final de l’annonce.</p>
          <input aria-label="Lien affilié" className="td-input min-w-0" readOnly ref={linkInput} value={link} onFocus={(event) => event.currentTarget.select()} />
          <div className="flex justify-end gap-3">
            <Button onClick={() => dialog.current?.close()} type="button" variant="secondary">Fermer</Button>
            <Button onClick={copyLink} type="button">Copier le lien</Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
