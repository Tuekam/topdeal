---
name: performance
description: À appliquer lors de toute création, modification, revue ou optimisation du code TopDeal, en particulier pour les accès aux données, recherches, listes, filtres, API, composants React, chargements de pages et traitements coûteux. Prioriser un code simple, des réponses rapides, la pagination côté serveur et des performances mesurées.
---

## Skill — Performance

## 1. Objectif

Ce skill définit les règles permettant de préserver et d'améliorer les performances de TopDeal.

Les objectifs sont de :

- réduire les temps de chargement ;
- limiter les traitements inutiles ;
- optimiser les échanges entre le client et le serveur ;
- éviter les requêtes coûteuses ;
- maîtriser les ressources consommées ;
- préserver la fluidité de l'interface ;
- maintenir une application évolutive sans introduire de complexité prématurée.

La performance doit être prise en compte dès la conception, mais les optimisations doivent rester proportionnées aux besoins réels.

## 2. Principes fondamentaux

Appliquer les principes suivants :

- **Measure before optimizing** : mesurer avant d'optimiser.
- **Avoid unnecessary work** : ne pas effectuer des traitements inutiles.
- **Reduce data transfer** : transmettre uniquement les données nécessaires.
- **Optimize critical paths** : prioriser les opérations qui influencent directement l'expérience utilisateur.
- **Keep it simple** : privilégier les solutions simples et compréhensibles.
- **Prevent regressions** : éviter que les nouvelles fonctionnalités dégradent les performances existantes.

Ne pas confondre optimisation et multiplication des abstractions.

## 3. Performance de Next.js et React

TopDeal utilise Next.js avec l'App Router et React.

### 3.1 Server Components et Client Components

Privilégier les Server Components lorsque l'interactivité côté navigateur n'est pas nécessaire.

Utiliser les Client Components uniquement lorsqu'une fonctionnalité nécessite notamment :

- des interactions utilisateur ;
- des hooks React ;
- des événements navigateur ;
- un état local interactif ;
- des API disponibles uniquement côté client.

Éviter de placer inutilement `"use client"` à la racine d'une page ou d'une fonctionnalité.

Limiter la frontière client au composant qui a réellement besoin de l'interactivité.

### 3.2 Rendu des composants

- Éviter les rendus provoqués inutilement par une mauvaise organisation de l'état.
- Garder les composants suffisamment petits pour faciliter leur compréhension.
- Éviter les calculs coûteux répétés pendant le rendu.
- Ne pas introduire systématiquement `memo`, `useMemo` ou `useCallback`.
- Utiliser ces mécanismes lorsqu'un problème de performance est identifié ou qu'ils évitent réellement un travail coûteux.
- Éviter de déplacer inutilement de la logique métier dans les composants.

Ne pas optimiser un composant au détriment de sa lisibilité sans bénéfice mesurable.

### 3.3 Chargement des composants

Pour les composants lourds ou rarement utilisés, examiner la possibilité d'un chargement différé.

Cela peut notamment concerner :

- les éditeurs complexes ;
- les graphiques ;
- les outils avancés ;
- les interfaces secondaires ;
- les composants nécessitant de grosses dépendances.

Ne pas utiliser le chargement différé pour tous les composants sans distinction.

## 4. Chargement et transmission des données

Les données doivent être chargées en fonction du besoin réel de l'écran ou de l'opération.

- Ne récupérer que les champs nécessaires.
- Éviter les réponses contenant des objets complets inutilisés.
- Éviter les appels successifs qui pourraient être regroupés raisonnablement.
- Ne pas charger toutes les données d'une fonctionnalité lorsque seules quelques informations sont nécessaires.
- Éviter les appels réseau redondants.
- Prévoir une gestion adaptée des états de chargement, d'erreur et de données absentes.

Les échanges entre le client et le serveur doivent rester explicites et maîtrisés.

### 4.1 Pagination

Pour les collections susceptibles de devenir volumineuses, prévoir une pagination adaptée.

Ne pas récupérer systématiquement une collection complète.

Le choix entre pagination par offset et pagination par curseur doit dépendre du volume, du comportement attendu et des possibilités de la base de données.

La pagination doit être cohérente avec les besoins de l'interface.

### 4.2 Filtrage et tri

Lorsque cela est pertinent, effectuer le filtrage et le tri directement au niveau de la base de données plutôt que de charger inutilement toutes les données dans le serveur ou le navigateur.

Vérifier que les filtres et tris correspondent aux règles métier et aux possibilités des index existants.

## 5. Performance de PostgreSQL et Prisma

Les accès à la base de données représentent une partie importante des performances de l'application.

### 5.1 Requêtes

- Sélectionner uniquement les champs nécessaires.
- Éviter les requêtes inutiles.
- Éviter les chargements complets de tables.
- Examiner les relations chargées avec `include`.
- Éviter les requêtes répétées dans des boucles.
- Utiliser les opérations Prisma adaptées au besoin.
- Examiner les requêtes générées lorsqu'un problème de performance est suspecté.

Ne pas utiliser une requête complexe simplement pour éviter quelques lignes de code si elle rend le comportement difficile à comprendre.

### 5.2 Problème N+1

Identifier les situations dans lesquelles une requête supplémentaire est exécutée pour chaque élément d'une collection.

Privilégier les solutions adaptées :

- chargement groupé ;
- requêtes relationnelles appropriées ;
- opérations de lecture regroupées ;
- pagination.

Ne pas multiplier les appels à la base de données dans une boucle lorsque le même résultat peut être obtenu raisonnablement avec un chargement groupé.

### 5.3 Index

Les index doivent répondre à des besoins réels de consultation.

Avant d'ajouter un index :

- identifier les requêtes concernées ;
- examiner les conditions de filtrage ;
- examiner les tris ;
- vérifier les index existants ;
- évaluer l'intérêt de l'index.

Un index supplémentaire n'est pas toujours bénéfique : il peut augmenter le coût des écritures et de la maintenance.

Ne pas ajouter des index sur toutes les colonnes par précaution.

### 5.4 Transactions

Utiliser les transactions lorsqu'une opération doit préserver la cohérence de plusieurs écritures.

Ne pas utiliser une transaction pour regrouper arbitrairement des opérations indépendantes.

Les transactions doivent rester aussi courtes que raisonnablement possible.

Les règles détaillées de gestion des transactions sont définies dans le skill `transactions-evolutives`.

## 6. Cache

Le cache peut améliorer les performances, mais il introduit des contraintes d'invalidation et de cohérence.

Avant d'ajouter un mécanisme de cache, identifier :

- les données concernées ;
- leur fréquence de modification ;
- leur durée de validité acceptable ;
- les utilisateurs autorisés à y accéder ;
- les conséquences d'une donnée obsolète ;
- les règles d'invalidation nécessaires.

### 6.1 Principes

- Ne pas mettre en cache des données sensibles sans stratégie d'isolation appropriée.
- Éviter de partager des données privées entre utilisateurs.
- Définir explicitement la durée de validité lorsque nécessaire.
- Prévoir l'invalidation après les modifications concernées.
- Ne pas multiplier plusieurs niveaux de cache sans justification.
- Vérifier le comportement du cache Next.js utilisé dans la version du projet.

Ne jamais introduire un cache uniquement parce qu'il est présenté comme une bonne pratique.

### 6.2 Données privées

Les données dépendant de l'identité d'un utilisateur doivent être isolées correctement.

Vérifier les mécanismes de cache et de rendu afin d'éviter qu'une réponse privée soit réutilisée dans un contexte utilisateur différent.

En cas d'incertitude, privilégier un comportement qui garantit la confidentialité plutôt qu'une optimisation risquée.

## 7. Performance des API et Route Handlers

Les Route Handlers doivent rester simples et efficaces.

- Éviter les traitements inutiles avant l'appel du Use Case.
- Ne pas effectuer plusieurs fois la même validation.
- Ne pas charger des données dont la réponse n'a pas besoin.
- Limiter la taille des requêtes entrantes.
- Prévoir une pagination pour les collections volumineuses.
- Éviter les appels successifs à des services externes lorsqu'ils peuvent être organisés efficacement.
- Ne pas bloquer une réponse avec un traitement qui n'est pas nécessaire à son résultat.

Les opérations longues doivent être étudiées selon leur nature et les besoins fonctionnels.

Ne pas introduire automatiquement un système de tâches asynchrones ou de files de messages sans besoin démontré.

## 8. Performance des services externes

TopDeal utilise notamment Firebase et MinIO.

Les appels à des services externes doivent être maîtrisés.

- Éviter les appels répétés pour obtenir une information déjà disponible.
- Regrouper les opérations lorsque l'API le permet et que cela reste pertinent.
- Prévoir des délais d'attente adaptés.
- Gérer les échecs sans provoquer de boucles de tentatives incontrôlées.
- Éviter les appels externes inutiles pendant le rendu.
- Examiner les limites de débit des fournisseurs.

Ne pas introduire de mécanisme de retry systématique.

Lorsqu'une nouvelle tentative est nécessaire, tenir compte de la nature de l'opération et du risque de duplication d'une action.

## 9. Gestion des images et fichiers

Les ressources multimédias peuvent avoir un impact important sur les performances.

- Adapter les dimensions des images à leur utilisation.
- Éviter de charger des images trop volumineuses.
- Utiliser les mécanismes d'optimisation disponibles dans Next.js lorsqu'ils sont adaptés.
- Prévoir le chargement différé des images non prioritaires.
- Ne pas charger les fichiers complets lorsqu'une version réduite suffit.
- Limiter les transferts inutiles.
- Adapter les formats aux besoins des navigateurs et des usages.

Pour les fichiers stockés dans MinIO, choisir une stratégie de distribution cohérente avec les besoins de confidentialité et de disponibilité.

## 10. Performance de l'interface

L'interface doit rester réactive et compréhensible.

- Éviter les composants inutilement lourds.
- Éviter les animations excessives.
- Éviter les mises à jour d'état trop fréquentes.
- Prévoir des états de chargement adaptés.
- Éviter les changements visuels inutiles lors du chargement des données.
- Utiliser la virtualisation uniquement lorsque la taille des listes le justifie.
- Éviter de charger simultanément des éléments qui ne sont pas visibles ou nécessaires.

La performance ne doit pas être obtenue au détriment de l'accessibilité ou de l'expérience utilisateur.

## 11. Bundle JavaScript

Limiter la quantité de JavaScript envoyée au navigateur.

- Éviter les dépendances volumineuses lorsqu'une solution plus légère existe.
- Ne pas importer une bibliothèque complète lorsqu'une partie seulement est nécessaire et que les imports ciblés sont disponibles.
- Éviter de placer des dépendances serveur dans les composants client.
- Séparer les fonctionnalités lourdes lorsque le chargement différé est pertinent.
- Examiner l'impact des nouvelles dépendances sur le bundle.

Ne pas remplacer une bibliothèque utile uniquement pour économiser quelques kilo-octets sans mesurer l'impact réel.

## 12. Observabilité et mesure

Une optimisation doit s'appuyer sur des éléments observables.

Selon le problème rencontré, examiner :

- le temps de réponse des API ;
- le temps de rendu ;
- le nombre de requêtes ;
- les requêtes SQL lentes ;
- le volume des données transférées ;
- le poids du bundle ;
- les erreurs et les délais d'attente ;
- les indicateurs de performance Web pertinents.

Utiliser les outils déjà disponibles dans le projet avant d'ajouter un système d'observabilité supplémentaire.

Lorsqu'un problème est identifié :

1. Reproduire le problème.
2. Mesurer son impact.
3. Identifier sa cause.
4. Appliquer une correction ciblée.
5. Mesurer à nouveau.
6. Vérifier que la correction n'a pas introduit de régression.

## 13. Gestion de la concurrence et des traitements

Certaines opérations peuvent être coûteuses lorsqu'elles sont exécutées simultanément.

- Éviter les appels concurrents inutiles.
- Contrôler la concurrence des traitements coûteux.
- Éviter de lancer un grand nombre de requêtes simultanément.
- Respecter les limites des services externes.
- Éviter les traitements répétés qui produisent le même résultat.
- Ne pas introduire de parallélisme lorsque les opérations dépendent les unes des autres.

Le parallélisme doit être utilisé uniquement lorsque les opérations sont réellement indépendantes et que les ressources peuvent le supporter.

## 14. Méthode de travail

Avant toute optimisation :

1. Identifier le problème observé.
2. Déterminer la partie de l'application concernée.
3. Examiner le code existant.
4. Mesurer lorsque cela est possible.
5. Identifier la cause principale.
6. Choisir la correction la plus simple.
7. Vérifier l'impact sur les autres couches.
8. Comparer les résultats avant et après.
9. Ajouter des tests lorsque le comportement fonctionnel est concerné.

Ne pas refactoriser toute une fonctionnalité pour résoudre un problème local.

Ne pas modifier plusieurs mécanismes simultanément lorsque cela empêche d'identifier l'effet de chaque changement.

## 15. Anti-sur-ingénierie

Éviter les optimisations prématurées.

Ne pas :

- ajouter un cache sans besoin identifié ;
- utiliser systématiquement `useMemo` et `useCallback` ;
- introduire Redis sans justification ;
- ajouter une file de messages pour quelques opérations simples ;
- créer une couche de performance générique ;
- multiplier les stratégies de chargement ;
- ajouter des index sans examiner les requêtes ;
- remplacer des outils existants sans bénéfice démontré ;
- complexifier les composants pour éviter des rendus sans conséquence réelle.

Privilégier les optimisations simples, ciblées et mesurables.

## 16. Checklist avant validation

- [ ] Les traitements inutiles ont été évités.
- [ ] Les composants client sont limités aux besoins réels.
- [ ] Les données récupérées sont nécessaires.
- [ ] Les requêtes Prisma sont adaptées.
- [ ] Les risques de N+1 ont été examinés.
- [ ] Les collections volumineuses sont paginées lorsque nécessaire.
- [ ] Les index répondent à des requêtes identifiées.
- [ ] Les appels externes sont maîtrisés.
- [ ] Le cache, s'il existe, respecte les règles de cohérence et de confidentialité.
- [ ] Les images et fichiers sont adaptés à leur usage.
- [ ] Les nouvelles dépendances ont un impact justifié.
- [ ] Les optimisations ne dégradent pas la lisibilité.
- [ ] Les performances ont été mesurées lorsque le problème le permet.
- [ ] Aucune complexité inutile n'a été introduite.

## 17. Règle finale

TopDeal doit être performant sans devenir difficile à maintenir.

La priorité est de construire un code efficace par sa conception : responsabilités claires, requêtes maîtrisées, données limitées et traitements nécessaires uniquement.

Une optimisation doit résoudre un problème identifié ou répondre à un besoin concret. Elle ne doit jamais devenir une source de complexité supérieure au bénéfice obtenu.