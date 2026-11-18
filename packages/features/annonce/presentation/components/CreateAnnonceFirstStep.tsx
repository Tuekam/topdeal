import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Card, IconButton, Input, Select, Textarea, useToast } from "@topdeal/ui";
import type { AnnonceCategory } from "../../core/models/AnnonceCategory";
import type { AnnonceDraft } from "../types/AnnonceDraft";

type CreateAnnonceFirstStepProps = {
  categories: AnnonceCategory[];
  draft: AnnonceDraft;
  active: boolean;
  updateDraft(field: keyof AnnonceDraft, value: AnnonceDraft[keyof AnnonceDraft]): void;
};

const MAX_PHOTOS = 6;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function CreateAnnonceFirstStep({
  categories,
  draft,
  active,
  updateDraft,
}: CreateAnnonceFirstStepProps) {
  const rootCategories = categories.filter((category) => category.parentId === null);
  const parentCategories = rootCategories.length > 0 ? rootCategories : categories;
  const subcategories = categories.filter((category) => category.parentId === draft.categorieId);
  const previewUrls = useRef(new Map<File, string>());
  const [visiblePreviewUrls, setVisiblePreviewUrls] = useState(() => new Map<File, string>());
  const showToast = useToast();

  useEffect(() => () => {
    for (const url of previewUrls.current.values()) URL.revokeObjectURL(url);
    previewUrls.current.clear();
  }, []);

  function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const selectedPhotos = Array.from(input.files ?? []);
    input.value = "";
    if (draft.photos.length + selectedPhotos.length > MAX_PHOTOS) {
      showToast({ kind: "error", title: "Limite de photos dépassée", description: "Vous pouvez ajouter jusqu’à 6 photos." });
      return;
    }
    const invalidPhoto = selectedPhotos.find((photo) =>
      !ACCEPTED_PHOTO_TYPES.includes(photo.type) || photo.size <= 0 || photo.size > MAX_PHOTO_SIZE_BYTES,
    );
    if (invalidPhoto) {
      showToast({ kind: "error", title: "Photo non acceptée", description: "Utilisez JPEG, PNG ou WebP, avec 5 Mo maximum par photo." });
      return;
    }
    if (selectedPhotos.length === 0) return;
    const nextPreviewUrls = new Map(previewUrls.current);
    for (const photo of selectedPhotos) {
      if (!nextPreviewUrls.has(photo)) nextPreviewUrls.set(photo, URL.createObjectURL(photo));
    }
    previewUrls.current = nextPreviewUrls;
    setVisiblePreviewUrls(nextPreviewUrls);
    updateDraft("photos", [...draft.photos, ...selectedPhotos]);
    showToast({ kind: "success", title: "Photos ajoutées", description: `${selectedPhotos.length} photo(s) ajoutée(s) à l’annonce.` });
  }

  function removePhoto(photo: File) {
    const url = previewUrls.current.get(photo);
    if (url) URL.revokeObjectURL(url);
    const nextPreviewUrls = new Map(previewUrls.current);
    nextPreviewUrls.delete(photo);
    previewUrls.current = nextPreviewUrls;
    setVisiblePreviewUrls(nextPreviewUrls);
    updateDraft("photos", draft.photos.filter((current) => current !== photo));
    showToast({ kind: "success", title: "Photo retirée du formulaire" });
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
          <label className={`flex min-h-36 flex-col items-center justify-center gap-2 rounded-field border border-dashed border-input-border bg-surface-muted p-4 text-center text-text-secondary ${draft.photos.length >= MAX_PHOTOS ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-image-tile"}`}>
            <svg aria-hidden="true" className="h-7 w-7" fill="none" height="28" viewBox="0 0 24 24" width="28" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="8.5" cy="9" r="1.5" />
              <path d="m21 15-5-5L5 20" />
            </svg>
            <strong className="text-sm text-text">{draft.photos.length >= MAX_PHOTOS ? "Limite de photos atteinte" : "Ajouter des photos"}</strong>
            <span className="text-xs">{draft.photos.length} / {MAX_PHOTOS} photo(s) · Vous pouvez en ajouter en plusieurs fois</span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={draft.photos.length >= MAX_PHOTOS}
              multiple
              name="photos"
              onChange={selectPhotos}
              type="file"
            />
          </label>
          <div className="grid content-center gap-3">
            <p className="rounded-field bg-surface-muted p-3 text-sm leading-5 text-text-secondary">
              Ajoute de 1 à 6 photos. Formats JPEG, PNG ou WebP, 5 Mo maximum par photo.
            </p>
            {draft.photos.length > 0 && (
              <ul aria-label="Photos sélectionnées" className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3">
                {draft.photos.map((photo, index) => (
                  <li className="relative overflow-hidden rounded-field border border-border bg-surface" key={`${photo.name}-${photo.size}-${photo.lastModified}-${index}`}>
                    <img alt={`Aperçu : ${photo.name}`} className="aspect-[4/3] w-full object-cover" height="160" loading="lazy" src={visiblePreviewUrls.get(photo) ?? ""} width="220" />
                    <IconButton className="absolute right-2 top-2 h-11 w-11" label={"Retirer " + photo.name} onClick={() => removePhoto(photo)}>
                      <span aria-hidden="true" className="text-lg leading-none">×</span>
                    </IconButton>
                    <span className="block truncate px-2 py-1.5 text-xs text-text-secondary" title={photo.name}>{photo.name}</span>
                  </li>
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
            name="categorieParentId"
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
            name="sousCategorieId"
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

        <Textarea
          fieldClassName="gap-2"
          hint="Donnez suffisamment de détails pour aider l’acheteur à comprendre votre produit."
          id="annonce-description"
          label="Description"
          name="description"
          onChange={(event) => updateDraft("description", event.target.value)}
          placeholder="Décrivez le produit : son état, son utilisation, ses caractéristiques et ses éventuels défauts."
          required={active}
          value={draft.description}
        />
      </div>
      </Card>
    </section>
  );
}
