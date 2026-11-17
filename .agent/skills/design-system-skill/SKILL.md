---
name: design-system
description: Conçoit, implémente, audite et fait évoluer le Design System de TopDeal. À utiliser pour les tokens visuels, composants React, layouts, responsive, accessibilité, cohérence avec les maquettes et intégration dans packages/ui.
---

# Design System Skill — TopDeal

## 1. Objectif

Ce skill définit les règles d'organisation et d'implémentation de la couche visuelle de TopDeal.

Il garantit :

- Une séparation claire entre interface et logique métier.
- Une organisation cohérente des écrans et composants.
- Un design system global réutilisable.
- Des styles séparés de la logique applicative.
- Une présentation homogène entre les fonctionnalités.
- Une interface maintenable et évolutive.

Le design system doit simplifier la construction des interfaces, sans imposer une abstraction inutile à chaque élément visuel.

## 2. Organisation de la présentation

Chaque fonctionnalité possède sa propre couche Presentation.

Structure de référence :

```text
presentation/
│
├── screens/
│
├── components/
│
├── hooks/
│
├── styles/
│
└── types/
```

Chaque dossier possède une responsabilité distincte.

Ne mélange pas arbitrairement les écrans, composants, hooks, styles et types.

Ne crée pas de dossiers vides pour respecter artificiellement cette structure.

## 3. Design system global

Emplacement :

`packages/ui/`

Ce package contient les composants visuels génériques réutilisables entre plusieurs fonctionnalités.

Exemples :

- Button.
- Input.
- Textarea.
- Select.
- Checkbox.
- Modal.
- Dialog.
- Card.
- Typography.
- Loader.
- Avatar.

Un composant appartient au design system lorsqu'il représente un élément d'interface générique, indépendant des règles métier d'une fonctionnalité.

### Règles

Les composants de `packages/ui` ne doivent pas connaître :

- Firebase.
- Prisma.
- Les repositories.
- Les Use Cases.
- Les règles métier d'Auth, Annonce, Commande ou Paiement.

Ils doivent se concentrer sur leur responsabilité visuelle et leurs interactions génériques.

Ne déplace pas automatiquement un composant dans `packages/ui` simplement parce qu'il est utilisé plusieurs fois dans une fonctionnalité.

## 4. Composants spécifiques aux fonctionnalités

Emplacement :

`packages/features/<feature>/presentation/components/`

Les composants propres à une fonctionnalité restent dans cette fonctionnalité.

Exemples pour Auth :

```text
auth/
└── presentation/
    └── components/
        ├── LoginForm.tsx
        ├── RegisterForm.tsx
        └── PasswordField.tsx
```

Ces composants peuvent utiliser les éléments génériques de `packages/ui`.

Exemple :

Un `LoginForm` peut assembler :

- Un composant Input.
- Un composant Button.
- Un composant Checkbox.

Le formulaire reste spécifique à Auth.

### Règle de réutilisation

Avant de déplacer un composant dans `packages/ui`, vérifie :

1. S'il possède une responsabilité véritablement générique.
2. S'il est indépendant du métier d'une fonctionnalité.
3. Si son API peut être utilisée sans connaître les règles métier de son origine.

Ne transforme pas les composants métier en composants génériques artificiellement.

## 5. Screens

Emplacement :

`presentation/screens/`

Les screens représentent les écrans complets d'une fonctionnalité.

Exemples :

- LoginScreen.
- RegisterScreen.
- ForgotPasswordScreen.
- ResetPasswordScreen.

Un screen est responsable de l'assemblage de l'interface d'un écran.

Il peut :

- Assembler les composants.
- Déclencher les interactions de présentation.
- Utiliser les hooks nécessaires.
- Gérer les états propres à l'écran.

Il ne doit pas :

- Communiquer directement avec Firebase.
- Appeler Prisma.
- Implémenter les repositories.
- Contenir les règles métier principales.
- Regrouper toute la logique applicative dans un composant volumineux.

Un écran doit rester lisible et se concentrer sur son rôle de composition.

## 6. Components

Emplacement :

`presentation/components/`

Les composants regroupent les éléments visuels propres à une fonctionnalité.

Ils peuvent :

- Afficher des informations.
- Recevoir des propriétés.
- Émettre des événements.
- Gérer un état local d'interface.
- Utiliser les composants du design system.

Ils ne doivent pas devenir des emplacements pour les opérations métier ou les accès techniques.

Évite les composants qui regroupent plusieurs responsabilités indépendantes.

Ne crée pas systématiquement un composant pour chaque élément JSX.

La séparation doit améliorer réellement la lisibilité ou la réutilisation.

## 7. Hooks

Emplacement :

`presentation/hooks/`

Les hooks encapsulent la logique de présentation réutilisable.

Exemples :

- `useLogin.ts`
- `useRegister.ts`
- `useAuthSession.ts`

Ils peuvent gérer :

- Les états de chargement.
- Les états d'interface.
- Les interactions utilisateur.
- L'orchestration des appels aux mécanismes applicatifs.
- Les états d'erreur destinés à la présentation.

Un hook ne doit pas :

- Accéder directement à Prisma.
- Importer un SDK Firebase pour contourner les couches prévues.
- Implémenter les règles métier.
- Devenir un conteneur de toutes les opérations d'une fonctionnalité.

Ne crée pas un hook simplement pour déplacer quelques lignes sans améliorer l'organisation.

## 8. Styles

Emplacement :

`presentation/styles/`

Les styles propres aux fonctionnalités doivent être séparés des autres responsabilités.

Exemples :

```text
presentation/
├── screens/
│   └── LoginScreen.tsx
│
├── components/
│   └── LoginForm.tsx
│
└── styles/
    ├── LoginScreen.styles.ts
    └── LoginForm.styles.ts
```

### Règles

- Ne mélange pas les définitions de styles avec les contrats métier.
- Ne place pas les styles dans les fichiers de modèles.
- Respecte la technologie de styling déjà utilisée.
- Évite de dupliquer les mêmes valeurs visuelles.
- Utilise les tokens du design system lorsqu'ils existent.
- Ne crée pas un système de thèmes supplémentaire sans besoin réel.

Pour Tailwind CSS, conserve les conventions et mécanismes déjà établis dans le projet.

N'introduis pas un second système de styling pour résoudre un problème déjà couvert par Tailwind.

## 9. Types de présentation

Emplacement :

`presentation/types/`

Ce dossier contient uniquement les types nécessaires à la présentation.

Exemples :

- LoginFormValues.
- RegisterFormValues.
- PasswordFieldProps.

Les types métier restent dans Core.

Les types techniques des fournisseurs restent dans les couches techniques concernées.

Ne duplique pas un modèle métier dans Presentation simplement pour faciliter son utilisation.

Ne crée pas systématiquement un fichier de types pour chaque composant.

## 10. Gestion des états visuels

Les états d'interface doivent être clairement identifiés.

Exemples :

- Loading.
- Success.
- Error.
- Empty.
- Disabled.

Les composants doivent afficher les états correspondant aux résultats des opérations applicatives.

La présentation ne doit pas inventer une réussite lorsque l'opération métier a échoué.

Les messages affichés doivent être cohérents avec le système centralisé de gestion des erreurs.

Ne transforme pas les erreurs techniques internes en messages directement visibles pour l'utilisateur.

## 11. Formulaires

Les formulaires doivent séparer :

- Les champs et leur présentation.
- La gestion des valeurs.
- La validation des données.
- Le déclenchement des opérations métier.

Les règles de validation métier ne doivent pas être exclusivement définies dans les composants visuels.

Les validations de présentation peuvent fournir un retour immédiat à l'utilisateur.

Les validations de sécurité et d'intégrité doivent également être réalisées aux frontières serveur appropriées.

Ne duplique pas inutilement les règles de validation entre plusieurs composants.

## 12. Responsive design et accessibilité

Les interfaces doivent fonctionner sur les formats d'écran ciblés par le projet.

Respecte :

- Les conventions responsive existantes.
- Les états de focus.
- Les interactions au clavier.
- Les libellés accessibles.
- Les contrastes suffisants.
- Les retours visuels des interactions.
- Les dimensions adaptées aux différentes interfaces.

Ne sacrifie pas l'accessibilité pour reproduire uniquement une maquette.

## 13. Organisation et composition des composants

Privilégie la composition plutôt que les composants excessivement configurables.

Un composant doit exposer uniquement les propriétés nécessaires à son rôle.

Évite :

- Les composants universels contenant de nombreuses conditions.
- Les propriétés inutilisées.
- Les composants avec trop de responsabilités.
- Les composants qui connaissent plusieurs fonctionnalités métier.
- Les abstractions visuelles prématurées.

Si deux composants sont réellement différents, ne les force pas à partager une abstraction artificielle.

## 14. Anti-sur-ingénierie

Ne crée pas automatiquement :

- Un composant pour chaque élément HTML.
- Un hook pour chaque fonction.
- Un fichier de styles pour chaque petite expression.
- Un système de thèmes parallèle.
- Un composant universel pour toutes les interfaces.
- Une bibliothèque de composants redondante avec `packages/ui`.

Réutilise les composants existants avant d'en créer de nouveaux.

Privilégie une interface simple, lisible et cohérente.

## 15. Méthode de modification

Avant de modifier une interface :

1. Examiner les composants existants.
2. Identifier les éléments déjà disponibles dans `packages/ui`.
3. Identifier les composants spécifiques à la fonctionnalité.
4. Identifier les hooks et styles concernés.
5. Vérifier les types existants.
6. Respecter les conventions visuelles du projet.
7. Modifier uniquement les éléments nécessaires.

Après modification :

- Vérifier les interactions.
- Vérifier les états de chargement et d'erreur.
- Vérifier le responsive design.
- Vérifier l'accessibilité.
- Vérifier les imports.
- Vérifier l'absence de dépendances techniques interdites.

## 16. Vérification finale

Avant de terminer, vérifier :

- Les screens sont dans `presentation/screens`.
- Les composants spécifiques sont dans `presentation/components`.
- Les composants génériques sont dans `packages/ui`.
- Les hooks sont dans `presentation/hooks`.
- Les styles sont dans `presentation/styles`.
- Les types de présentation sont dans `presentation/types`.
- Les règles métier ne sont pas implémentées dans les composants.
- Les SDK techniques ne sont pas importés directement dans les écrans.
- Les composants restent suffisamment petits et compréhensibles.
- Les éléments existants sont réutilisés lorsqu'ils répondent déjà au besoin.
- Aucune abstraction visuelle inutile n'a été introduite.

## Règle finale

La présentation doit être indépendante des détails techniques et des règles métier.

**Un composant doit présenter, un hook doit orchestrer la présentation, un screen doit assembler l'écran et le design system doit fournir les éléments visuels génériques.**