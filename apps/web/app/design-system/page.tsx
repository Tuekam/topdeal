import { Button, Card, colors, Input } from "@topdeal/ui";

const colorTokens = [
  ["Page", colors.page],
  ["Surface", colors.surface],
  ["Tuile d’image", colors.imageTile],
  ["Bordure", colors.border],
  ["Bordure de champ", colors.inputBorder],
  ["Texte principal", colors.text],
  ["Texte secondaire", colors.textSecondary],
  ["Accent", colors.accent],
  ["Erreur de champ", colors.error],
] as const;

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content flex-col gap-page-gutter px-page-gutter py-page-gutter">
      <header className="space-y-2">
        <p className="text-supporting font-medium uppercase tracking-wide text-text-secondary">
          TopDeal · Référence UI
        </p>
        <h1 className="text-2xl font-semibold">Design System</h1>
        <p className="max-w-2xl text-text-secondary">
          Aperçu des tokens et composants actuellement implémentés. Cette page
          sert à leur vérification visuelle ; ce n’est pas un parcours produit.
        </p>
      </header>

      <Card className="space-y-5 p-page-gutter">
        <div>
          <h2 className="text-lg font-semibold">Palette de base</h2>
          <p className="mt-1 text-supporting text-text-secondary">
            Le rouge d’erreur est validé pour les champs ; les autres couleurs
            d’état et le thème sombre restent à définir.
          </p>
        </div>
        <ul className="flex flex-wrap gap-4">
          {colorTokens.map(([name, value]) => (
            <li className="flex min-w-44 items-center gap-3" key={name}>
              <span
                aria-hidden="true"
                className="size-10 shrink-0 rounded-field border border-border"
                style={{ backgroundColor: value }}
              />
              <span className="min-w-0">
                <span className="block text-label font-medium">{name}</span>
                <code className="block truncate text-supporting text-text-secondary">
                  {value}
                </code>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-5 p-page-gutter">
        <div>
          <h2 className="text-lg font-semibold">Boutons</h2>
          <p className="mt-1 text-supporting text-text-secondary">
            Variantes principale, secondaire et désactivée.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Action principale</Button>
          <Button variant="secondary">Action secondaire</Button>
          <Button disabled>Action désactivée</Button>
        </div>
      </Card>

      <Card className="space-y-5 p-page-gutter">
        <div>
          <h2 className="text-lg font-semibold">Champs</h2>
          <p className="mt-1 text-supporting text-text-secondary">
            Labels visibles, aide associée et exemples d’états.
          </p>
        </div>
        <div className="flex max-w-xl flex-col gap-5">
          <Input
            label="Adresse e-mail"
            name="email-example"
            placeholder="nom@exemple.com"
            type="email"
          />
          <Input
            error="Exemple de message d’erreur associé au champ."
            hint="Exemple de texte d’aide."
            label="Champ avec erreur"
            name="error-example"
          />
          <Input disabled label="Champ désactivé" name="disabled-example" />
        </div>
      </Card>

      <Card className="space-y-3 p-page-gutter">
        <h2 className="text-lg font-semibold">Surface</h2>
        <p className="text-text-secondary">
          Les espacements internes sont appliqués par la composition, car leur
          valeur varie selon les maquettes.
        </p>
      </Card>
    </main>
  );
}
