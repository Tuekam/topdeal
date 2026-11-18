import { Input, Select } from "@topdeal/ui";
import type { AnnonceCategory } from "../../core/models/AnnonceCategory";

export type AnnonceFilterValues = {
  categorieId: string | null;
  etat: "NEUF" | "OCCASION" | null;
  prixMin: string | null;
  prixMax: string | null;
  quartier: string | null;
  trocAccepte: boolean | null;
  visibilite?: "PUBLIEE" | "MASQUEE" | "SUSPENDUE" | null;
};

type AnnonceFilterFieldsProps = {
  categories: AnnonceCategory[];
  filters: AnnonceFilterValues;
  includeVisibility?: boolean;
  onChange(change: Partial<AnnonceFilterValues>): void;
};

const ROOT_ORDER = [
  "Appareils électroniques",
  "Vêtements et mode",
  "Accessoires",
  "Maison et mobilier",
  "Autres",
];

export function getAnnonceCategoryLabel(name: string) {
  return name === "Électronique" ? "Appareils électroniques" : name;
}

export function sortAnnonceRootCategories(categories: AnnonceCategory[]) {
  return [...categories].sort((first, second) => {
    const firstIndex = ROOT_ORDER.indexOf(getAnnonceCategoryLabel(first.name));
    const secondIndex = ROOT_ORDER.indexOf(getAnnonceCategoryLabel(second.name));
    return (firstIndex < 0 ? ROOT_ORDER.length : firstIndex) -
      (secondIndex < 0 ? ROOT_ORDER.length : secondIndex);
  });
}

export function AnnonceFilterFields({
  categories,
  filters,
  includeVisibility = false,
  onChange,
}: AnnonceFilterFieldsProps) {
  const roots = sortAnnonceRootCategories(categories.filter((category) => category.parentId === null));
  const activeCategory = categories.find((category) => category.id === filters.categorieId);
  const rootId = activeCategory?.parentId ?? activeCategory?.id ?? "";
  const childId = activeCategory?.parentId ? activeCategory.id : "";
  const children = categories.filter((category) => category.parentId === rootId);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
      <Select
        fieldClassName="min-w-0"
        label="Catégorie"
        name="categorieParentId"
        onChange={(event) => onChange({ categorieId: event.target.value || null })}
        value={rootId}
      >
        <option value="">Toutes les catégories</option>
        {roots.map((category) => (
          <option key={category.id} value={category.id}>{getAnnonceCategoryLabel(category.name)}</option>
        ))}
      </Select>
      <Select
        fieldClassName="min-w-0"
        label="Sous-catégorie"
        name="sousCategorieId"
        onChange={(event) => onChange({ categorieId: event.target.value || rootId || null })}
        value={childId}
      >
        <option value="">Toutes les sous-catégories</option>
        {children.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </Select>
      <Select
        fieldClassName="min-w-0"
        label="État"
        name="etat"
        onChange={(event) => onChange({ etat: event.target.value === "NEUF" || event.target.value === "OCCASION" ? event.target.value : null })}
        value={filters.etat ?? ""}
      >
        <option value="">Tous les états</option>
        <option value="NEUF">Neuf</option>
        <option value="OCCASION">Occasion</option>
      </Select>
      <Select
        fieldClassName="min-w-0"
        label="Troc"
        name="trocAccepte"
        onChange={(event) => onChange({ trocAccepte: event.target.value === "true" ? true : event.target.value === "false" ? false : null })}
        value={filters.trocAccepte === null ? "" : String(filters.trocAccepte)}
      >
        <option value="">Avec ou sans troc</option>
        <option value="true">Troc accepté</option>
        <option value="false">Troc non accepté</option>
      </Select>
      {includeVisibility && (
        <Select
          fieldClassName="min-w-0"
          label="Statut"
          name="visibilite"
          onChange={(event) => {
            const visibility = event.target.value;
            onChange({
              visibilite: visibility === "PUBLIEE" || visibility === "MASQUEE" || visibility === "SUSPENDUE"
                ? visibility
                : null,
            });
          }}
          value={filters.visibilite ?? ""}
        >
          <option value="">Tous les statuts</option>
          <option value="PUBLIEE">Publiées</option>
          <option value="MASQUEE">Masquées</option>
          <option value="SUSPENDUE">Suspendues</option>
        </Select>
      )}
      <Input
        fieldClassName="min-w-0"
        label="Quartier / secteur"
        maxLength={150}
        name="quartier"
        onChange={(event) => onChange({ quartier: event.target.value || null })}
        value={filters.quartier ?? ""}
      />
      <Input
        fieldClassName="min-w-0"
        label="Prix minimum (FCFA)"
        max="9999999999.99"
        min="0"
        name="prixMin"
        onChange={(event) => onChange({ prixMin: event.target.value || null })}
        step="0.01"
        type="number"
        value={filters.prixMin ?? ""}
      />
      <Input
        fieldClassName="min-w-0"
        label="Prix maximum (FCFA)"
        max="9999999999.99"
        min="0"
        name="prixMax"
        onChange={(event) => onChange({ prixMax: event.target.value || null })}
        step="0.01"
        type="number"
        value={filters.prixMax ?? ""}
      />
    </div>
  );
}
