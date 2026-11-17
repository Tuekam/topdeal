import { Card, Input, Switch } from "@topdeal/ui";
import type { AnnonceDraft } from "../types/AnnonceDraft";

type CreateAnnonceSecondStepProps = {
  draft: AnnonceDraft;
  active: boolean;
  updateDraft(field: keyof AnnonceDraft, value: AnnonceDraft[keyof AnnonceDraft]): void;
};

export function CreateAnnonceSecondStep({ draft, active, updateDraft }: CreateAnnonceSecondStepProps) {
  return (
    <div className="grid gap-4" hidden={!active}>
      <section aria-labelledby="price-title">
        <Card className="p-5 sm:p-[26px_28px]">
          <h2 className="text-lg font-semibold text-text" id="price-title">
            Prix et disponibilité
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Indiquez le prix de base de votre produit et le nombre d’exemplaires disponibles.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Input
              endAdornment="FCFA"
              hint="Prix demandé pour ce produit, en FCFA."
              label="Prix de base"
              min="0"
              name="prix"
              onChange={(event) => updateDraft("prix", event.target.value)}
              required={active}
              step="any"
              type="number"
              value={draft.prix}
            />
            <Input
              hint="Nombre d’exemplaires identiques disponibles."
              label="Quantité disponible"
              min="1"
              name="quantite"
              onChange={(event) => updateDraft("quantite", event.target.value)}
              required={active}
              step="1"
              type="number"
              value={draft.quantite}
            />
            <Input
              fieldClassName="sm:col-span-2"
              hint="Ville : Bafoussam, Cameroun."
              label="Quartier ou secteur"
              maxLength={150}
              name="quartier"
              onChange={(event) => updateDraft("quartier", event.target.value)}
              placeholder="Ex. : Banengo, Djeleng, Tamdja…"
              required={active}
              value={draft.quartier}
            />
          </div>
        </Card>
      </section>

      <section aria-labelledby="options-title">
        <Card className="p-5 sm:p-[26px_28px]">
          <h2 className="text-lg font-semibold text-text" id="options-title">
            Options de l’annonce
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Cette option est facultative. Vous pouvez l’activer ou la désactiver.
          </p>

          <div className="mt-5">
            <Switch
              checked={draft.trocAccepte}
              description="Indiquez ce que vous aimeriez recevoir en échange de votre produit."
              disabled={!active}
              id="annonce-troc"
              label="Accepter le troc ?"
              name="trocAccepte"
              onCheckedChange={(checked) => updateDraft("trocAccepte", checked)}
              value="true"
            />
          </div>

          {draft.trocAccepte && (
            <div className="mt-4 rounded-field border border-border bg-page p-4 sm:p-[18px]">
              <Input
                hint="Un échange porte sur un article contre un article. Les modalités sont à convenir entre les deux parties."
                label="Que souhaitez-vous recevoir en échange ?"
                maxLength={1000}
                name="souhaitEchangeDescription"
                onChange={(event) => updateDraft("souhaitEchangeDescription", event.target.value)}
                placeholder="Ex. : un téléphone Android en bon état"
                required={active}
                value={draft.souhaitEchangeDescription}
              />
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
