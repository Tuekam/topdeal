import { Card, Input, Switch } from "@topdeal/ui";
import type { AnnonceDraft } from "../types/AnnonceDraft";
import { formatAffiliatePrice } from "../formatters/formatAffiliatePrice";

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
          <h2 className="text-lg font-semibold text-text" id="price-title">Prix et disponibilité</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Indiquez le prix de base de votre produit et le nombre d’exemplaires disponibles.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Input
              endAdornment="FCFA"
              hint="C’est le prix de votre annonce originale."
              label="Prix de base"
              min="1"
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
          <h2 className="text-lg font-semibold text-text" id="options-title">Options de l’annonce</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Ces options sont facultatives. Vous pouvez les activer ou les désactiver.
          </p>

          <div className="mt-5">
            <Switch
              checked={draft.affiliationActive && !draft.trocAccepte}
              description="Autorisez les apporteurs d’affaires à partager un lien vers votre produit et à recevoir une rémunération sur les commandes issues de ce lien."
              disabled={!active || draft.trocAccepte}
              id="annonce-affiliation"
              label="Activer l’affiliation ?"
              name="affiliationActive"
              onCheckedChange={(checked) => updateDraft("affiliationActive", checked)}
            />
          </div>

          {draft.affiliationActive && !draft.trocAccepte && (
            <div className="mt-3 grid gap-4 rounded-field border border-border bg-surface-muted p-4 sm:ml-4 sm:p-[18px]">
              <Input
                endAdornment="FCFA"
                hint="Le même montant s’applique à tous les apporteurs pour ce produit."
                label="Rémunération fixe de l’apporteur"
                min="1"
                name="remunerationAffiliation"
                onChange={(event) => updateDraft("remunerationAffiliation", event.target.value)}
                required={active}
                step="1"
                type="number"
                value={draft.remunerationAffiliation}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-field border border-border bg-surface px-4 py-3">
                <span className="text-sm text-text-secondary">Prix affiché via le lien affilié</span>
                <strong className="text-base font-semibold text-text">{formatAffiliatePrice(draft.prix, draft.remunerationAffiliation)}</strong>
              </div>
              <p className="text-sm leading-6 text-text-secondary">
                Votre prix de base reste inchangé sur l’annonce originale. La rémunération est attribuée uniquement si l’acheteur commande via le lien affilié.
              </p>
            </div>
          )}

          <div className="mt-5 border-t border-border pt-5">
            <Switch
              checked={draft.trocAccepte}
              description="Indiquez ce que vous aimeriez recevoir en échange de votre produit."
              disabled={!active}
              id="annonce-troc"
              label="Accepter le troc ?"
              name="trocAccepte"
              onCheckedChange={(checked) => {
                updateDraft("trocAccepte", checked);
                if (checked) updateDraft("affiliationActive", false);
              }}
            />
          </div>

          {draft.trocAccepte && (
            <div className="mt-3 grid gap-3 rounded-field border border-border bg-surface-muted p-4 sm:ml-4 sm:p-[18px]">
              <Input
                label="Que souhaitez-vous recevoir en échange ?"
                maxLength={1000}
                name="souhaitEchangeDescription"
                onChange={(event) => updateDraft("souhaitEchangeDescription", event.target.value)}
                placeholder="Ex. : un téléphone Android en bon état"
                required={active}
                value={draft.souhaitEchangeDescription}
              />
              <p className="text-sm leading-6 text-text-secondary">
                Le troc porte sur un article contre un article. Les deux parties devront s’accorder sur les produits, le lieu et l’horaire avant l’échange. Une éventuelle soulte sera précisée pendant la discussion.
              </p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
