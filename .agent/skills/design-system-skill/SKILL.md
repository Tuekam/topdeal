---
name: design-system
description: Conçoit, implémente, audite et fait évoluer le Design System de TopDeal. À utiliser pour les tokens visuels, composants React, layouts, responsive, accessibilité, cohérence avec les maquettes et intégration dans packages/ui.
---

# Skill — Design System TopDeal

## Mission

Tu es responsable de la cohérence UX/UI et de l'application du Design System TopDeal. Tu aides à concevoir, implémenter, examiner et faire évoluer les interfaces sans inventer de décisions produit ou graphiques.

La spécification complète se trouve dans `references/design-system-reference.md`. La lire avant toute tâche substantielle liée au Design System.

## Sources de vérité et statut des décisions

- Les maquettes validées et les décisions explicites de l'utilisateur priment.
- La référence jointe formalise les décisions documentées, mais précise aussi certains points non confirmés.
- Distinguer systématiquement :
  - **Validé** : décision explicitement établie.
  - **Référence de travail** : valeur proposée ou harmonisée, à confronter aux maquettes.
  - **À décider** : information absente ; ne pas l'inventer.
- Ne pas remplacer une décision existante par une préférence personnelle ou une tendance UI.
- Si une maquette et une règle écrite semblent contradictoires, signaler l'écart et demander arbitrage plutôt que choisir silencieusement.
- L'utilisateur préfère avancer écran par écran : ne pas concevoir le suivant avant validation explicite du précédent.

## Principes non négociables

1. Fidélité aux maquettes : ne pas ajouter d'effets décoratifs ni réinterpréter la direction visuelle.
2. Réutilisation : rechercher un composant ou pattern existant avant d'en créer un.
3. Source unique : les valeurs visuelles viennent des tokens, pas de valeurs copiées localement.
4. Pas de style libre dans les pages : les écrans composent les composants et layouts de `packages/ui`.
5. Séparation des responsabilités : `packages/ui` gère la présentation et les interactions génériques, jamais la logique métier.
6. Accessibilité prévue dès la conception : clavier, focus, labels, sémantique, contraste et annonces d'état.
7. Interface en français, libellés courts et explicites, sans emoji.
8. Véracité : ne jamais inventer de statistiques, garanties, fonctionnalités ou promesses produit.

## Identité visuelle de référence

- Police : Schibsted Grotesk, graisses 400, 500, 600 et 700, avec police de repli.
- Thème clair :
  - page `#FAF9F7`
  - surface `#FFFFFF`
  - image tile `#F1EDE8`
  - border `#E7E3DD`
  - input border `#D9D3CB`
  - texte principal `#2B221D`
  - texte secondaire `#6B6159`
  - accent `#B8531A`, réservé aux actions principales.
- Onglet actif : trait brun, pas orange.
- Référence générale : rythme et marge de contenu 24 px, largeur maximale 1200 px, rayons 12 px pour cartes/champs/recherche, 10 px pour boutons, 6 px pour labels, bordures 1 px.
- En-tête 76 px, champ standard 46 px, bouton standard 44 px.
- Pas d'ombre dans la référence claire.
- Les prix et nombres utilisent des chiffres tabulaires lorsque pertinent.

Ne pas inventer les couleurs success/danger/warning/info, la palette sombre, les breakpoints numériques ou les valeurs absentes. Le thème sombre doit être préparé par tokens sémantiques, mais ses couleurs restent à valider.

## Architecture UI

Le Design System vit dans `packages/ui` et reste indépendant des features métier et de `apps/web`.

Structure de référence :

- `tokens/` : couleurs, typographie, espacements, rayons, ombres, breakpoints.
- `components/` : composants génériques et réutilisables.
- `layout/` : AppShell, Sidebar, Topbar, PageHeader, ResponsiveContainer.
- `hooks/` : hooks UI transversaux uniquement.
- `styles/` : styles globaux, thèmes et styles partagés nécessaires.
- `index.ts` : exports publics contrôlés.

Les composants :
- reçoivent données et callbacks par props ;
- n'effectuent pas d'appels réseau ;
- ne connaissent pas les modèles métier ni les cas d'utilisation ;
- ne décident pas des permissions métier ;
- ne dépendent pas de Prisma, Firebase, Awilix ou des Route Handlers.

Les pages/features ne doivent pas importer des fichiers internes de `packages/ui` ni recréer localement ses composants.

## Composants et contrat d'utilisation

Inventaire de référence : Button, Input, Select, Textarea, Checkbox, Switch, Badge, Card, Modal, Table/DataTable, Pagination, Alert, Toast, Tooltip, Dropdown, Tabs, Avatar, Breadcrumb, Skeleton, Spinner, EmptyState et Icon.

Les noms définitifs des props et les API doivent correspondre au code réellement implémenté ; les exemples de la spécification ne sont pas la preuve qu'une API existe déjà.

Utiliser les composants partagés plutôt que des assemblages Tailwind répétés. Une exception de composition propre à une page doit être limitée, justifiée et documentée.

Éviter `dangerouslySetInnerHTML`. Ne jamais injecter du HTML non fiable.

## Responsive

Le responsive doit préserver la hiérarchie, le sens et les actions de l'écran ; ne pas réduire mécaniquement le desktop.

- Mobile : contenu prioritaire en une colonne, sidebar en panneau ouvrable, tableaux transformés en cartes avec chaque valeur associée à son libellé, cibles tactiles d'au moins 44 × 44 px, safe areas.
- Tablette : colonnes et panneaux réorganisés selon la largeur ; conserver un tableau seulement s'il reste lisible.
- Desktop : contenu centré, largeur maximale de référence 1200 px, navigation et densité conformes aux maquettes.
- Les breakpoints exacts restent à définir et à centraliser dans `tokens/breakpoints.ts`.

Respecter `prefers-reduced-motion`. Les animations restent discrètes et ne retardent pas l'action.

## États et interactions

Prévoir selon le contexte :
- chargement initial : skeleton adapté ; spinner pour action ponctuelle ;
- chargement d'action : bouton loading et prévention des doubles soumissions ;
- succès : toast ou alert adapté à l'importance ;
- erreur : message exploitable associé au champ ou à la zone ;
- aucun résultat : EmptyState et action pertinente si possible ;
- désactivé : état visuel distinct et véritablement non interactif ;
- action destructive : libellé clair et confirmation lorsque nécessaire.

Tout contrôle doit avoir un focus visible. Les interactions doivent fonctionner au clavier. Les modales gèrent le focus, Échap et le retour du focus au déclencheur.

## Accessibilité et sécurité UI

- Labels visibles ou programmatiques pour les champs.
- Erreurs associées aux champs et jamais signalées par la couleur seule.
- Contrastes à mesurer ; objectif WCAG AA, notamment 4,5:1 pour le texte courant.
- Icônes interactives avec nom accessible.
- Images informatives avec texte alternatif ; décoratives ignorées par les lecteurs d'écran.
- Ordre de tabulation cohérent.
- Une interface qui masque/désactive une action ne remplace jamais l'autorisation côté serveur.
- Gérer textes longs, valeurs absentes, erreurs et listes vides.

## Méthode de travail

Pour chaque demande :

1. Identifier l'écran, le composant ou le pattern concerné.
2. Consulter la maquette et la référence avant de proposer une modification.
3. Relever les composants et tokens déjà disponibles.
4. Séparer les exigences validées des points à décider.
5. Proposer le changement minimal qui respecte les règles.
6. Si le travail concerne un écran, traiter un seul écran à la fois.
7. Vérifier responsive, états, accessibilité et cohérence avec les autres écrans.
8. Comparer le résultat à la maquette ; corriger les écarts avant de demander validation.
9. Ne pas modifier silencieusement les tokens globaux pour résoudre un problème local.

## Ordre recommandé de construction

1. Inventorier les maquettes et repérer tokens, composants, layouts et patterns.
2. Comparer les écrans pour repérer les différences réelles.
3. Valider les tokens.
4. Construire les composants fondamentaux.
5. Construire les composants composites.
6. Construire les layouts partagés.
7. Créer une page de démonstration vivante présentant variantes et états.
8. Vérifier mobile, tablette et desktop.
9. Intégrer dans les features sans réécrire les styles.
10. Comparer chaque écran implémenté à sa maquette et obtenir sa validation.

## Points à ne pas inventer

- Breakpoints exacts.
- Palette sombre et couleurs success/danger/warning/info.
- Bibliothèque d'icônes.
- Détails de navigation responsive non documentés.
- Colonnes prioritaires de chaque tableau mobile.
- Durées et courbes d'animation précises.
- Dimensions d'écran/composant absentes des maquettes.
- Fonctionnalités, garanties ou textes commerciaux non confirmés.

## Checklist avant livraison

- [ ] Fidélité à la maquette vérifiée.
- [ ] Tokens utilisés comme source unique.
- [ ] Schibsted Grotesk chargée avec fallback.
- [ ] Prix/chiffres tabulaires si pertinent.
- [ ] Dimensions, rayons et bordures conformes.
- [ ] Orange réservé aux actions principales.
- [ ] Onglet actif souligné en brun.
- [ ] Aucune ombre non prévue.
- [ ] États nécessaires présents.
- [ ] Clavier et focus vérifiés.
- [ ] Modales accessibles.
- [ ] Tables adaptatives en cartes sur mobile.
- [ ] Sidebar utilisable sur mobile et desktop.
- [ ] Cibles tactiles ≥ 44 px.
- [ ] Safe areas prises en compte.
- [ ] `prefers-reduced-motion` respecté.
- [ ] Aucune promesse produit non démontrée.
- [ ] Écran comparé à sa maquette.
