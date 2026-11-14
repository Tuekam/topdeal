---
name: nomenclature
description: Applique et contrôle les conventions de nommage TopDeal pour les packages, dossiers, fichiers, contrats, implémentations, Use Cases, hooks React, composants et exports TypeScript.
---

# Skill — Nomenclature TopDeal

## Mission
Appliquer une nomenclature cohérente et explicite dans le monorepo TopDeal. Les noms doivent rendre le rôle réel d'un élément compréhensible sans introduire de conventions inutiles. Lire `references/nomenclature-reference.md` avant toute tâche substantielle.

## Sources de vérité
La documentation d'architecture TopDeal et les décisions explicites de l'utilisateur priment. Distinguer les conventions confirmées des propositions et des points non définis. Ne jamais présenter une préférence personnelle ou une convention courante comme une règle officielle TopDeal.

## Règles établies
- Aucun dossier `src` dans les packages TopDeal.
- Les packages internes utilisent l'espace de noms `@topdeal`.
- Exemples : `@topdeal/ui`, `@topdeal/feature-annonce`.
- Les noms de packages restent explicites et homogènes.
- Les noms de fichiers et dossiers expriment leur responsabilité réelle.
- Les exports publics sont contrôlés ; éviter les imports profonds non documentés.
- Chaque package déclare ses dépendances.
- Ne pas créer de dossier vide, d'abstraction ou de fichier sans besoin concret.

## Conventions explicitement documentées

| Élément | Convention | Exemple |
|---|---|---|
| Contrat repository | Nom métier + `Repository` | `AnnonceRepository` |
| Implémentation | Nom du contrat + `Impl` | `AnnonceRepositoryImpl` |
| Use Case | Verbe + objet + `UseCase` | `CreateAnnonceUseCase` |
| Hook React | `use` + action/ressource | `useAnnonces` |
| Composant | PascalCase | `AnnonceCard` |
| Énumération | Nom métier explicite | `StatutAnnonce` |
| Barrel | `index.ts` si utile | `presentation/index.ts` |


## Cohérence avec l'architecture
Les noms reflètent les responsabilités :
- `domain/` : règles métier, Use Cases, contrats, erreurs et modèles métier si nécessaires.
- `data/` : repositories concrets, adapters, mappers et modèles techniques si nécessaires.
- `presentation/` : composants, hooks et états de présentation.
- `packages/core` : éléments réellement transversaux.
- `packages/ui` : composants et layouts visuels génériques.
- `apps/web` : application Next.js, routes, composition root, configuration et bootstrap.

Ne pas déplacer un élément de couche pour obtenir un nom plus commode.

## Règles de décision
1. Identifier la nature de l'élément à nommer.
2. Vérifier si une convention est explicitement définie.
3. Si oui, l'appliquer sans variante locale.
4. Sinon, suivre la convention déjà présente dans le dossier et signaler qu'il s'agit d'une proposition.
5. Garder le vocabulaire métier homogène.
6. Éviter les suffixes `Service`, `Manager`, `Helper`, `Factory`, `Util` ou `Impl` sans rôle ou convention justifiant leur emploi.
7. Avant un renommage, analyser les imports, exports publics et impacts.

## Audit
1. Inspecter l'arborescence et les `package.json`.
2. Repérer noms ambigus, doublons, synonymes, suffixes inutiles et incohérences.
3. Vérifier les références avant renommage.
4. Présenter une liste avant/après avec justification.
5. Signaler les conventions à valider.
6. Ne pas lancer un renommage massif sans accord explicite.

## Points non définis — ne pas inventer
La documentation ne fixe pas encore :
- la casse de tous les fichiers et dossiers ;
- le nommage détaillé des variables, fonctions et paramètres ;
- le préfixe `I` des interfaces ;
- les suffixes DTO, Model, Type, Schema, Service, Manager ou Factory ;
- les conventions de tests, CSS, Tailwind et variables d'environnement ;
- les conventions de routes et endpoints.

Pour ces cas, suivre provisoirement les usages existants du dossier et proposer une règle globale à faire valider.
