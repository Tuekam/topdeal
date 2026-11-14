---
name: architecture
description: Architecture logicielle de TopDeal — monorepo pnpm, apps/web Next.js, packages/core, packages/ui et packages/features, séparation Domain/Data/Presentation, ports et adaptateurs, Awilix et Composition Root, Route Handlers, PostgreSQL/Prisma, Firebase Auth, MinIO, frontières inter-modules, sécurité, performance, SOLID, DRY, KISS, YAGNI et design patterns. Utilise ce skill pour concevoir, expliquer, auditer ou faire évoluer l'architecture, ajouter une feature, déplacer une responsabilité ou choisir une abstraction.
---

# Architecture logicielle de TopDeal

L'architecture doit permettre de faire évoluer la marketplace sans concentrer les règles métier dans l'application Web, sans coupler le Domain aux fournisseurs techniques et sans créer d'abstractions prématurées. La règle centrale est simple : **le métier définit ses besoins ; les détails techniques les implémentent**.

## 1. Sources de vérité et statut des décisions

La documentation d'architecture technique TopDeal et les décisions explicites de l'utilisateur priment sur les habitudes générales de développement.

Toujours distinguer :
- **VALIDÉ** : décision explicitement retenue.
- **CIBLE** : organisation prévue, dont l'implémentation réelle doit être vérifiée.
- **À CONFIRMER** : proposition ou détail non arrêté.

Ne transforme jamais une proposition en règle validée. Ne déduis pas qu'une structure existe dans le dépôt parce qu'elle apparaît dans la documentation cible. Pour un dépôt existant, inspecte d'abord les fichiers réels.

## 2. Vue globale

```text
Navigateur Web / futur client mobile
              │ HTTP / API
              ▼
           apps/web
   Next.js, React, Route Handlers
       Awilix / bootstrap
              │ appelle
              ▼
      packages/features/*
       Domain / Data / Presentation
              │ ports
              ▼
       Adaptateurs techniques
        Prisma / Firebase / MinIO
              │
              ▼
 PostgreSQL / Firebase Auth / MinIO

packages/core : contrats et modèles transversaux
packages/ui   : composants visuels partagés
```

La stack de référence est pnpm workspace, Next.js App Router, React, TypeScript, Awilix, PostgreSQL, Prisma, Firebase Auth et MinIO. Une application Kotlin Multiplatform est envisagée ultérieurement et doit consommer la même API ; les modalités OpenAPI restent à préciser.

## 3. Monorepo et modules

```text
topdeal/
├── apps/
│   └── web/
│       ├── app/
│       ├── components/providers/
│       ├── bootstrap/
│       ├── di/container.ts
│       ├── config/env.ts
│       ├── public/
│       └── package.json
├── packages/
│   ├── core/
│   │   ├── models/
│   │   ├── interfaces/
│   │   ├── enums/
│   │   ├── errors/
│   │   └── utils/
│   ├── ui/
│   │   ├── tokens/
│   │   ├── components/
│   │   ├── layout/
│   │   ├── hooks/
│   │   └── styles/
│   └── features/
│       ├── auth/
│       ├── annonce/
│       ├── commande/
│       ├── paiement/
│       ├── conversation/
│       ├── favoris/
│       ├── proposition/
│       ├── versement/
│       ├── remboursement/
│       ├── troc/
│       ├── affiliation/
│       ├── verification-identite/
│       ├── notification/
│       ├── litige/
│       ├── support/
│       └── administration/
└── package.json
```

- **Aucun dossier `src`** ne doit être ajouté.
- Chaque package possède son `package.json` et déclare ses dépendances.
- Le package racine orchestre les scripts ; il ne reçoit pas de logique métier.
- Les packages internes utilisent l'espace de noms `@topdeal`, par exemple `@topdeal/ui` et `@topdeal/feature-annonce`.
- Les groupes de routes Next.js entre parenthèses sont un classement d'écrans, pas des modules métier.

## 4. Une feature

```text
packages/features/annonce/
├── domain/
│   ├── entities/       # si le domaine le justifie
│   ├── value-objects/  # si nécessaire
│   ├── use-cases/
│   ├── interfaces/     # ports du module
│   └── errors/
├── data/
│   ├── repositories/
│   ├── adapters/
│   ├── mappers/        # si nécessaire
│   └── models/         # modèles techniques si nécessaires
├── presentation/
│   ├── components/
│   ├── hooks/
│   └── states/
└── package.json
```

Les sous-dossiers indiqués comme facultatifs ne sont créés que lorsqu'un besoin concret apparaît. Pas de dossier vide, de classe vide ou d'abstraction sans consommateur.

### Domain

Porte les règles métier, Use Cases, ports/interfaces, erreurs métier, entités et Value Objects utiles. Il décrit ce que TopDeal doit faire, sans connaître le stockage, le protocole ou l'interface.

**N'y place jamais :** React, hooks React, Prisma Client, modèles Prisma, SDK Firebase, SDK MinIO, Next.js, Awilix, requêtes HTTP ou accès direct à la base.

### Data

Implémente les ports du Domain et traduit les besoins métier vers les systèmes techniques.

- `repositories/` : implémentations concrètes des contrats de repository.
- `adapters/` : intégrations avec Prisma, Firebase Auth, MinIO ou autres fournisseurs.
- `mappers/` : conversions entre enregistrements techniques et modèles métier, seulement si nécessaires.
- `models/` : modèles techniques propres à Data, seulement si nécessaires.

Data exécute les opérations techniques ; elle ne devient pas propriétaire des règles métier.

### Presentation

Adapte les Use Cases à l'expérience utilisateur : composants spécifiques à la feature, hooks React et états de présentation (`loading`, `success`, `error`, `empty`, données affichées). Elle ne contient ni requêtes Prisma, ni secrets, ni règles métier centrales.

## 5. Sens des dépendances

```text
Presentation ─────► Domain / Use Cases
                         ▲
                         │ contrats implémentés
                        Data
```

Le Domain définit les abstractions nécessaires. Data les implémente. Presentation appelle les actions métier sans importer les détails d'implémentation. Ne crée pas de dépendance circulaire.

Un repository est déclaré du côté Domain et son implémentation réside dans Data. Un port appartient à la feature qui en a besoin, sauf s'il est réellement transversal.

## 6. Core partagé

`packages/core` ne contient que des éléments réellement utilisés par plusieurs features, stables et indépendants d'un métier particulier : modèles transversaux, interfaces, enums, erreurs et utilitaires purs.

| À mettre dans Core | À ne pas y déplacer |
|---|---|
| Contrat partagé par plusieurs features | Repository métier d'une seule feature |
| Enum réellement transversal | Enum propre à Annonce ou Commande |
| Erreur générique stable | Règle métier d'un module |
| Utilitaire pur et générique | Service global fourre-tout |

En cas de doute, garde l'élément dans la feature propriétaire. Core n'est ni un fourre-tout, ni un dossier global de services/repositories, ni un package dépendant de Next.js, React, Prisma, Firebase ou Awilix.

## 7. Application Web et Route Handlers

`apps/web` est l'application Next.js : pages, entrées HTTP, providers, configuration, bootstrap et assemblage des dépendances. Elle n'est pas propriétaire des règles métier.

Un Route Handler suit ce flux :
1. lire la requête HTTP ;
2. valider le format, les paramètres et le corps à la frontière HTTP ;
3. authentifier l'appelant et vérifier ses autorisations côté serveur ;
4. résoudre le Use Case via le conteneur ;
5. appeler le Use Case avec des données adaptées ;
6. convertir le résultat ou l'erreur en réponse HTTP.

**Interdit :** accès direct à Prisma ou à un repository concret depuis un Route Handler ; duplication des règles métier dans le handler.

Les pages composent les composants de présentation des features et les composants génériques de `packages/ui`.

## 8. Awilix et Composition Root

Awilix est assemblé dans `apps/web`, notamment sous `di/` et `bootstrap/`. Le Composition Root enregistre les implémentations concrètes et construit les Use Cases.

- Le Domain ne connaît pas Awilix.
- Les composants navigateur ne résolvent pas les dépendances du conteneur serveur.
- Les classes concrètes et SDK sont enregistrés à la frontière de composition.
- Ne duplique pas l'assemblage dans les Use Cases ou les composants.

La stratégie exacte des scopes Awilix (notamment par requête) n'est pas arrêtée dans la documentation de référence : ne l'invente pas ; inspecte le code et propose une décision si nécessaire.

## 9. Persistance et services externes

| Technologie | Responsabilité / frontière |
|---|---|
| PostgreSQL | Base relationnelle retenue |
| Prisma | Accès aux données, confiné à Data/adapters |
| Firebase Auth | Fournisseur d'authentification derrière un port |
| MinIO | Stockage objet derrière un port |

L'UID Firebase est distinct de l'UUID interne TopDeal. Les modèles Prisma ne traversent pas vers Domain ou Presentation. Les détails de liaison de compte, URLs signées, transactions, idempotence et cohérence inter-modules doivent être définis au besoin ; ne pas les supposer.

## 10. Communication entre features

Chaque feature reste propriétaire de ses règles et données métier. Une autre feature ne manipule pas directement ses tables ou repositories internes.

- Consommer les contrats publics du module propriétaire.
- Éviter les imports profonds non documentés.
- Éviter les dépendances circulaires.
- Ne déplacer un concept vers Core que s'il répond au critère de transversalité.
- Choisir appel direct, événement ou autre mécanisme selon le besoin réel ; le mécanisme global n'est pas imposé par la documentation.

## 11. POO, modularité et principes de conception

Les principes sont des outils de décision, pas une obligation d'ajouter des couches.

| Principe | Application proportionnée |
|---|---|
| POO | Regrouper état et comportement cohérents ; éviter les objets sans responsabilité claire. |
| Modularité | Définir des frontières métier et des contrats ciblés. |
| SOLID | Responsabilités cohérentes, interfaces ciblées, dépendances inversées ; éviter l'application mécanique. |
| DRY | Mutualiser une règle réellement répétée ; deux ressemblances superficielles ne suffisent pas toujours. |
| KISS | Choisir la solution la plus simple qui répond correctement au besoin. |
| YAGNI | Ne pas construire une capacité hypothétique sans besoin identifié. |
| LLD | Clarifier classes, contrats, responsabilités et interactions utiles avant implémentation. |
| Performance | Mesurer le goulot avant cache, index, parallélisme ou nouvelle infrastructure. |
| Sécurité | Valider côté serveur, vérifier identité/permissions/propriété, protéger secrets et traiter les fichiers comme non fiables. |

### Choisir un design pattern

| Famille | Exemples | Question à poser |
|---|---|---|
| Création | Factory, Builder | La création est-elle réellement complexe ou variable ? |
| Structure | Adapter, Facade, Decorator, Proxy | Faut-il traduire, simplifier, enrichir ou contrôler l'accès ? |
| Comportement | Strategy, Observer, State, Command | Existe-t-il plusieurs comportements ou des interactions qui le justifient ? |

**Exemple anti-sur-ingénierie :** une seule règle de taxe fixe ne justifie pas une hiérarchie Strategy. Une méthode simple suffit. Réévaluer lorsque plusieurs algorithmes métier réels doivent être sélectionnés.

N'ajoute pas plusieurs patterns ensemble sans expliquer le problème distinct que chacun résout.

## 12. Sécurité, erreurs et performance

- Les contrôles d'autorisation sont côté serveur ; masquer un bouton ne protège pas une ressource.
- Vérifier l'identité, le rôle, la propriété et le contexte métier avant une opération sensible.
- Valider les entrées aux frontières ; ne pas faire confiance au navigateur.
- Ne jamais exposer les secrets dans le bundle client ou les réponses.
- Ne pas transmettre les erreurs internes, traces ou détails sensibles au client.
- Traiter les fichiers uploadés comme des entrées non fiables.
- Mesurer latence, volume et fréquence avant d'ajouter une optimisation.
- Toute stratégie cache doit préciser invalidation et cohérence ; ne pas introduire Redis ou un cache sans besoin mesuré.

Les règles métier de sécurité détaillées, transactions, idempotence et politiques de rétention doivent provenir des spécifications correspondantes, pas être inventées par le skill d'architecture.

## 13. Ajouter une fonctionnalité

1. Lire la spécification fonctionnelle concernée et identifier les règles confirmées.
2. Identifier la feature propriétaire ; ne pas créer un module uniquement pour une page.
3. Définir l'action métier et les entrées/sorties du Use Case.
4. Identifier les ports nécessaires du point de vue du Domain.
5. Ajouter uniquement les modèles métier utiles.
6. Implémenter les ports dans Data avec Prisma ou les adaptateurs appropriés.
7. Ajouter le mapping uniquement si les modèles diffèrent réellement.
8. Enregistrer les dépendances dans le Composition Root.
9. Exposer l'entrée HTTP via Route Handler si nécessaire.
10. Construire Presentation avec les composants partagés de `packages/ui`.
11. Ajouter les tests correspondant aux règles et frontières touchées.
12. Vérifier les imports, dépendances, erreurs, autorisations et absence de régression.

## 14. Procédure d'audit

Pour chaque problème relevé, indiquer le fichier, la responsabilité actuelle, la règle concernée, l'impact réel et une correction proportionnée. Vérifier dans cet ordre :
1. frontières de packages et feature propriétaire ;
2. couche et sens des dépendances ;
3. imports interdits dans Domain ;
4. accès direct à Prisma hors Data ;
5. responsabilités de Route Handlers et Composition Root ;
6. duplication ou abstraction prématurée ;
7. sécurité, erreurs, performance et testabilité selon le périmètre.

Ne fais pas une chasse abstraite aux violations SOLID : explique pourquoi un écart nuit réellement au projet.

## 15. Pièges à éviter

- Ajouter un dossier `src`.
- Créer des dossiers facultatifs vides.
- Mettre tous les repositories ou Use Cases dans un dossier global.
- Déplacer une règle métier dans `apps/web`, `packages/ui` ou Data.
- Importer Prisma/Firebase/Next/Awilix depuis Domain.
- Appeler Prisma directement depuis un Route Handler.
- Mettre un contrat propre à une feature dans Core.
- Faire dépendre une feature des tables internes d'une autre.
- Créer une interface, une Factory, une Strategy ou un service générique sans besoin démontré.
- Confondre Firebase UID et identifiant interne TopDeal.
- Supposer que le futur client KMP impose déjà une implémentation mobile dans le monorepo Web.

## 16. Checklist avant livraison

- [ ] Le besoin et les règles métier sont compris.
- [ ] La feature propriétaire est identifiée.
- [ ] Aucun dossier `src` ajouté.
- [ ] Les couches Domain/Data/Presentation ont des responsabilités nettes.
- [ ] Domain ne dépend d'aucun détail technique.
- [ ] Les ports sont définis là où le métier en a besoin.
- [ ] Prisma reste dans Data/adapters.
- [ ] Route Handler ne porte pas la logique métier.
- [ ] Awilix est assemblé dans le Composition Root.
- [ ] Core ne contient que du réellement transversal.
- [ ] Aucune dépendance circulaire ou import profond injustifié.
- [ ] Aucun pattern ou dossier ajouté sans besoin concret.
- [ ] Identité, autorisations, secrets et erreurs sont traités côté serveur.
- [ ] Tests adaptés ajoutés ou limites explicitement signalées.
- [ ] VALIDÉ / CIBLE / À CONFIRMER clairement distingués.

## Références

Lire `references/architecture-reference.md` pour la synthèse détaillée de l'architecture et des frontières. Les spécifications fonctionnelles restent la source de vérité des règles métier.
