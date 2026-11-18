"use client";

import { useRef, useState, type FormEvent } from "react";
import { BackButton, Button, useToast } from "@topdeal/ui";
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
  affiliationActive: false,
  remunerationAffiliation: "5000",
};

export function CreateAnnonceScreen({ categories, onCancel, onCreated }: CreateAnnonceScreenProps) {
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const showToast = useToast();

  function updateDraft(field: keyof AnnonceDraft, value: AnnonceDraft[keyof AnnonceDraft]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function cancelCreation() {
    onCancel();
  }

  function showInvalidField(field: string, title: string, description: string): false {
    const selector = field === "categorieParentId" ? "#annonce-category" : `[name="${field}"]`;
    formRef.current?.querySelector<HTMLElement>(selector)?.focus();
    showToast({ kind: "error", title, description });
    return false;
  }

  function validateFirstStep(): boolean {
    if (!draft.titre.trim()) return showInvalidField("titre", "Titre requis", "Saisis le titre de l’annonce.");
    if (!draft.categorieId) return showInvalidField("categorieParentId", "Catégorie requise", "Choisis une catégorie pour l’annonce.");
    if (!draft.etat) return showInvalidField("etat", "État requis", "Indique si le produit est neuf ou d’occasion.");
    if (!draft.description.trim()) return showInvalidField("description", "Description requise", "Ajoute une description du produit.");
    if (draft.photos.length < 1 || draft.photos.length > 6) {
      return showInvalidField("photos", "Photos requises", "Ajoute entre 1 et 6 photos pour continuer.");
    }

    const validPhotos = draft.photos.every((photo) =>
      ["image/jpeg", "image/png", "image/webp"].includes(photo.type) &&
      photo.size > 0 && photo.size <= 5 * 1024 * 1024,
    );
    if (!validPhotos) {
      return showInvalidField("photos", "Photo non acceptée", "Utilise JPEG, PNG ou WebP, avec 5 Mo maximum par photo.");
    }
    return true;
  }

  function validateSecondStep(): boolean {
    if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(draft.prix)) {
      return showInvalidField("prix", "Prix à corriger", "Saisis un prix valide en FCFA, avec au plus deux décimales.");
    }
    if (!/^\d+$/.test(draft.quantite) || !Number.isSafeInteger(Number(draft.quantite)) || Number(draft.quantite) < 1) {
      return showInvalidField("quantite", "Quantité à corriger", "Saisis un nombre entier supérieur à zéro.");
    }
    if (!draft.quartier.trim() || draft.quartier.length > 150) {
      return showInvalidField("quartier", "Quartier requis", "Saisis le quartier ou secteur (150 caractères maximum).");
    }
    if (draft.trocAccepte && !draft.souhaitEchangeDescription.trim()) {
      return showInvalidField("souhaitEchangeDescription", "Précise le troc souhaité", "Indique ce que tu souhaites recevoir en échange.");
    }
    if (draft.affiliationActive && draft.trocAccepte) {
      return showInvalidField("affiliationActive", "Affiliation indisponible", "Désactive le troc pour activer la revente affiliée.");
    }
    if (draft.affiliationActive && !/^[1-9]\d{0,9}$/.test(draft.remunerationAffiliation)) {
      return showInvalidField("remunerationAffiliation", "Rémunération à corriger", "Saisis un montant entier d’au moins 1 FCFA.");
    }
    if (draft.affiliationActive && Number(draft.prix) + Number(draft.remunerationAffiliation) > 9_999_999_999.99) {
      return showInvalidField("remunerationAffiliation", "Prix final trop élevé", "Le prix de base augmenté de la rémunération dépasse la limite autorisée.");
    }
    return true;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentStep !== 2) return;
    const form = event.currentTarget;
    if (!validateSecondStep()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData(form);
      formData.delete("photos");
      draft.photos.forEach((photo) => formData.append("photos", photo));
      formData.set("categorieId", draft.sousCategorieId || draft.categorieId);
      // The first-step fieldset is disabled on step 2, so its radio is omitted from FormData.
      formData.set("etat", draft.etat);
      formData.set("trocAccepte", String(draft.trocAccepte));
      formData.set("affiliationActive", String(draft.affiliationActive && !draft.trocAccepte));

      const response = await fetch("/api/annonces", {
        method: "POST",
        headers: { "x-topdeal-request": "1" },
        body: formData,
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok || typeof result !== "object" || result === null || !("id" in result) || typeof result.id !== "string") {
        showToast({ kind: "error", title: "Annonce non publiée", description: "Vérifie les informations et réessaie." });
        return;
      }
      showToast({ kind: "success", title: "Annonce publiée" });
      onCreated(result.id);
    } catch {
      showToast({ kind: "error", title: "Annonce non publiée", description: "Impossible de joindre le serveur. Vérifie ta connexion puis réessaie." });
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
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Publier une annonce</h1>
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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <BackButton onClick={currentStep === 1 ? cancelCreation : () => setCurrentStep(1)}>
            {currentStep === 1 ? "Annuler" : "Retour"}
          </BackButton>
          {currentStep === 1 ? (
            <Button key="continue" onClick={(event) => { event.preventDefault(); if (validateFirstStep()) setCurrentStep(2); }} type="button">Continuer</Button>
          ) : (
            <Button disabled={isSubmitting} key="publish" type="submit">{isSubmitting ? "Publication…" : "Publier l’annonce"}</Button>
          )}
        </div>
      </form>
    </main>
  );
}
