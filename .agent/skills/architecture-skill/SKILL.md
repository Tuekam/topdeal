---
name: architecture
description: Architecture logicielle de TopDeal — monorepo pnpm, apps/web Next.js, packages/core, packages/ui et packages/features, séparation Domain/Data/Presentation, ports et adaptateurs, Awilix et Composition Root, Route Handlers, PostgreSQL/Prisma, Firebase Auth, MinIO, frontières inter-modules, sécurité, performance, SOLID, DRY, KISS, YAGNI et design patterns. 
---

# Architecture Skill — TopDeal

## 1. Objectif

Ce skill définit les règles d'organisation architecturale du projet TopDeal.

Son objectif est de garantir une architecture :

- Modulaire et organisée par fonctionnalité.
- Atomique et fondée sur des responsabilités précises.
- Faiblement couplée aux technologies.
- Facile à comprendre, tester et maintenir.
- Évolutive sans sur-ingénierie.

L'architecture doit répondre aux besoins réels du projet.

Ne cherche jamais à appliquer une architecture théorique au détriment de la simplicité.

## 2. Principes fondamentaux

### 2.1. Une responsabilité par fichier

Chaque fichier doit avoir une responsabilité clairement identifiable.

Exemples :

- Un Use Case représente une opération métier.
- Un Repository représente une responsabilité d'accès aux données.
- Un Service encapsule une intégration technique.
- Un modèle représente une structure de données.
- Un Hook encapsule une logique réutilisable de présentation.
- Un composant représente une responsabilité visuelle.

Évite de regrouper plusieurs opérations indépendantes dans une même classe.

L'atomicité ne signifie cependant pas qu'il faut créer un fichier pour chaque petite fonction.

Un fichier peut contenir plusieurs éléments étroitement liés lorsqu'ils ne justifient pas une séparation indépendante.

### 2.2. Séparation des contrats et implémentations

Les contrats doivent être séparés de leurs implémentations.

Les interfaces définissent ce dont une couche a besoin.

Les classes concrètes réalisent ces contrats.

Exemple :

Contrat :

`CreateTaskRepository.ts`

Implémentation :

`TaskCreateRepositoryImpl.ts`

Use Case :

`CreateTaskUseCase.ts`

Implémentation :

`CreateTaskUseCaseImpl.ts`

Ne mélange jamais les responsabilités de définition et d'implémentation lorsque leur séparation est nécessaire à la frontière architecturale.

## 3. Organisation générale

TopDeal utilise une architecture Feature-First.

Structure de référence :

```text
packages/
│
├── core/
│   ├── models/
│   ├── usecases/
│   └── repositories/
│
├── features/
│   └── auth/
│       │
│       ├── core/
│       │   ├── models/
│       │   ├── usecases/
│       │   └── repositories/
│       │
│       ├── domain/
│       │   └── usecases/
│       │
│       ├── data/
│       │   ├── repositories/
│       │   └── services/
│       │
│       └── presentation/
│           ├── screens/
│           ├── components/
│           ├── hooks/
│           ├── styles/
│           └── types/
│
└── ui/
```

Cette structure représente les responsabilités disponibles.

Elle n'impose pas de créer tous les dossiers systématiquement.

Un dossier ne doit exister que lorsqu'il contient des éléments nécessaires.

## 4. Core

Core définit les contrats et les modèles.

Il existe deux niveaux de Core.

### 4.1. Core global

Emplacement :

`packages/core/`

Il contient exclusivement les éléments réellement partagés entre plusieurs fonctionnalités.

Dossiers autorisés :

- `models/`
- `usecases/`
- `repositories/`

Responsabilités :

**models/**

Contient les modèles communs.

**usecases/**

Contient les contrats de Use Cases réellement partagés.

**repositories/**

Contient les contrats de repositories réellement partagés.

Ne place pas un élément dans le Core global simplement pour le rendre accessible à plusieurs fichiers.

### 4.2. Core d'une fonctionnalité

Emplacement :

`packages/features/<feature>/core/`

Il contient les contrats et modèles spécifiques à la fonctionnalité.

Exemple :

`packages/features/auth/core/`

Une interface exclusivement utilisée par Auth doit rester dans le Core d'Auth.

Même principe pour les modèles spécifiques.

Dossiers autorisés :

- `models/`
- `usecases/`
- `repositories/`

### 4.3. Types et modèles

Les types importants et réutilisables doivent être définis dans des fichiers dédiés.

Ne disperse pas les définitions de types dans les implémentations.

Ne duplique pas un modèle déjà existant.

Ne fais jamais remonter directement les types techniques d'un fournisseur dans les contrats métier.

## 5. Domain

Emplacement :

`packages/features/<feature>/domain/`

Domain contient uniquement :

`usecases/`

Il implémente les contrats de Use Cases définis dans Core.

Chaque Use Case doit représenter une opération métier indépendante.

Exemple :

```text
domain/
└── usecases/
    ├── login/
    │   └── LoginUseCaseImpl.ts
    │
    ├── register/
    │   └── RegisterUseCaseImpl.ts
    │
    ├── logout/
    │   └── LogoutUseCaseImpl.ts
    │
    └── verify-session/
        └── VerifySessionUseCaseImpl.ts
```

Exemple d'implémentation :

```typescript
export class CreateTaskUseCaseImpl
  implements CreateTaskUseCase {

  constructor(
    private readonly repository: CreateTaskRepository
  ) {}

  async execute(input: CreateTaskInput) {
    return this.repository.create(input);
  }
}
```

Les exemples doivent être adaptés aux contrats réels du projet.

### Règles

Un Use Case ne doit pas regrouper plusieurs opérations métier indépendantes.

Domain ne doit pas dépendre :

- De Prisma.
- De Firebase SDK.
- De Next.js.
- De React.
- D'Awilix.
- Des implémentations concrètes de Data.

Domain dépend des contrats, pas des technologies.

## 6. Data

Emplacement :

`packages/features/<feature>/data/`

Data contient exclusivement :

- `repositories/`
- `services/`

### 6.1. Repositories

Les repositories implémentent les contrats définis dans Core.

Exemple :

```typescript
export class TaskCreateRepositoryImpl
  implements CreateTaskRepository {

  constructor(
    private readonly service: TaskService
  ) {}

  async create(input: CreateTaskInput) {
    return this.service.create(input);
  }
}
```

Un repository doit avoir une responsabilité clairement identifiée.

Ne crée pas un repository universel qui regroupe toutes les opérations sans justification.

### 6.2. Services

Les services encapsulent les intégrations techniques.

Exemples :

- Firebase Auth.
- Prisma.
- MinIO.
- Services externes.

Un service ne doit pas devenir un emplacement fourre-tout contenant toutes les opérations d'une fonctionnalité.

Les services ne doivent pas contenir les règles métier principales.

### 6.3. Règles Data

- Ne fais pas dépendre Domain de Data.
- Ne fais pas remonter les types Prisma dans Domain.
- Ne place pas les implémentations de repositories dans Domain.
- Ne crée pas automatiquement des dossiers supplémentaires.
- Ne duplique pas les intégrations techniques.

## 7. Presentation

Chaque fonctionnalité possède sa propre couche Presentation.

Structure :

```text
presentation/
│
├── screens/
├── components/
├── hooks/
├── styles/
└── types/
```

### 7.1. Screens

Contient les écrans complets de la fonctionnalité.

Un écran assemble les composants nécessaires à une interface.

Il ne doit pas contenir les implémentations des opérations métier.

### 7.2. Components

Contient les composants spécifiques à la fonctionnalité.

Un composant propre à Auth reste dans Auth.

Un composant générique et réellement réutilisable peut être placé dans `packages/ui`.

Ne confonds pas composant métier et composant de design system.

### 7.3. Hooks

Contient les hooks de présentation.

Un hook doit encapsuler une logique de présentation ou d'interaction réutilisable.

Ne transforme pas les hooks en emplacement pour les règles métier ou les accès directs à la base de données.

### 7.4. Styles

Contient les styles propres à la fonctionnalité.

La présentation visuelle doit rester séparée des responsabilités métier et des accès aux données.

Ne mélange pas artificiellement les définitions de styles avec les modèles et contrats métier.

Respecte les conventions de styling déjà adoptées dans le projet.

### 7.5. Types

Contient les types propres à la présentation.

Les modèles métier doivent rester dans Core.

Les types techniques propres à l'interface ne doivent pas polluer le Core.

## 8. Gestion centralisée des erreurs

Les erreurs réutilisables doivent être définies dans un catalogue centralisé adapté à leur périmètre.

Exemple :

```typescript
export const AUTH_ERRORS = {
  USER_NOT_FOUND: {
    code: "AUTH_USER_NOT_FOUND",
    message: "Utilisateur introuvable",
  },
} as const;
```

Utilisation :

```typescript
throw new AppError(AUTH_ERRORS.USER_NOT_FOUND);
```

Cet exemple suppose l'existence d'un modèle d'erreur commun adapté.

Règles :

- Ne répète pas les messages d'erreur.
- Utilise des codes stables.
- Centralise les messages modifiables.
- Préserve les informations techniques utiles au diagnostic.
- Ne révèle pas les détails internes au client.
- Distingue erreurs métier et erreurs techniques.

Ne crée pas plusieurs systèmes de gestion des erreurs concurrents.

Une erreur spécifique à une fonctionnalité doit rester dans son périmètre lorsqu'elle n'est pas partagée.

## 9. Flux des dépendances

Les dépendances doivent respecter les responsabilités des couches.

Flux logique :

```text
Presentation
     |
     v
   Domain
     |
     v
    Core
```

Data implémente les contrats définis dans Core.

Le Composition Root assemble les implémentations concrètes.

```text
          Composition Root
                 |
          +------+------+
          |             |
          v             v
        Domain         Data
          |             |
          +------Core---+
```

Domain ne doit jamais importer une implémentation concrète de Data.

Data peut dépendre des contrats de Core.

Presentation doit déclencher les opérations métier à travers les mécanismes d'intégration prévus.

## 10. Injection des dépendances

TopDeal utilise Awilix.

Awilix doit rester dans le Composition Root de `apps/web`.

Règles :

- Les dépendances sont injectées explicitement.
- Les Use Cases ne connaissent pas le conteneur.
- Les repositories ne récupèrent pas leurs dépendances depuis un conteneur global.
- Évite les dépendances cachées.
- N'introduis pas un second système d'injection.

Le Composition Root assemble les implémentations et leurs dépendances.

## 11. Règles anti-sur-ingénierie

L'architecture doit rester proportionnée aux besoins.

Interdictions par défaut :

- Pas d'interface sans frontière ou besoin réel.
- Pas de repository générique universel sans justification.
- Pas de Factory sans complexité de création réelle.
- Pas de Strategy sans plusieurs comportements réels.
- Pas de Manager ou Helper fourre-tout.
- Pas de couche supplémentaire pour simplement déplacer du code.
- Pas de dossier vide.
- Pas de duplication de mécanismes existants.
- Pas de création de fichiers uniquement pour satisfaire une convention théorique.

Avant chaque abstraction, vérifie qu'elle simplifie réellement le code.

## 12. Méthode de refonte

Lorsqu'une fonctionnalité existante doit être refondue :

1. Examiner l'ensemble de son implémentation.
2. Identifier les responsabilités actuelles.
3. Identifier les dépendances et les contrats existants.
4. Repérer les responsabilités mélangées.
5. Identifier les types dispersés ou dupliqués.
6. Identifier les erreurs non centralisées.
7. Identifier les violations des frontières architecturales.
8. Proposer une structure cible.
9. Présenter le plan de refonte avant une modification importante.
10. Refactoriser progressivement en préservant le comportement fonctionnel.

Ne commence jamais par déplacer aveuglément les fichiers.

Ne réécris pas les règles métier sans validation.

Ne supprime pas une fonctionnalité existante sans justification.

## 13. Vérification architecturale

Avant de considérer une fonctionnalité comme terminée, vérifier :

- Chaque fichier possède une responsabilité identifiable.
- Les contrats sont séparés de leurs implémentations.
- Les Use Cases sont atomiques.
- Les repositories sont correctement implémentés.
- Core ne contient que les contrats et modèles correspondant à son périmètre.
- Domain ne contient que les Use Cases.
- Data ne contient que repositories et services.
- Presentation sépare écrans, composants, hooks, styles et types.
- Les erreurs réutilisables sont centralisées.
- Les dépendances respectent les frontières.
- Aucun SDK technique ne pollue Domain.
- Aucune abstraction inutile n'a été introduite.
- Les comportements fonctionnels existants sont préservés.

## 14. Règle finale

En cas de doute entre une solution simple et une solution plus abstraite, privilégie la solution simple si elle respecte les responsabilités, les contrats et les besoins réels.

**Une bonne architecture n'est pas celle qui possède le plus de couches ou de fichiers. C'est celle dans laquelle chaque élément a une responsabilité claire et où les dépendances restent maîtrisées.**