# Mémoire de travail TopDeal

Dernière mise à jour : 14 novembre 2026  
État : fondation UI vérifiée et direction visuelle de base validée ; prochaine étape : poursuivre les composants utiles avant Auth.

## Rôle de cette mémoire

Ce fichier est la mémoire de continuité du projet pour le propriétaire et les agents qui y travaillent. Il indique l’objectif, les règles, les décisions établies, les points ouverts, l’état réel du dépôt et la prochaine étape.

Après chaque lot de changements au projet, mettre à jour ce fichier avec les fichiers modifiés, les vérifications, les décisions prises et les questions restantes. Ne pas présenter une proposition comme une décision validée.

`docs/DIRECTION_DESIGN_SYSTEM.md` conserve le relevé initial des maquettes ; en cas de différence sur l’avancement actuel, cette mémoire est la source de suivi.

## Objectif courant

Mettre en place le Design System TopDeal dans `packages/ui`, à partir des maquettes fournies et des skills du projet, puis démarrer la fonctionnalité d’authentification. Avancer par étapes courtes et vérifiables ; ne pas construire les écrans d’authentification avant la fondation UI et l’examen des règles d’authentification.

## Règles à suivre

- Lire `AGENTS.md` avant d’intervenir.
- Pour toute modification de code, consulter au minimum les skills architecture, nomenclature et évolutivité.
- Pour le Design System, suivre `.agent/skills/design-system-skill/SKILL.md` et `references/design-system-reference.md`.
- Pour l’authentification, consulter également le skill sécurité et vérifier les règles fonctionnelles et métier applicables.
- Ne pas ajouter de dossier `src`.
- Le Design System vit dans `packages/ui` ; il reste indépendant des fonctionnalités et de l’application Web.
- Les composants UI sont génériques, accessibles, sans accès réseau, métier, DI ou base de données.
- Les valeurs visuelles viennent de tokens partagés. Ne pas inventer les couleurs d’état non validées, les breakpoints, le thème sombre ou les comportements absents des maquettes.
- Travailler écran par écran et faire valider les choix visuels qui changent sensiblement le rendu attendu.
- Le domaine d’une fonctionnalité ne dépend pas de Next.js, React, Awilix, Prisma ou Firebase ; le Composition Root reste dans `apps/web`.

## Direction visuelle de référence

Les maquettes communiquées montrent une marketplace française claire, sobre et chaleureuse : fond `#FAF9F7`, surfaces blanches, tons bruns, tuiles d’image beige et accent orange `#B8531A` réservé aux actions principales. La police cible est Schibsted Grotesk, avec fallback.

Références écrites actuelles : contenu desktop centré autour de 1200 px, marge habituelle de 24 px, en-tête de 76 px, champ standard de 46 px, bouton standard de 44 px, rayons de 12 px pour cartes/champs/recherche, 10 px pour boutons, bordure de 1 px et absence d’ombre dans le thème clair.

Les maquettes diffèrent parfois (dimensions, rayons et responsive). Ces écarts doivent être comparés avant de devenir des règles globales. Le propriétaire a validé le rouge `#A33D35` de « commandes et ventes » pour les erreurs de champ, mais pas les autres couleurs d’état ni son fond `#FAEFED`. Les breakpoints numériques, la palette sombre et la bibliothèque d’icônes restent à confirmer.

Les HTML originaux fournis se trouvent dans le dossier `Downloads` local du propriétaire, pas dans le dépôt. Un autre agent peut ne pas y avoir accès ; les observations et décisions utiles doivent donc rester consignées ici.

## Plan et état d’avancement

| Étape | Travail | État |
|---|---|---|
| 0 | Conserver la mémoire et le plan de continuité dans ce fichier | Terminé |
| 1 | Établir les tokens de base confirmés et les relier au thème Tailwind/UI | Terminé ; token d’erreur de champ validé, autres couleurs d’état exclues |
| 2 | Construire les composants UI fondamentaux nécessaires, avec variantes et états accessibles | Première version de Button, Input et Card avec état d’erreur approuvé |
| 3 | Vérifier les composants dans une page de démonstration aux tailles pertinentes, comparer aux maquettes et faire valider | Vérifiée sur desktop/mobile ; direction de base, texte 14 px et rouge d’erreur approuvés |
| 4 | Examiner le périmètre et les décisions d’authentification, résoudre les ambiguïtés avant le parcours UI | À faire après les fondations UI |
| 5 | Implémenter l’authentification par couches, derrière les contrats nécessaires, avec Firebase isolé dans Data et assemblage dans `apps/web` | À faire après l’étape 4 |
| 6 | Vérifier les cas autorisés/refusés, les erreurs, les tests et les frontières de sécurité | À faire avec l’implémentation Auth |

### Questions à résoudre avant d’élargir les tokens

- Champs et boutons varient en taille entre les maquettes ; les références écrites donnent 46 px et 44 px.
- Les breakpoints des maquettes ne sont pas cohérents et ne sont pas définis comme tokens globaux.
- Les couleurs succès/alerte apparaissent dans certaines maquettes, mais restent à valider ; seul le rouge d’erreur des champs est approuvé.
- Les espacements de formulaire ajoutés aux premiers composants proviennent des motifs récurrents des maquettes ; ils restent ajustables après la comparaison visuelle.

### Questions à résoudre avant le développement Auth

- Les documents décrivent des modes d’inscription différents ou de statut différent (téléphone/mot de passe dans la spécification, e-mail/mot de passe dans le bilan technique, Google également). Reconfirmer le parcours retenu avant d’implémenter.
- Vérifier les décisions de session, d’e-mail vérifié, de téléphone et de permissions avec les règles actuelles, sans propager les types Firebase dans le domaine.
- Le conteneur Awilix n’a pas encore de registrations de fonctionnalités. Ne pas créer de modules DI vides ; choisir son cycle de vie quand les dépendances réelles du premier cas d’usage seront connues.

## État vérifié du dépôt

- `@topdeal/web` dépend d’Awilix `^13.0.5`; l’import et la création d’un conteneur ont été vérifiés.
- Aucun conteneur Awilix ni module d’enregistrement de feature n’est encore créé.
- `packages/ui/tokens/{colors,typography,spacing,radius,shadows,sizes}.ts` exporte les références aux tokens CSS ; `packages/ui/styles/themes.css` porte les valeurs de référence et les mappings Tailwind.
- `packages/ui/tokens/colors.ts` et `packages/ui/styles/themes.css` exposent le token d’erreur `#A33D35`, approuvé pour les erreurs des champs.
- `packages/ui/index.ts` exporte les tokens publics. `packages/ui/tokens/breakpoints.ts` reste vide car les breakpoints globaux ne sont pas décidés.
- `packages/ui` expose maintenant les composants initiaux `Button`, `Input` et `Card`. `components.css` contient leurs styles ; `styles/globals.css` reste vide.
- L’état d’erreur de `Input` utilise le token `colors.error` (`#A33D35`) pour le contour et le message ; le contraste mesuré sur blanc est 6,41:1.
- `@topdeal/ui` déclare React/ReactDOM en peer dependencies et devDependencies, ainsi que les types React en devDependencies, afin de vérifier les composants indépendamment.
- `apps/web/app/globals.css` importe les thèmes UI et applique le fond, la couleur de texte et la famille de police.
- Schibsted Grotesk est chargée par Next.js avec `next/font/google`, avec fallback et `display: swap`.
- `apps/web/app/design-system/page.tsx` présente les tokens, Button, Input et Card. Vérifiée au navigateur sur desktop (1170 px) et mobile (390 px), sans débordement horizontal visible. La page d’accueil reste le placeholder existant.
- La feature présente dans `packages/features` est `annonce`; Auth est à démarrer après le Design System.
- L’audit initial des maquettes est détaillé dans `docs/DIRECTION_DESIGN_SYSTEM.md`.

Mettre à jour cette section après chaque changement significatif au dépôt afin qu’elle reflète les fichiers et le comportement réellement vérifiés.

## Journal de progression

### 14 novembre 2026 — cadrage et début des tokens

- Confirmé l’objectif : Design System d’abord, authentification ensuite, progression pas à pas.
- Consulté les skills et références du Design System, de l’architecture, de la nomenclature, de l’évolutivité, de la performance et de la sécurité.
- Planifié les étapes Design System puis Auth et relevé les ambiguïtés à résoudre.
- Implémenté les tokens documentés dans `packages/ui/tokens/{colors,typography,spacing,radius,shadows,sizes}.ts` et `packages/ui/styles/themes.css`, ainsi que les exports publics et les styles de base du body.
- Mis à jour `docs/DIRECTION_DESIGN_SYSTEM.md` pour le référencer comme relevé initial et pointer vers cette mémoire pour l’avancement courant.
- Vérifications réussies après les dernières modifications : `pnpm.cmd --filter @topdeal/web build`, `pnpm.cmd --filter @topdeal/web lint` et `pnpm.cmd --filter @topdeal/web exec tsc --noEmit --target ES2017 --module ESNext --moduleResolution Bundler --strict ..\\..\\packages\\ui\\index.ts`.
- Prochaine action : construire les premiers composants UI fondamentaux et leurs états accessibles, sans démarrer encore l’écran Auth.

### 14 novembre 2026 — premiers composants UI

- Ajouté `Button` (variantes principale et secondaire, type bouton par défaut, état désactivé), `Input` (label obligatoire, aide, erreur associée, invalidité ARIA) et `Card` (surface générique sans padding imposé).
- Ajouté les styles partagés dans `packages/ui/styles/components.css` et exporté les composants depuis `packages/ui/index.ts`.
- Ajouté des dépendances de développement React/ReactDOM et types React à `@topdeal/ui`, nécessaires au contrôle TypeScript du package.
- Vérifications réussies après ces changements : build web, lint web et vérification TypeScript de l’index public UI avec `--jsx react-jsx`.
- Pas encore de revue visuelle au navigateur ; prochaine action : créer une page de démonstration pour comparer ces composants aux maquettes et les valider avant de poursuivre.

### 14 novembre 2026 — page de démonstration

- Créé `/design-system` pour rendre les tokens et composants UI existants sans commencer un parcours produit.
- Chargé Schibsted Grotesk avec `next/font/google`, `display: swap` et un fallback, afin d’éviter une requête de police depuis le navigateur.
- Vérifié visuellement la page au navigateur à une largeur desktop (1170 px) et mobile (390 px) ; aucun débordement horizontal visible.
- Vérifications réussies après ces changements : build web, lint web et vérification TypeScript de l’index public UI avec `--jsx react-jsx`.
- Le propriétaire valide la direction générale, le texte courant de 14 px et l’usage du rouge de la maquette Commandes/Ventes pour l’état d’erreur des champs.

### 14 novembre 2026 — token d’erreur validé

- Ajouté `colors.error` avec `#A33D35` aux tokens partagés et à leur mapping Tailwind.
- Appliqué le token à la bordure des champs invalides et au message d’erreur associé ; la couleur de fond `#FAEFED` de la maquette n’est pas appliquée au champ.
- Ajouté l’échantillon d’erreur à `/design-system` et distingué les couleurs d’état encore à confirmer dans la documentation.
- Contraste calculé du rouge sur blanc : 6,41:1.
- Vérifications réussies après cette modification : build web, lint web et vérification TypeScript de l’index public UI avec `--jsx react-jsx`.
- Revu la page au navigateur : le token calculé est `#a33d35`, la bordure et le texte d’erreur affichent bien `rgb(163, 61, 53)`. La composition n’a pas changé ; la vérification responsive antérieure reste valide.