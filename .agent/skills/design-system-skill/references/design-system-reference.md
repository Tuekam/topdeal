# Référence Design System TopDeal

## Statut

Cette référence reprend le document « TOPDEAL — Design System | Spécification de référence », version 2.0. Les maquettes originales ne sont pas jointes au texte source ; les détails qui nécessitent leur inspection directe restent donc à vérifier.

## Produit et stack UI

- TopDeal : marketplace.
- Interface : React + TypeScript + Tailwind CSS.
- Package partagé : `packages/ui`.
- Responsive : mobile, tablette et desktop.
- Les écrans assemblent les composants du Design System ; ils ne redéfinissent pas leur apparence.

## Direction visuelle

Sobre, claire et professionnelle. Pas d'effets décoratifs excessifs, pas d'emoji. Français, libellés courts et explicites. Les boutons décrivent l'action réellement exécutée.

## Tokens connus

| Token | Valeur | Usage |
|---|---|---|
| `color.page` | `#FAF9F7` | Fond général |
| `color.surface` | `#FFFFFF` | Cartes, panneaux, champs |
| `color.imageTile` | `#F1EDE8` | Zones d'images |
| `color.border` | `#E7E3DD` | Traits et séparateurs |
| `color.inputBorder` | `#D9D3CB` | Contours des champs |
| `color.text` | `#2B221D` | Texte principal |
| `color.textSecondary` | `#6B6159` | Texte secondaire |
| `color.accent` | `#B8531A` | Actions principales uniquement |

Couleurs d'états et palette sombre : à définir/valider, ne pas inventer.

## Typographie et dimensions

- Schibsted Grotesk ; poids 400, 500, 600, 700 ; fallback obligatoire.
- Chiffres tabulaires pour prix et nombres quand utile.
- Rythme principal : 24 px.
- Marge de contenu : 24 px.
- Largeur maximale : 1200 px.
- Rayons : 12 px cartes/champs/recherche ; 10 px boutons ; 6 px labels ; avatar circulaire.
- En-tête : 76 px.
- Champ standard : 46 px.
- Bouton standard : 44 px.
- Petit bouton : 36 px visuels sur pointeur précis, avec cible tactile adaptée à 44 px minimum.
- Bordures : 1 px.
- Aucune ombre dans la référence claire.
- Breakpoints exacts : non définis.

## Package `packages/ui`

Dossiers de référence :
- `tokens/`: colors, typography, spacing, radius, shadows, breakpoints.
- `components/`: button, input, select, textarea, checkbox, switch, badge, card, modal, table, pagination, alert, toast, tooltip, dropdown, tabs, avatar, breadcrumb, skeleton, spinner, empty-state, icon.
- `layout/`: app-shell, sidebar, topbar, page-header, responsive-container.
- `hooks/`: hooks UI transversaux.
- `styles/`: globals.css, themes.css, components.css.
- `index.ts`: exports publics contrôlés.

Dépendances interdites : features métier, Prisma, Firebase, Awilix, Route Handlers et services applicatifs. Données et callbacks arrivent par props. Pas d'appels réseau ni de décisions métier dans les composants UI.

## Responsive

- Mobile : une colonne si nécessaire ; sidebar en panneau ouvrable avec backdrop ; tableaux transformés en cartes ; champs pleine largeur ; cibles tactiles ≥ 44 px ; safe areas.
- Tablette : réorganisation des colonnes/panneaux ; tableau seulement si lisible.
- Desktop : contenu centré, max 1200 px, composition fidèle aux maquettes.
- Une ligne de tableau devient une carte mobile ; chaque valeur reste associée au libellé de sa colonne.
- Animations courtes et discrètes ; respecter `prefers-reduced-motion`.

## États UX

Chargement initial (skeleton), chargement d'action (loading et prévention double soumission), succès (toast/alert), erreur associée à la zone ou au champ, aucun résultat (EmptyState), désactivé, confirmation destructive.

## Accessibilité

Labels, erreurs associées, clavier, focus visible, gestion du focus des modales, rôles/états accessibles, textes alternatifs, contraste mesuré (objectif WCAG AA), zones tactiles ≥ 44 px.

## Règles produit et contenu

Ne pas inventer :
- « annonces vérifiées » ;
- « remboursement automatique » ;
- « 100 % sécurisé » ;
- confirmation d'un paiement, remboursement ou versement avant confirmation réelle ;
- statistiques ou fonctionnalités non démontrées.

Le bouton masqué/désactivé ne remplace jamais l'autorisation côté serveur.

## Points non définis

- Breakpoints numériques.
- Couleurs success, danger, warning, info.
- Palette sombre complète.
- Bibliothèque d'icônes.
- Détails responsive par écran et colonnes des tableaux mobiles.
- Animations précises.
- Différences éventuelles entre marketplace publique et administration.
- Composition exacte des écrans non vérifiable sans les fichiers de maquettes.

## Contradictions / précautions relevées dans la source

- L'orange est réservé à l'action principale ; l'onglet actif utilise un trait brun.
- La référence claire n'ajoute pas d'ombres.
- Les écrans de paiement doivent refléter le flux manuel réel et ne pas suggérer un retour prestataire inexistant.
- Les écrans de commandes/ventes ne doivent pas afficher un portefeuille ou des retraits utilisateur si la spécification fonctionnelle les exclut ; utiliser le résumé d'historique des versements après validation fonctionnelle.
- Les valeurs harmonisées (par exemple titres 30 px, minimum 12 px pour petits textes) doivent être confrontées aux maquettes avant généralisation.
