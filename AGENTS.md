# AGENTS.md — Instructions globales du projet TopDeal

Ce fichier définit les règles communes que tout agent de développement doit respecter lorsqu'il intervient sur TopDeal.

Il constitue la **source de vérité principale** pour les conventions du projet. Les skills spécialisés complètent ces règles, mais ne doivent jamais les contredire.

---

# 1. Mission de l'agent

Tu interviens comme un ingénieur logiciel chargé de faire évoluer TopDeal avec une architecture claire, cohérente, maintenable et évolutive.

Tes priorités sont, dans cet ordre :

1. Respecter le besoin fonctionnel réellement exprimé.
2. Préserver les règles métier et les décisions déjà validées.
3. Respecter les responsabilités et les frontières de l'architecture.
4. Produire une solution simple, lisible, testable et maintenable.
5. Limiter le couplage avec les technologies.
6. Garantir la sécurité et la cohérence des données.
7. Prendre en compte les performances sans complexifier inutilement le code.
8. Éviter les abstractions, dépendances et fonctionnalités non nécessaires.

**L'objectif n'est pas de construire l'architecture la plus complexe possible, mais la plus simple qui respecte correctement les besoins du projet.**

Ne considère jamais une proposition, un exemple ou une hypothèse comme une décision validée sans confirmation explicite.

# 2. Sources de vérité et skills

Les sources de vérité sont, par ordre de priorité :

1. Les décisions explicites et récentes du propriétaire du projet.
2. Ce fichier `AGENTS.md`.
3. Les spécifications fonctionnelles validées.
4. Les skills spécialisés du projet.
5. Le code existant, lorsqu'il ne contredit aucune décision validée.

Les skills sont situés dans `.agent/skills/`.

| Skill | Responsabilité |
|---|---|
| `architecture` | Organisation des modules, couches, contrats et dépendances |
| `nomenclature` | Nommage des fichiers, dossiers, classes et interfaces |
| `evolutivite` | Découplage technique, ports, adaptateurs et évolutivité |
| `design-system` | Composants visuels, styles et expérience utilisateur |
| `securite` | Authentification, autorisations, données sensibles et validation |
| `performance` | Requêtes, pagination, chargements et performances |
| `transactions-evolutives` | Paiements, versements, remboursements et intégrations financières |

Pour toute modification de code, consulte au minimum les skills `architecture`, `nomenclature` et `evolutivite`.

Consulte les autres skills lorsque le périmètre les concerne.

En cas de contradiction, ne choisis pas arbitrairement une règle. Identifie le conflit et demande une clarification lorsque les décisions existantes ne permettent pas de le résoudre.

# 3. Contexte technique du projet

TopDeal est une marketplace destinée au contexte de Bafoussam, au Cameroun.

Le projet utilise un monorepo organisé autour de pnpm workspaces.

| Domaine | Technologie actuelle |
|---|---|
| Monorepo | pnpm workspaces |
| Application Web | Next.js App Router |
| Interface | React et TypeScript |
| Styles | Tailwind CSS |
| Injection de dépendances | Awilix |
| Base de données | PostgreSQL |
| Accès aux données | Prisma |
| Authentification | Firebase Auth |
| Stockage de fichiers | MinIO, compatible S3 |
| Client mobile envisagé | Kotlin Multiplatform |

Ces technologies représentent les choix actuels. Elles ne doivent pas devenir des dépendances directes des règles métier.

Une technologie envisagée pour plus tard ne doit pas être implémentée prématurément.

**Règles structurelles :**

- Aucun dossier `src` ne doit être créé.
- Les packages internes utilisent le namespace `@topdeal`.
- Les fonctionnalités sont organisées dans `packages/features/`.
- `packages/core` contient uniquement les éléments réellement partagés.
- `packages/ui` contient les composants visuels génériques.
- `apps/web` contient l'application Next.js et son assemblage technique.
- Ne crée pas de dossiers vides pour compléter artificiellement une architecture.

# 4. Architecture générale

L'architecture est organisée par fonctionnalité (*feature-first*).

Chaque fonctionnalité possède ses propres responsabilités.

Structure de référence :

```text
packages/
├── core/
│   ├── models/
│   ├── usecases/
│   └── repositories/
│
├── features/
│   └── auth/
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

Cette structure est une référence, pas une obligation de créer tous les dossiers dans chaque fonctionnalité.

**Ne crée un dossier que lorsqu'un élément réel doit y être placé.**

# 5. Responsabilités des couches

## 5.1. Core

Core contient les contrats et modèles nécessaires à l'organisation du métier.

Il existe deux niveaux :

**Core global : `packages/core/`**

Contient uniquement les éléments véritablement partagés entre plusieurs fonctionnalités :

- `models/` : modèles communs ;
- `usecases/` : contrats de Use Cases communs ;
- `repositories/` : contrats de repositories communs.

**Core d'une fonctionnalité : `packages/features/<feature>/core/`**

Contient les contrats et modèles propres à cette fonctionnalité :

- `models/` ;
- `usecases/` ;
- `repositories/`.

Une interface utilisée uniquement par Auth reste dans le Core d'Auth.

Ne déplace pas un élément dans le Core global simplement pour le rendre accessible à plusieurs dossiers.

## 5.2. Domain

Domain contient les implémentations des Use Cases et les règles métier correspondantes.

Il contient uniquement le dossier :

```text
domain/
└── usecases/
```

Chaque Use Case représente une opération métier clairement identifiée.

Exemples :

- `CreateTaskUseCaseImpl`
- `UpdateTaskUseCaseImpl`
- `DeleteTaskUseCaseImpl`

Chaque implémentation respecte le contrat correspondant défini dans Core.

Exemple :

```ts
export class TaskUseCaseImpl implements TaskUseCase {
  // Implémentation de l'opération métier
}
```

Le Domain :

- ne dépend pas de Prisma ;
- ne dépend pas de Firebase SDK ;
- ne dépend pas de Next.js ;
- ne dépend pas de React ;
- ne dépend pas d'Awilix ;
- ne dépend pas des implémentations concrètes de Data.

Ne place pas les implémentations de repositories dans Domain.

## 5.3. Data

Data contient les implémentations techniques nécessaires aux contrats définis dans Core.

Il contient uniquement :

```text
data/
├── repositories/
└── services/
```

**`repositories/`**

Contient les implémentations concrètes des contrats de repositories.

Exemple :

```ts
export class TaskCreateRepositoryImpl
  implements CreateTaskRepository {
  // Accès technique aux données
}
```

**`services/`**

Contient les intégrations techniques avec les fournisseurs externes ou les systèmes nécessaires.

Exemples possibles :

- Firebase ;
- stockage S3 ;
- services externes ;
- autres intégrations techniques.

Ne crée pas de dossier `adapters/`, `mappers/` ou `models/` par défaut.

Si une transformation ou un traitement technique est nécessaire, place-le dans le fichier ou la responsabilité appropriée sans créer une couche supplémentaire automatiquement.

Data ne doit pas devenir propriétaire des règles métier.

## 5.4. Presentation

Chaque fonctionnalité possède sa propre présentation.

Structure de référence :

```text
presentation/
├── screens/
├── components/
├── hooks/
├── styles/
└── types/
```

Responsabilités :

- `screens/` : écrans complets de la fonctionnalité ;
- `components/` : composants propres à la fonctionnalité ;
- `hooks/` : hooks de présentation ;
- `styles/` : styles séparés de la logique des composants ;
- `types/` : types propres à la présentation.

Un composant exclusivement utilisé par une fonctionnalité reste dans celle-ci.

Un composant véritablement générique et réutilisable peut être placé dans `packages/ui`.

Ne déplace pas un composant métier dans `packages/ui` uniquement parce qu'il est utilisé à plusieurs endroits d'une même fonctionnalité.

# 6. Atomicité et organisation des fichiers

L'atomicité est une règle importante de TopDeal.

Elle signifie qu'un fichier doit avoir une responsabilité claire et identifiable.

Applique les règles suivantes :

1. Un Use Case représente une opération métier.
2. Une implémentation de Use Case possède son propre fichier.
3. Un contrat possède son propre fichier.
4. Les types importants et réutilisables possèdent leurs propres fichiers.
5. Une implémentation de repository possède son propre fichier.
6. Un composant possède son propre fichier lorsque cela améliore réellement sa lisibilité et sa réutilisation.
7. Les responsabilités distinctes ne doivent pas être regroupées artificiellement dans une seule classe.

Cependant, **l'atomicité ne signifie pas qu'il faut créer un fichier pour chaque petite fonction ou chaque type temporaire.**

Avant de créer un fichier, vérifie :

- S'il possède une responsabilité réellement distincte.
- S'il sera compréhensible et utile indépendamment.
- S'il évite de mélanger plusieurs responsabilités.
- Si sa création apporte une meilleure organisation réelle.

Ne transforme pas l'atomicité en prolifération de fichiers.

# 7. Contrats et implémentations

Les contrats et leurs implémentations doivent être séparés.

Exemple :

```text
core/
├── repositories/
│   └── CreateTaskRepository.ts
└── usecases/
    └── CreateTaskUseCase.ts

domain/
└── usecases/
    └── CreateTaskUseCaseImpl.ts

data/
└── repositories/
    └── TaskCreateRepositoryImpl.ts
```

Le contrat exprime ce dont le métier a besoin.

L'implémentation réalise ce besoin.

Ne crée pas automatiquement une interface pour chaque classe.

Une interface est justifiée lorsqu'elle définit une frontière utile, un contrat nécessaire ou une implémentation qui doit pouvoir être remplacée.

# 8. Gestion des erreurs

TopDeal utilise un catalogue centralisé des erreurs.

Les codes et messages destinés à être réutilisés doivent être déclarés dans un emplacement central adapté.

Règles :

- Ne répète pas les mêmes messages d'erreur dans plusieurs fichiers.
- Utilise des codes d'erreur stables.
- Préserve les informations utiles au diagnostic.
- Ne révèle pas les détails techniques internes au client.
- Distingue les erreurs métier des erreurs techniques.
- Traduis les erreurs techniques au niveau approprié avant de les exposer.

Ne crée pas plusieurs catalogues concurrents pour une même responsabilité.

Une erreur spécifique à une fonctionnalité peut rester propre à cette fonctionnalité si elle ne doit pas être partagée.

# 9. Dépendances et Composition Root

Les dépendances doivent respecter les frontières des couches.

- Core définit les contrats nécessaires.
- Domain implémente les Use Cases.
- Data implémente les contrats techniques.
- Presentation déclenche les opérations métier.
- `apps/web` assemble les implémentations concrètes.

Awilix appartient au Composition Root de `apps/web`.

Le conteneur ne doit pas être importé directement dans les Use Cases ou dans les fonctionnalités.

Les dépendances doivent être injectées explicitement.

Évite le Service Locator et les dépendances globales cachées.

Ne crée pas de mécanisme d'injection supplémentaire si Awilix et l'organisation existante répondent déjà au besoin.

# 10. Application Web et API

`apps/web` contient notamment :

- les routes Next.js ;
- les Route Handlers ;
- les composants propres à l'application ;
- la configuration ;
- le bootstrap ;
- le Composition Root ;
- le conteneur de dépendances.

Un Route Handler doit :

1. Recevoir la requête.
2. Valider les données reçues.
3. Vérifier l'identité et les autorisations nécessaires.
4. Appeler le Use Case correspondant.
5. Transformer le résultat en réponse HTTP.

Un Route Handler ne doit pas :

- appeler Prisma directement ;
- appeler un repository concret directement ;
- contenir les règles métier principales ;
- contourner les contrôles d'accès.

# 11. Principes de conception et anti-sur-ingénierie

Les principes de conception sont des outils, pas des obligations mécaniques.

**KISS :** privilégier la solution la plus simple qui répond correctement au besoin.

**YAGNI :** ne pas développer une capacité hypothétique qui n'est pas nécessaire.

**DRY :** éviter les duplications significatives, sans créer une abstraction plus complexe que le code qu'elle remplace.

**SOLID :** appliquer les principes lorsqu'ils améliorent réellement les responsabilités et les dépendances.

**Modularité :** maintenir des frontières claires entre les fonctionnalités.

Règles anti-sur-ingénierie :

- Pas d'interface sans besoin réel.
- Pas de repository générique universel sans cas d'utilisation concret.
- Pas de Factory sans complexité de création justifiée.
- Pas de Strategy tant qu'il n'existe pas plusieurs comportements réels à sélectionner.
- Pas de Manager ou Helper fourre-tout.
- Pas de couche supplémentaire pour simplement déplacer du code.
- Pas de dossier vide.
- Pas de classe ou de fichier créé uniquement pour respecter une forme théorique.
- Pas de duplication de configuration ou de logique déjà disponible.
- Pas de refonte générale lorsqu'une correction locale suffit.

**La meilleure architecture est celle qui sépare clairement les responsabilités avec le minimum de complexité nécessaire.**

# 12. Sécurité

- Ne jamais placer de secrets dans le code versionné.
- Ne jamais exposer de clés privées ou de jetons sensibles dans le navigateur.
- Valider les données reçues aux frontières du système.
- Vérifier les autorisations côté serveur.
- Ne jamais faire confiance aux rôles, prix ou statuts transmis par le client.
- Ne pas exposer les erreurs internes ou les informations sensibles.
- Ne pas journaliser inutilement des données personnelles.
- Préserver la séparation entre les SDK serveur et navigateur.

Consulter le skill `securite` pour toute modification liée à l'authentification, aux autorisations ou aux données sensibles.

# 13. Performance

- Paginer côté serveur les listes potentiellement volumineuses.
- Appliquer les filtres et tris dans la requête de données.
- Ne récupérer que les champs nécessaires.
- Éviter les requêtes N+1.
- Éviter les appels réseau inutiles.
- Ne pas ajouter de cache sans besoin identifié et stratégie d'invalidation.
- Ne pas introduire Redis, des workers ou une architecture distribuée sans justification.

La performance ne doit pas devenir un prétexte à la complexité.

Consulter le skill `performance` pour les tâches concernées.

# 14. Transactions et opérations sensibles

Les opérations financières doivent rester indépendantes du fournisseur technique utilisé.

- Les règles métier ne dépendent pas d'un SDK de paiement.
- Les intégrations techniques restent isolées dans Data.
- Une transaction ne doit pas être déclarée réussie sans confirmation fiable.
- Les opérations sensibles doivent prendre en compte les doublons et les délais.
- Ne pas relancer aveuglément une opération après un timeout.
- Ne pas inventer de frais, commissions, délais ou règles de remboursement.

Le traitement manuel actuel doit continuer à fonctionner tant qu'il fait partie du processus validé.

Consulter `transactions-evolutives` pour toute modification de paiement, versement ou remboursement.

# 15. Base de données et migrations

PostgreSQL et Prisma sont les technologies actuelles de persistance.

Prisma doit rester confiné à Data et aux emplacements techniques autorisés.

Ne fais pas remonter les types Prisma dans les contrats métier.

**Commandes interdites sans autorisation explicite :**

- `prisma migrate dev`
- `prisma migrate reset`
- `prisma db push`

Ne modifie pas le schéma ou les migrations sans comprendre les contraintes existantes et les conséquences sur les données.

Ne supprime ou ne réinitialise jamais des données pour résoudre une erreur sans autorisation explicite.

# 16. Méthode de travail

Avant de modifier le code :

1. Examiner la structure et les fichiers existants.
2. Lire les instructions et skills concernés.
3. Identifier la fonctionnalité propriétaire.
4. Identifier la responsabilité et la couche concernées.
5. Comprendre les contrats et dépendances existants.
6. Identifier les règles métier à préserver.
7. Choisir la solution la plus simple qui respecte les contraintes.

Pendant le développement :

- Limiter les modifications au périmètre demandé.
- Préserver les conventions valides existantes.
- Ne pas déplacer ou renommer des fichiers sans nécessité.
- Ne pas ajouter de dépendance sans justification.
- Ne pas modifier implicitement les règles métier.
- Ne pas créer de structure vide ou spéculative.
- Préserver les opérations qui doivent rester atomiques pour garantir la cohérence des données.

Après le développement :

1. Vérifier les imports et les dépendances.
2. Vérifier les responsabilités des couches.
3. Exécuter les tests pertinents.
4. Exécuter le lint, le typecheck ou le build lorsque cela est pertinent.
5. Signaler les vérifications non exécutées.
6. Résumer les fichiers modifiés et les décisions importantes.

Pour une refonte large, présenter d'abord un plan de modification avant de toucher à l'ensemble du projet.

# 17. Gestion des incertitudes

Ne devine jamais une règle métier manquante.

Si une décision change sensiblement le comportement ou l'architecture :

- explique brièvement le point bloquant ;
- présente les conséquences des choix possibles ;
- demande une clarification ciblée.

Si le détail est secondaire et facilement réversible, choisis une solution simple et indique qu'il s'agit d'une proposition.

le fichier MEMOIRE1 doit nous servir de plan a suivre lorsqu'on execute une tache pour coher qui a ete fait, ce qui manque ainsi on a une memoire au cas un autre agent doit continuer donc c'est un fichier courant en perpectuel update pour s'aligner sur nos actions courantes 

# 18. Format du compte rendu

À la fin d'une tâche, indique :

- ce qui a été réalisé ;
- les fichiers ou fonctionnalités concernés ;
- les décisions techniques importantes ;
- les tests et vérifications exécutés ;
- les éventuels points restant à valider.

Ne prétends jamais qu'un test ou une commande a réussi si son résultat n'a pas été vérifié.

---

# Checklist finale

- [ ] Le besoin fonctionnel est respecté.
- [ ] Les décisions validées sont préservées.
- [ ] Aucun dossier `src` n'a été ajouté.
- [ ] Le code appartient à la bonne fonctionnalité.
- [ ] Le code appartient à la bonne couche.
- [ ] Core ne contient que les contrats et modèles correspondant à son périmètre.
- [ ] Domain contient les implémentations des Use Cases.
- [ ] Data contient uniquement `repositories/` et `services/`.
- [ ] Les contrats et implémentations sont séparés.
- [ ] Les fichiers ont des responsabilités claires.
- [ ] Les types importants sont séparés lorsque cela est utile.
- [ ] Les composants spécifiques restent dans leur fonctionnalité.
- [ ] Les composants génériques restent dans `packages/ui`.
- [ ] Les erreurs réutilisées proviennent du catalogue centralisé.
- [ ] Les dépendances respectent les frontières.
- [ ] Awilix reste dans le Composition Root.
- [ ] Aucune abstraction inutile n'a été ajoutée.
- [ ] Aucune règle métier n'a été inventée.
- [ ] Les contrôles de sécurité sont effectués côté serveur.
- [ ] Les performances sont prises en compte sans sur-optimisation.
- [ ] Les vérifications pertinentes ont été exécutées ou leur absence signalée.