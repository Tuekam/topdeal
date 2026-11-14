# Référence détaillée — Architecture TopDeal

## Statut
Synthèse des décisions d'architecture documentées pour TopDeal. Elle ne certifie pas que toutes les structures cibles sont déjà présentes dans le dépôt. La documentation technique complète et les décisions ultérieures de l'utilisateur priment.

## Principes directeurs
- Organisation feature-first.
- Séparation Domain / Data / Presentation dans chaque feature.
- Dépendance vers l'intérieur : le Domain ne dépend pas des détails.
- Core réservé aux éléments réellement transversaux.
- Composition Root centralisé dans `apps/web`.
- UI partagée visuelle, sans règles métier.
- Préparation à une API réutilisable par un client mobile futur.
- Aucun `src`.

## Répertoires et responsabilités

| Emplacement | Responsabilité | Dépendances à éviter |
|---|---|---|
| `apps/web/app` | Pages et routes Next.js | Règles métier et accès DB direct |
| `apps/web/bootstrap` | Assemblage initial / démarrage | Logique métier |
| `apps/web/di` | Conteneur Awilix et registrations | Dépendance du Domain vers le conteneur |
| `apps/web/config` | Configuration et environnement | Exposition de secrets au client |
| `packages/core` | Contrats et modèles transversaux | Frameworks et fournisseurs |
| `packages/ui` | Tokens, composants et layouts visuels | Règles métier et accès aux données |
| `features/*/domain` | Métier, Use Cases, ports | Prisma, Firebase SDK, MinIO SDK, React, Next, Awilix |
| `features/*/data` | Implémentations et intégrations | Présentation et règles métier centrales |
| `features/*/presentation` | UI et état de présentation | Prisma, secrets et accès DB |

## Liste des features connues
`auth`, `annonce`, `commande`, `paiement`, `conversation`, `favoris`, `proposition`, `versement`, `remboursement`, `troc`, `affiliation`, `verification-identite`, `notification`, `litige`, `support`, `administration`.

Cette liste est le périmètre modulaire documenté ; elle ne signifie pas que tous les packages sont déjà implémentés ni que les responsabilités détaillées de chaque feature sont entièrement spécifiées.

## Flux type d'une requête

```text
Client
  → Route Handler (HTTP, validation de forme, authentification/autorisation)
  → Use Case (règles et orchestration métier)
  → Port du Domain
  → Implémentation Data / Adapter
  → Prisma, Firebase Auth ou MinIO
  → modèle/résultat métier
  → réponse HTTP
```

Le Route Handler traduit le protocole. Le Use Case décide du comportement métier. Le repository/adaptateur exécute l'accès technique.

## Exemples conceptuels de ports
- Charger une annonce.
- Enregistrer une candidature.
- Obtenir l'identité interne de l'utilisateur.
- Stocker un fichier.

Ce sont des exemples de responsabilités, pas des noms de classes ou contrats imposés.

## Points à confirmer
- Scopes et cycle de vie exacts du conteneur Awilix.
- Stratégie de communication inter-features (appels, événements, etc.).
- Contrats OpenAPI et versionnement de l'API.
- Détails de transactions, idempotence et cohérence.
- Flux de liaison Firebase UID / UUID interne.
- Stratégie de stockage et de génération d'URLs MinIO.
- Règles précises de tests, observabilité et déploiement.

Ne tranche aucun de ces points silencieusement.
