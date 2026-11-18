"use client";

import { useState } from "react";
import {
  BackButton,
  Button,
  Card,
  colors,
  IconButton,
  Input,
  Select,
  Switch,
  THEME_OPTIONS,
  Textarea,
  useToast,
} from "@topdeal/ui";

const colorTokens = [
  ["Page", colors.page],
  ["Surface", colors.surface],
  ["Surface adoucie", colors.surfaceMuted],
  ["Tuile d’image", colors.imageTile],
  ["Bordure", colors.border],
  ["Bordure de champ", colors.inputBorder],
  ["Texte principal", colors.text],
  ["Texte secondaire", colors.textSecondary],
  ["Accent", colors.accent],
  ["Texte sur accent", colors.onAccent],
  ["Focus", colors.focus],
  ["Fond de dialogue", colors.overlay],
  ["Erreur", colors.error],
  ["Fond d’erreur", colors.errorBackground],
  ["Succès", colors.success],
  ["Fond de succès", colors.successBackground],
  ["Avertissement", colors.warning],
  ["Fond d’avertissement", colors.warningBackground],
] as const;

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function DesignSystemPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const showToast = useToast();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content flex-col gap-6 px-page-gutter py-page-gutter sm:gap-8">
      <header className="space-y-4" id="top">
        <BackButton href="/annonces">Retour aux annonces</BackButton>
        <div className="space-y-2">
          <p className="text-supporting font-medium uppercase tracking-wide text-text-secondary">
            TopDeal · Référence UI
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Design System</h1>
          <p className="max-w-3xl text-text-secondary">
            Composants génériques et rôles de couleur partagés. Les écrans produit
            doivent composer avec ces éléments au lieu de redéfinir leurs styles.
          </p>
        </div>
      </header>

      <Card className="space-y-5 p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Couleurs sémantiques</h2>
          <p className="mt-1 text-supporting text-text-secondary">
            Choisis Orange, Bleu, Jaune, Rouge ou Vert dans le bouton Thème du header.
            La sélection modifie les mêmes tokens sur toutes les pages et reste mémorisée sur cet appareil.
          </p>
        </div>
        <div aria-label="Palettes disponibles" className="flex flex-wrap gap-3">
          {THEME_OPTIONS.map((option) => (
            <span className="inline-flex items-center gap-2 rounded-field border border-border px-3 py-2 text-sm" key={option.value}>
              <span aria-hidden="true" className="grid size-5 place-items-center rounded-full border border-border" data-theme={option.value}>
                <span className="size-3 rounded-full bg-accent" />
              </span>
              {option.label}
            </span>
          ))}
        </div>
        <ul className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map(([name, value]) => (
            <li className="flex min-w-0 items-center gap-3 rounded-field border border-border p-3" key={name}>
              <span
                aria-hidden="true"
                className="size-10 shrink-0 rounded-field border border-border"
                style={{ backgroundColor: value }}
              />
              <span className="min-w-0">
                <span className="block text-label font-medium">{name}</span>
                <code className="block truncate text-supporting text-text-secondary">{value}</code>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-5 p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Actions</h2>
          <p className="mt-1 text-supporting text-text-secondary">
            Boutons principaux, secondaires, désactivés, icône et retour.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Action principale</Button>
          <Button variant="secondary">Action secondaire</Button>
          <Button disabled>Action désactivée</Button>
          <IconButton label="Ouvrir un exemple"><ChevronIcon /></IconButton>
        </div>
      </Card>

      <Card className="space-y-5 p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Champs de formulaire</h2>
          <p className="mt-1 text-supporting text-text-secondary">
            Contrôles avec labels, aide, erreurs et états désactivés.
          </p>
        </div>
        <div className="grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          <Input label="Adresse e-mail" name="email-example" placeholder="nom@exemple.com" type="email" />
          <Input
            error="Exemple de message d’erreur associé au champ."
            hint="L’aide et l’erreur sont reliées au champ pour les lecteurs d’écran."
            label="Champ avec erreur"
            name="error-example"
          />
          <Select label="Catégorie" name="category-example" defaultValue="electronics">
            <option value="electronics">Électronique</option>
            <option value="fashion">Vêtements et mode</option>
          </Select>
          <Input disabled label="Champ désactivé" name="disabled-example" />
          <Textarea
            className="min-h-28"
            hint="Une description aide à comprendre le produit."
            label="Description"
            name="description-example"
            placeholder="Saisir une description…"
          />
        </div>
      </Card>

      <Card className="space-y-5 p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Interrupteur</h2>
          <p className="mt-1 text-supporting text-text-secondary">
            Son état actif suit l’accent du thème.
          </p>
        </div>
        <div className="max-w-2xl">
          <Switch
            checked={notificationsEnabled}
            description="Exemple d’option accessible avec son libellé et sa description."
            label="Recevoir les notifications"
            onCheckedChange={setNotificationsEnabled}
          />
        </div>
      </Card>

      <Card className="space-y-5 p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Notifications d’action</h2>
          <p className="mt-1 text-supporting text-text-secondary">
            Messages temporaires de réussite et d’échec après une action.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => showToast({ kind: "success", title: "Action terminée", description: "La modification a bien été enregistrée." })}>
            Exemple de réussite
          </Button>
          <Button onClick={() => showToast({ kind: "error", title: "Action non effectuée", description: "Une erreur est survenue. Réessayez." })} variant="secondary">
            Exemple d’échec
          </Button>
        </div>
      </Card>
    </main>
  );
}
