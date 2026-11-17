"use client";

import { useRef, useState, type FormEvent } from "react";
import { BackButton, Button } from "@topdeal/ui";
import type { AnnonceCategory } from "../../core/models/AnnonceCategory";
import type { AnnonceDraft } from "../types/AnnonceDraft";
import { AnnonceFormProgress } from "./AnnonceFormProgress";
import { CreateAnnonceFirstStep } from "./CreateAnnonceFirstStep";
import { CreateAnnonceSecondStep } from "./CreateAnnonceSecondStep";

type CreateAnnonceScreenProps = {
  categories: AnnonceCategory[];
  onCancel(): void;
  onCreated(annonceId: string): void;
};

const INITIAL_DRAFT: AnnonceDraft = {
  titre: "",
  description: "",
  etat: "",
  categorieId: "",
  sousCategorieId: "",
  prix: "",
  quantite: "1",
  quartier: "",
  photos: [],
  trocAccepte: false,
  souhaitEchangeDescription: "",
};

export function CreateAnnonceScreen({ categories, onCancel, onCreated }: CreateAnnonceScreenProps) {
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function updateDraft(field: keyof AnnonceDraft, value: AnnonceDraft[keyof AnnonceDraft]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function validateCurrentStep(): boolean {
    const form = formRef.current;
    if (!form) return false;
    setError(null);
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
    if (currentStep === 1) {
      if (draft.photos.length < 1 || draft.photos.length > 6) {
        setError("Ajoute entre 1 et 6 photos pour continuer.");
        return false;
      }
      const validPhotos = draft.photos.every((photo) =>
        ["image/jpeg", "image/png", "image/webp"].includes(photo.type) &&
        photo.size > 0 && photo.size <= 5 * 1024 * 1024,
      );
      if (!validPhotos) {
        setError("Chaque photo doit être au format JPEG, PNG ou WebP et ne pas dépasser 5 Mo.");
        return false;
      }
    }
    return true;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData(event.currentTarget);
      formData.set("categorieId", draft.sousCategorieId || draft.categorieId);
      // The first-step fieldset is disabled on step 2, so its radio is omitted from FormData.
      formData.set("etat", draft.etat);
      formData.set("trocAccepte", String(draft.trocAccepte));

      const response = await fetch("/api/annonces", {
        method: "POST",
        headers: { "x-topdeal-request": "1" },
        body: formData,
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok || typeof result !== "object" || result === null || !("id" in result) || typeof result.id !== "string") {
        setError("La publication n’a pas abouti. Vérifie les informations et réessaie.");
        return;
      }
      onCreated(result.id);
    } catch {
      setError("Impossible de joindre le serveur. Vérifie ta connexion puis réessaie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[920px] px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Fil d’Ariane" className="mb-5 text-sm text-text-secondary">
        <a className="hover:text-accent" href="/annonces/nouvelle">Vendre</a>
        <span aria-hidden="true" className="mx-2">/</span>
        <span className="text-text">Publier une annonce</span>
      </nav>
      <header className="mb-7">
        <h1 className="text-3xl font-semibold tracking-tight text-text">Publier une annonce</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          {currentStep === 2
            ? "Définissez le prix, la quantité et les modalités de votre annonce."
            : "Présentez votre produit et renseignez les informations de votre annonce."}
        </p>
      </header>

      <AnnonceFormProgress currentStep={currentStep} />
      <form noValidate onSubmit={submit} ref={formRef}>
        <input name="categorieId" type="hidden" value={draft.sousCategorieId || draft.categorieId} />
        <CreateAnnonceFirstStep active={currentStep === 1} categories={categories} draft={draft} updateDraft={updateDraft} />
        <CreateAnnonceSecondStep active={currentStep === 2} draft={draft} updateDraft={updateDraft} />

        {error && <p className="mt-4 rounded-field border border-error/30 bg-error/5 p-3 text-sm text-error" role="alert">{error}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <BackButton onClick={currentStep === 1 ? onCancel : () => { setError(null); setCurrentStep(1); }}>
            {currentStep === 1 ? "Annuler" : "Retour"}
          </BackButton>
          {currentStep === 1 ? (
            <Button onClick={() => { if (validateCurrentStep()) setCurrentStep(2); }} type="button">Continuer</Button>
          ) : (
            <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Publication…" : "Publier l’annonce"}</Button>
          )}
        </div>
      </form>
    </main>
  );
}
