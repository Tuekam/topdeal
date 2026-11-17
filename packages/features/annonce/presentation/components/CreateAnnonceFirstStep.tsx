import type { ChangeEvent } from "react";
import { Card, Input, Select } from "@topdeal/ui";
import type { AnnonceCategory } from "../../core/models/AnnonceCategory";
import type { AnnonceDraft } from "../types/AnnonceDraft";

type CreateAnnonceFirstStepProps = {
  categories: AnnonceCategory[];
  draft: AnnonceDraft;
  active: boolean;
  updateDraft(field: keyof AnnonceDraft, value: AnnonceDraft[keyof AnnonceDraft]): void;
};

export function CreateAnnonceFirstStep({
  categories,
  draft,
  active,
  updateDraft,
}: CreateAnnonceFirstStepProps) {
  const rootCategories = categories.filter((category) => category.parentId === null);
  const parentCategories = rootCategories.length > 0 ? rootCategories : categories;
  const subcategories = categories.filter((category) => category.parentId === draft.categorieId);

  function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const photos = Array.from(event.target.files ?? []);
    updateDraft("photos", photos);
  }

  return (
    <section aria-labelledby="product-info-title" data-step="1" hidden={!active}>
      <Card className="p-5 sm:p-7">
      <h2 className="text-lg font-semibold text-text" id="product-info-title">Informations sur le produit</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Ajoute les informations qui permettront aux acheteurs de le retrouver.
      </p>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-4 sm:grid-cols-[190px_minmax(0,1fr)]">
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-field border border-dashed border-input-border bg-surface-muted p-4 text-center text-text-secondary hover:bg-image-tile">
            <svg aria-hidden="true" className="h-7 w-7" fill="none" height="28" viewBox="0 0 24 24" width="28" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="8.5" cy="9" r="1.5" />
              <path d="m21 15-5-5L5 20" />
            </svg>
            <strong className="text-sm text-text">Ajouter des photos</strong>
            <span className="text-xs">Depuis votre appareil</span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              multiple
              name="photos"
              onChange={selectPhotos}
              required={active}
              type="file"
            />
          </label>
          <div className="grid content-center gap-3">
            <p className="rounded-field bg-surface-muted p-3 text-sm leading-5 text-text-secondary">
              Ajoute de 1 à 6 photos. Formats JPEG, PNG ou WebP, 5 Mo maximum par photo.
            </p>
            {draft.photos.length > 0 && (
              <ul aria-live="polite" className="grid gap-1 text-sm text-text-secondary">
                {draft.photos.map((photo, index) => (
                  <li key={`${photo.name}-${photo.size}-${index}`}>{photo.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Input
          label="Titre de l’annonce"
          maxLength={255}
          name="titre"
          onChange={(event) => updateDraft("titre", event.target.value)}
          placeholder="Ex. : Télévision Samsung 43 pouces"
          required={active}
          value={draft.titre}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            hint={categories.length === 0 ? "Aucune catégorie active n’est disponible." : undefined}
            id="annonce-category"
            label="Catégorie"
            onChange={(event) => {
              updateDraft("categorieId", event.target.value);
              updateDraft("sousCategorieId", "");
            }}
            required={active}
            value={draft.categorieId}
          >
            <option disabled value="">Choisir une catégorie</option>
            {parentCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>
          <Select
            disabled={!draft.categorieId || subcategories.length === 0}
            id="annonce-subcategory"
            label="Sous-catégorie"
            onChange={(event) => updateDraft("sousCategorieId", event.target.value)}
            value={draft.sousCategorieId}
          >
            <option value="">Choisir une sous-catégorie</option>
            {subcategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>
        </div>

        <fieldset className="grid gap-2" disabled={!active}>
          <legend className="td-input-label mb-2">État du produit</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["NEUF", "OCCASION"] as const).map((etat) => (
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-field border border-input-border px-3 text-sm text-text has-checked:border-accent has-checked:bg-surface-muted" key={etat}>
                <input
                  checked={draft.etat === etat}
                  name="etat"
                  onChange={() => updateDraft("etat", etat)}
                  required={active}
                  type="radio"
                  value={etat}
                />
                {etat === "NEUF" ? "Neuf" : "Occasion"}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-2">
          <label className="td-input-label" htmlFor="annonce-description">Description</label>
          <textarea
            className="td-input min-h-32 py-3"
            id="annonce-description"
            name="description"
            onChange={(event) => updateDraft("description", event.target.value)}
            placeholder="Décrivez le produit : son état, son utilisation, ses caractéristiques et ses éventuels défauts."
            required={active}
            value={draft.description}
          />
          <span className="text-xs leading-5 text-text-secondary">
            Donnez suffisamment de détails pour aider l’acheteur à comprendre votre produit.
          </span>
        </div>
      </div>
      </Card>
    </section>
  );
}
