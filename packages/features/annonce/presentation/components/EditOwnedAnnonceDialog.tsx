"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, Card, IconButton, Input, Select, Switch, Textarea, useToast } from "@topdeal/ui";
import type { AnnonceCategory } from "../../core/models/AnnonceCategory";
import type { OwnedAnnonceEditDetails } from "../../core/models/OwnedAnnonceEditDetails";
import { formatAffiliatePrice } from "../formatters/formatAffiliatePrice";

type EditOwnedAnnonceDialogProps = {
  annonceId: string;
  initialDetails: OwnedAnnonceEditDetails;
  categories: AnnonceCategory[];
  open: boolean;
  onClose(): void;
  onSaved(): void;
};

const MAX_PHOTOS = 6;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function categorySelection(categories: AnnonceCategory[], categoryId: string) {
  const category = categories.find((item) => item.id === categoryId);
  return {
    parentId: category?.parentId ?? category?.id ?? "",
    subcategoryId: category?.parentId ? category.id : "",
  };
}

export function EditOwnedAnnonceDialog({
  annonceId,
  initialDetails,
  categories,
  open,
  onClose,
  onSaved,
}: EditOwnedAnnonceDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState<OwnedAnnonceEditDetails>(initialDetails);
  const [retainedPhotoIds, setRetainedPhotoIds] = useState<string[]>(() => initialDetails.photos.map((photo) => photo.id));
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const previewUrls = useRef(new Map<File, string>());
  const [visiblePreviewUrls, setVisiblePreviewUrls] = useState(() => new Map<File, string>());
  const [isSaving, setIsSaving] = useState(false);
  const showToast = useToast();
  const roots = categories.filter((category) => category.parentId === null);
  const selectedCategory = categorySelection(categories, details.categorieId);
  const subcategories = categories.filter((category) => category.parentId === selectedCategory.parentId);
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  useEffect(() => () => {
    for (const url of previewUrls.current.values()) URL.revokeObjectURL(url);
    previewUrls.current.clear();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (retainedPhotoIds.length + newPhotos.length < 1) {
      showToast({ kind: "error", title: "Photo requise", description: "Conservez ou ajoutez au moins une photo." });
      return;
    }
    if (details.affiliationActive && (
      details.trocAccepte ||
      !/^[1-9]\d{0,9}$/.test(details.remunerationAffiliation) ||
      Number(details.prix) + Number(details.remunerationAffiliation) > 9_999_999_999.99
    )) {
      showToast({ kind: "error", title: "Affiliation à vérifier", description: "Désactive le troc et saisis une rémunération valide sans dépasser la limite du prix final." });
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData(form);
      formData.set("categorieId", details.categorieId);
      formData.set("trocAccepte", String(details.trocAccepte));
      formData.set("affiliationActive", String(details.affiliationActive && !details.trocAccepte));
      formData.set("remunerationAffiliation", details.remunerationAffiliation || "0");
      formData.set("categorieSouhaiteeId", details.categorieSouhaiteeId ?? "");
      formData.set("souhaitEchangeDescription", details.souhaitEchangeDescription ?? "");
      formData.delete("retainedPhotoIds");
      retainedPhotoIds.forEach((id) => formData.append("retainedPhotoIds", id));
      formData.delete("photos");
      newPhotos.forEach((photo) => formData.append("photos", photo));
      const response = await fetch("/api/annonces/" + annonceId + "/modification", {
        method: "PATCH",
        headers: { "x-topdeal-request": "1" },
        body: formData,
      });
      if (!response.ok) {
        const message = response.status === 409
          ? "Une commande est en cours sur cette annonce. Modifiez-la lorsque cette commande sera terminée."
          : response.status === 400
            ? "Vérifiez les champs et gardez entre 1 et 6 photos."
            : "La modification n’a pas pu être enregistrée. Réessayez.";
        showToast({ kind: "error", title: "Modifications non enregistrées", description: message });
        return;
      }
      showToast({ kind: "success", title: "Annonce mise à jour" });
      onSaved();
      onClose();
    } catch {
      const message = "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.";
      showToast({ kind: "error", title: "Modifications non enregistrées", description: message });
    } finally {
      setIsSaving(false);
    }
  }

  function selectNewPhotos(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const selectedPhotos = Array.from(input.files ?? []);
    input.value = "";
    const currentPhotoCount = retainedPhotoIds.length + newPhotos.length;
    if (currentPhotoCount + selectedPhotos.length > MAX_PHOTOS) {
      showToast({ kind: "error", title: "Limite de photos dépassée", description: `Vous pouvez encore ajouter ${MAX_PHOTOS - currentPhotoCount} photo(s).` });
      return;
    }
    const invalidPhoto = selectedPhotos.find((photo) =>
      !ALLOWED_PHOTO_TYPES.includes(photo.type) || photo.size <= 0 || photo.size > MAX_PHOTO_SIZE_BYTES,
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
    setNewPhotos((current) => [...current, ...selectedPhotos]);
    showToast({ kind: "success", title: "Photos ajoutées", description: `${selectedPhotos.length} photo(s) ajoutée(s) au formulaire.` });
  }

  function removeNewPhoto(photo: File) {
    const url = previewUrls.current.get(photo);
    if (url) URL.revokeObjectURL(url);
    const nextPreviewUrls = new Map(previewUrls.current);
    nextPreviewUrls.delete(photo);
    previewUrls.current = nextPreviewUrls;
    setVisiblePreviewUrls(nextPreviewUrls);
    setNewPhotos((current) => current.filter((item) => item !== photo));
    showToast({ kind: "success", title: "Photo retirée du formulaire" });
  }

  function removeRetainedPhoto(photoId: string) {
    setRetainedPhotoIds((current) => current.filter((id) => id !== photoId));
    showToast({ kind: "success", title: "Photo retirée du formulaire" });
  }

  function update<K extends keyof OwnedAnnonceEditDetails>(field: K, value: OwnedAnnonceEditDetails[K]) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  function requestClose() {
    if (isSaving) return;
    onClose();
  }

  return (
    <dialog
      aria-labelledby={"edit-annonce-title-" + annonceId}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem)] w-[calc(100vw-env(safe-area-inset-left)-env(safe-area-inset-right)-1rem)] max-w-[760px] overflow-y-auto rounded-card border border-border bg-page p-0 text-text shadow-xl backdrop:bg-overlay sm:max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)]"
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onClose={onClose}
      ref={dialog}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-4 sm:px-6">
        <h2 className="text-lg font-semibold" id={"edit-annonce-title-" + annonceId}>Modifier l’annonce</h2>
        <button aria-label="Fermer" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-border bg-surface text-xl" onClick={requestClose} type="button">×</button>
      </div>

      {
        <form className="grid gap-5 p-4 sm:p-6" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Titre de l’annonce" maxLength={255} name="titre" onChange={(event) => update("titre", event.target.value)} required value={details.titre} />
            <Select label="État" name="etat" onChange={(event) => update("etat", event.target.value as OwnedAnnonceEditDetails["etat"])} required value={details.etat}>
              <option value="NEUF">Neuf</option>
              <option value="OCCASION">Occasion</option>
            </Select>
            <Select label="Catégorie" onChange={(event) => update("categorieId", event.target.value)} required value={selectedCategory.parentId}>
              <option disabled value="">Choisir une catégorie</option>
              {roots.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
            <Select
              disabled={!selectedCategory.parentId || subcategories.length === 0}
              label="Sous-catégorie"
              onChange={(event) => update("categorieId", event.target.value || selectedCategory.parentId)}
              value={selectedCategory.subcategoryId}
            >
              <option value="">Aucune sous-catégorie</option>
              {subcategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
          </div>

          <Textarea fieldClassName="gap-2" id={"edit-description-" + annonceId} label="Description" name="description" onChange={(event) => update("description", event.target.value)} required value={details.description} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input endAdornment="FCFA" label="Prix" max="9999999999.99" min="0" name="prix" onChange={(event) => update("prix", event.target.value)} required step="0.01" type="number" value={details.prix} />
            <Input label="Quantité" min="1" name="quantite" onChange={(event) => update("quantite", Number(event.target.value))} required step="1" type="number" value={String(details.quantite)} />
            <Input label="Quartier ou secteur" maxLength={150} name="quartier" onChange={(event) => update("quartier", event.target.value)} required value={details.quartier} />
          </div>

          <Card className="grid gap-4 p-4 sm:p-5">
            <div>
              <h3 className="font-semibold text-text">Options de l’annonce</h3>
              <p className="mt-1 text-sm text-text-secondary">Ces options sont facultatives. Vous pouvez les activer ou les désactiver.</p>
            </div>
            <Switch
              checked={details.affiliationActive && !details.trocAccepte}
              description="Autorisez les apporteurs d’affaires à partager un lien vers votre produit et à recevoir une rémunération sur les commandes issues de ce lien."
              disabled={isSaving || details.trocAccepte}
              label="Activer l’affiliation ?"
              name="affiliationActive"
              onCheckedChange={(checked) => update("affiliationActive", checked)}
            />
            {details.affiliationActive && !details.trocAccepte && (
              <div className="grid gap-3 rounded-field border border-border bg-surface-muted p-4 sm:ml-4 sm:p-[18px]">
                <Input
                  endAdornment="FCFA"
                  hint="Le même montant s’applique à tous les apporteurs pour ce produit."
                  label="Rémunération fixe de l’apporteur"
                  min="1"
                  name="remunerationAffiliation"
                  onChange={(event) => update("remunerationAffiliation", event.target.value)}
                  required
                  step="1"
                  type="number"
                  value={details.remunerationAffiliation}
                />
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-field border border-border bg-surface px-4 py-3">
                  <span className="text-sm text-text-secondary">Prix affiché via le lien affilié</span>
                  <strong className="text-base font-semibold text-text">{formatAffiliatePrice(details.prix, details.remunerationAffiliation)}</strong>
                </div>
                <p className="text-sm text-text-secondary">Votre prix de base reste inchangé sur l’annonce originale. La rémunération est attribuée uniquement si l’acheteur commande via le lien affilié.</p>
              </div>
            )}
            <Switch
              checked={details.trocAccepte}
              description="Indiquez ce que vous aimeriez recevoir en échange de votre produit."
              label="Accepter le troc ?"
              name="trocAccepte"
              onCheckedChange={(checked) => {
                update("trocAccepte", checked);
                if (checked) update("affiliationActive", false);
              }}
            />
            {details.trocAccepte && (
              <div className="grid gap-3 rounded-field border border-border bg-surface-muted p-4 sm:ml-4 sm:p-[18px]">
                <Input
                  label="Que souhaitez-vous recevoir en échange ?"
                  maxLength={1000}
                  name="souhaitEchangeDescription"
                  onChange={(event) => update("souhaitEchangeDescription", event.target.value)}
                  required
                  value={details.souhaitEchangeDescription ?? ""}
                />
                <p className="text-sm leading-6 text-text-secondary">Le troc porte sur un article contre un article. Les deux parties devront s’accorder sur les produits, le lieu et l’horaire avant l’échange. Une éventuelle soulte sera précisée pendant la discussion.</p>
              </div>
            )}
          </Card>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">Photos (1 à 6, JPEG/PNG/WebP, 5 Mo maximum chacune)</legend>
            <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3">
              {details.photos.filter((photo) => retainedPhotoIds.includes(photo.id)).map((photo) => {
                return (
                  <div className="relative overflow-hidden rounded-field border border-border bg-surface" key={photo.id}>
                    <img alt="Photo de l’annonce" className="aspect-[4/3] w-full object-cover" height="160" loading="lazy" src={photo.url} width="220" />
                    <IconButton className="absolute right-2 top-2 h-11 w-11" disabled={isSaving} label="Retirer cette photo" onClick={() => void removeRetainedPhoto(photo.id)}>
                      <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"><path d="m6 6 12 12M18 6 6 18" /></svg>
                    </IconButton>
                  </div>
                );
              })}
            </div>
            {newPhotos.length > 0 && (
              <div aria-label="Nouvelles photos sélectionnées" className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3">
                {newPhotos.map((photo, index) => (
                  <div className="relative overflow-hidden rounded-field border border-accent bg-surface" key={`${photo.name}-${photo.size}-${photo.lastModified}-${index}`}>
                    <img alt={`Aperçu : ${photo.name}`} className="aspect-[4/3] w-full object-cover" height="160" loading="lazy" src={visiblePreviewUrls.get(photo) ?? ""} width="220" />
                    <IconButton className="absolute right-2 top-2 h-11 w-11" disabled={isSaving} label={`Retirer ${photo.name}`} onClick={() => removeNewPhoto(photo)}>
                      <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"><path d="m6 6 12 12M18 6 6 18" /></svg>
                    </IconButton>
                    <span className="block truncate px-2 py-1.5 text-xs text-text-secondary" title={photo.name}>{photo.name}</span>
                  </div>
                ))}
              </div>
            )}
            <label className="grid cursor-pointer gap-2 rounded-field border border-dashed border-input-border bg-surface p-3 text-sm">
              {retainedPhotoIds.length + newPhotos.length >= MAX_PHOTOS ? "Limite de photos atteinte" : "Ajouter des photos"}
              <input accept="image/jpeg,image/png,image/webp" disabled={isSaving || retainedPhotoIds.length + newPhotos.length >= MAX_PHOTOS} multiple onChange={selectNewPhotos} type="file" />
              <span className="text-xs font-normal text-text-secondary">
                {retainedPhotoIds.length + newPhotos.length} / {MAX_PHOTOS} photo(s) conservée(s) ou ajoutée(s).
              </span>
            </label>
          </fieldset>

          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
            <Button onClick={requestClose} type="button" variant="secondary">Annuler</Button>
            <Button disabled={isSaving} type="submit">{isSaving ? "Enregistrement…" : "Enregistrer les modifications"}</Button>
          </div>
        </form>
      }
    </dialog>
  );
}
