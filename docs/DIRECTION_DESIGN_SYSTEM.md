# Direction du Design System TopDeal

Dernière mise à jour : 14 novembre 2026  
Statut : relevé initial des maquettes. Le suivi courant est dans [MEMOIRE1.md](../MEMOIRE1.md).

## Objectif de ce document

Ce fichier conserve la direction visuelle, les décisions connues, les questions ouvertes et le point d’arrêt du travail afin qu’un autre agent puisse continuer sans repartir de zéro ni transformer une proposition en décision validée.

Mettre ce document à jour après chaque changement apporté au projet : résumer le changement, les fichiers concernés, les vérifications faites, les décisions prises et les points encore ouverts.

## Sources à consulter avant de continuer

Lire les instructions et références du dépôt avant toute modification :

- `AGENTS.md`
- `.agent/skills/design-system-skill/SKILL.md` et `references/design-system-reference.md`
- `.agent/skills/architecture-skill/SKILL.md` et sa référence
- `.agent/skills/nomenclature-skill/SKILL.md` et sa référence
- `.agent/skills/evolutivite-skill/SKILL.md` et sa référence
- `.agent/skills/performance-skill/SKILL.md` et sa référence
- `.agent/skills/securite-skill/SKILL.md` et sa référence

Consulter aussi les documents fonctionnels et métier de `docs/` lorsqu’un écran implique un parcours ou une règle métier. Les composants de `packages/ui` restent génériques : ils ne portent pas les règles métier des fonctionnalités.

## Direction visuelle retenue comme référence de travail

Les maquettes communiquées par le propriétaire montrent une interface de marketplace française, claire, sobre et chaleureuse :

- fond de page `#FAF9F7`, surfaces blanches et tuiles d’image beige ;
- texte brun foncé, texte secondaire brun/gris ;
- orange `#B8531A` utilisé pour les actions principales, pas comme décoration omniprésente ;
- police Schibsted Grotesk, graisses 400, 500, 600 et 700, avec une police de repli ;
- bordures fines, cartes et champs lisibles, sans ombre dans le thème clair ;
- navigation de marketplace avec la localisation Bafoussam, la recherche, les entrées de navigation et l’action « Vendre » ;
- contenu desktop centré autour de 1200 px, avec une marge de contenu généralement de 24 px.

Valeurs documentées dans la référence Design System, à utiliser comme base tant qu’une décision ou une maquette validée ne les contredit pas :

| Rôle | Valeur de référence |
|---|---|
| Page | `#FAF9F7` |
| Surface | `#FFFFFF` |
| Tuile d’image | `#F1EDE8` |
| Bordure | `#E7E3DD` |
| Bordure de champ | `#D9D3CB` |
| Texte principal | `#2B221D` |
| Texte secondaire | `#6B6159` |
| Accent d’action | `#B8531A` |
| Erreur de champ | `#A33D35` |
| En-tête | 76 px |
| Champ standard | 46 px |
| Bouton standard | 44 px |
| Rayon carte/champ/recherche | 12 px |
| Rayon bouton | 10 px |
| Bordure | 1 px |

Cette table est une base de référence, pas une autorisation à écraser sans examen les différences présentes dans les maquettes.

## Maquettes communiquées

Les fichiers suivants ont été fournis depuis le dossier local `Downloads` de l’utilisateur. Ils ne sont pas dans le dépôt et peuvent ne pas être accessibles à un autre agent ou sur une autre machine :

- `TopDeal – Accueil connecté (ordinateur)(1) (1).html`
- `publication annonce phase 2.html`
- `TopDeal_Publication_Annonce_Phase_1_affiliation.html`
- `commandes et ventes.html`
- `mon profil.html`
- `TopDeal_Messagerie_Ecran_2_scroll_corrige.html`
- `TopDeal_Commande_Paiement_Ecran_3.html`
- `TopDeal_Remise_Produit_Ecran_4.html`

La revue initiale confirme une identité commune entre l’accueil, la publication, la messagerie, les commandes/ventes, le profil, le paiement et la remise. Les fichiers HTML sont des références visuelles, pas une architecture à recopier telle quelle : leurs styles sont locaux et répétés.

## Variations à résoudre avant de généraliser

Le propriétaire a validé `#A33D35` comme couleur d’erreur des champs. Cela ne valide pas toute la palette d’états : les couleurs vertes et ambre restent à confirmer avant généralisation.

Les maquettes ne sont pas entièrement normalisées entre elles :

- champs de 44 ou 46 px, boutons de 42 ou 44 px, tailles de texte de base de 14 ou 15 px ;
- rayons parfois légèrement différents ;
- breakpoints spécifiques par écran (notamment 1050/820/560, 900/700/420 et 900/650) ;
- certains écrans imposent encore une largeur minimale desktop, contrairement à la publication qui se réorganise sur petit écran ;
- `commandes et ventes.html` présente des couleurs d’état (vert `#28734D` / fond `#EDF6F0`, ambre `#98601D` / fond `#FBF4E8`, rouge `#A33D35` / fond `#FAEFED`). Seul le rouge `#A33D35` est validé comme couleur d’erreur des champs ; la couleur de fond et les autres états ne sont pas généralisés.

Ne pas sélectionner silencieusement une valeur unique pour ces écarts. Comparer les écrans et, si le choix modifie visiblement le résultat attendu, demander confirmation au propriétaire.

Ne pas inventer les éléments qui restent absents ou à confirmer : palette sombre, autres couleurs d’état, breakpoints globaux, bibliothèque d’icônes, animations précises ou détails responsive propres à chaque écran.

## Règles d’implémentation

- Les tokens et composants visuels partagés appartiennent à `packages/ui`.
- Les tokens sont la source unique des valeurs visuelles ; éviter les valeurs répétées dans les pages.
- Les pages et fonctionnalités composent les composants UI ; elles ne recréent pas localement le Design System.
- Les composants UI reçoivent leurs données et callbacks par props. Ils n’appellent pas d’API, ne résolvent pas Awilix et ne connaissent pas les modèles ou permissions métier.
- Garder les détails propres à une feature dans sa couche `presentation`.
- Respecter l’accessibilité : labels, clavier, focus visible, erreurs associées, contraste à vérifier, zones tactiles d’au moins 44 px et `prefers-reduced-motion`.
- Adapter les tableaux au mobile en cartes lisibles avec chaque valeur associée à son libellé.
- Avancer écran par écran ; ne pas concevoir le suivant avant validation explicite du précédent.

## État du dépôt au point d’arrêt

Au moment du relevé initial, les fichiers suivants existaient mais étaient vides :

- `packages/ui/tokens/colors.ts`
- `packages/ui/tokens/typography.ts`
- `packages/ui/tokens/spacing.ts`
- `packages/ui/tokens/radius.ts`
- `packages/ui/tokens/breakpoints.ts`
- `packages/ui/tokens/shadows.ts`
- `packages/ui/styles/globals.css`
- `packages/ui/styles/themes.css`
- `packages/ui/styles/components.css`
- `packages/ui/index.ts`

Depuis ce relevé initial, les tokens de base ont commencé à être implémentés. Consulter [MEMOIRE1.md](../MEMOIRE1.md) pour l’état vérifié actuel.

## Suivi actuel

Ce relevé documente le cadrage initial des maquettes. Les tokens de base ont depuis été implémentés. Consulter [MEMOIRE1.md](../MEMOIRE1.md) pour le plan, l’état vérifié, les validations et la prochaine étape.

## Journal des changements

### 14 novembre 2026 — cadrage initial

- Consulté les instructions du projet, les skills Design System, architecture, nomenclature, évolutivité, performance et sécurité, ainsi que les documents fonctionnels pertinents.
- Parcouru les maquettes fournies pour identifier l’identité visuelle commune et les écarts.
- Vérifié que les principaux fichiers de tokens et styles de `packages/ui` sont vides.
- Aucun code UI ni token modifié pendant cette revue initiale ; les écarts et décisions ouvertes ont été consignés.

### 14 novembre 2026 — première fondation des tokens

- Le suivi courant a été déplacé dans `MEMOIRE1.md`.
- Les tokens de base confirmés et le thème clair ont été ajoutés ; aucune palette d’état ni valeur de breakpoint n’a été inventée.
- Les vérifications de cette étape sont consignées dans `MEMOIRE1.md`.
