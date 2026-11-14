---
name: performance
description: À appliquer lors de toute création, modification, revue ou optimisation du code TopDeal, en particulier pour les accès aux données, recherches, listes, filtres, API, composants React, chargements de pages et traitements coûteux. Prioriser un code simple, des réponses rapides, la pagination côté serveur et des performances mesurées.
---

# Skill Performance — TopDeal

## 1. Mission

Construire une application TopDeal rapide, réactive et sobre, avec un code aussi simple que possible.

La performance doit être prise en compte dès la conception de chaque fonctionnalité, et pas seulement après l'apparition d'un problème. Les recherches, filtres et listes doivent être conçus pour éviter de charger inutilement de grandes quantités de données.

L'objectif est de réduire autant que possible :
- le temps nécessaire pour afficher une page ;
- le temps de réponse des API ;
- le temps de récupération et de traitement des données ;
- le volume de données transférées ;
- le nombre de requêtes inutiles ;
- les calculs et rendus inutiles dans le navigateur.

**Ne promets jamais une absence totale de latence.** Les performances dépendent aussi du réseau, du serveur, de la base de données, de l'hébergement et du terminal. Cherche des performances mesurables et adaptées à l'expérience attendue, puis signale les limites réelles.

## 2. Règles non négociables

1. Préférer la solution la plus simple qui répond au besoin avec de bonnes performances.
2. Ne jamais charger toute une collection lorsque seule une partie des éléments doit être affichée.
3. Toute liste ou recherche susceptible de retourner un nombre important ou non borné d'éléments doit utiliser une pagination côté serveur.
4. Appliquer les filtres, tris et limites dans la requête de données, et non après avoir téléchargé tous les résultats.
5. Ne récupérer que les champs réellement nécessaires à l'écran ou au traitement.
6. Éviter les requêtes répétées, les accès en cascade et le problème N+1.
7. Mesurer ou diagnostiquer avant d'introduire une optimisation complexe.
8. Ne pas sacrifier la sécurité, la cohérence des données ou la lisibilité pour gagner un temps marginal.
9. Ne pas ajouter de cache, de Redis, de traitement asynchrone ou d'architecture distribuée sans besoin démontré.
10. Toute optimisation doit préserver le comportement fonctionnel attendu.

## 3. Pagination obligatoire pour les listes et recherches

### 3.1 Principe général

Pour les annonces, commandes, utilisateurs, conversations, notifications, favoris, résultats de recherche et toute autre collection potentiellement volumineuse :

- La récupération doit être limitée à une page de résultats.
- La pagination doit être exécutée côté serveur ou dans la couche de données.
- La base de données doit appliquer les filtres, le tri et la limite avant de retourner les résultats.
- Le frontend ne doit pas télécharger toute la collection pour ensuite la découper avec `slice`.
- Le nombre d'éléments par page doit être limité et contrôlé côté serveur.
- La réponse doit fournir les informations nécessaires à la navigation : éléments, taille de page et indicateur ou curseur permettant de continuer.
- Le tri doit être déterministe : ajouter un critère secondaire unique lorsque le critère principal peut produire des égalités.

Ne pas utiliser une taille de page illimitée ou accepter aveuglément la taille demandée par le client.

### 3.2 Choisir le type de pagination

**Pagination par numéro / décalage (`offset` / `limit`)**

À utiliser lorsque :
- le besoin nécessite d'aller directement à une page précise ;
- les volumes sont modestes ou les décalages restent raisonnables ;
- le coût de comptage et de décalage est acceptable après vérification.

Limites :
- les grandes valeurs de décalage peuvent devenir coûteuses ;
- les insertions ou suppressions pendant la navigation peuvent provoquer des doublons ou des éléments manquants selon le tri ;
- un comptage total peut être coûteux.

**Pagination par curseur (`cursor`)**

À privilégier pour les flux et listes volumineuses ou régulièrement alimentées :
- navigation vers les éléments suivants ;
- défilement progressif ;
- pagination stable basée sur un ordre déterministe ;
- meilleure maîtrise des grandes collections lorsque le curseur s'appuie sur un index adapté.

Le curseur doit être validé côté serveur et ne doit pas être considéré comme une preuve d'autorisation. Le critère de tri utilisé doit être stable et suffisamment unique.

Ne choisis pas un type de pagination uniquement par habitude. Respecte le besoin de navigation et vérifie le coût réel des requêtes.

### 3.3 Recherche et filtres

Pour chaque recherche :
- appliquer les critères dans la requête côté serveur ;
- valider les critères et limiter leur complexité ;
- limiter le nombre de résultats ;
- définir un tri explicite et stable ;
- paginer les résultats ;
- éviter de charger des détails non affichés dans la liste ;
- prévoir un état vide et un état de chargement dans l'interface ;
- éviter de relancer la recherche à chaque frappe sans stratégie adaptée.

Pour une recherche déclenchée pendant la saisie, envisager un délai anti-rebond (*debounce*) côté interface. Le debounce réduit le nombre de requêtes, mais ne remplace jamais la pagination ni les limites côté serveur.

Ne pas inventer les règles fonctionnelles de recherche, les champs recherchables ou le comportement des filtres.

### 3.4 Comptage des résultats

Le nombre total de résultats peut être coûteux à calculer.

- Ne pas effectuer systématiquement un comptage exact si l'interface n'en a pas besoin.
- Si seul le fait qu'une page suivante existe est nécessaire, envisager de récupérer un élément supplémentaire pour déterminer `hasNextPage`.
- Si un total exact est nécessaire, mesurer son coût et le traiter séparément si cela est justifié.
- Ne pas afficher un total approximatif comme s'il était exact.

## 4. Requêtes de base de données

PostgreSQL et Prisma sont les choix actuels de TopDeal, mais les principes doivent rester applicables si ces technologies changent.

- Sélectionner uniquement les colonnes nécessaires (`select` ou équivalent).
- Appliquer `where`, `orderBy`, `take` et les critères de pagination au niveau de la base.
- Éviter de récupérer une collection complète pour filtrer ou trier en mémoire.
- Éviter les chargements relationnels excessifs.
- Identifier et prévenir les requêtes N+1.
- Utiliser des jointures ou chargements groupés adaptés au besoin, sans charger toutes les relations par défaut.
- Examiner les requêtes générées lorsque le coût n'est pas évident.
- Utiliser `EXPLAIN` / `EXPLAIN ANALYZE` dans un environnement approprié pour comprendre les requêtes coûteuses.
- Ajouter des index en fonction des filtres, tris, jointures et contraintes réellement utilisés.
- Éviter les index redondants ou ajoutés sans justification.
- Éviter les recherches non indexables sur de grandes tables lorsque des alternatives adaptées existent.
- Utiliser des transactions uniquement lorsque la cohérence de plusieurs opérations l'exige ; ne pas étendre inutilement leur durée.
- Ne pas effectuer de traitement lourd ou d'appel externe à l'intérieur d'une transaction longue.

Ne suppose pas qu'une méthode ORM est rapide simplement parce qu'elle est courte. Vérifie le SQL généré et le plan d'exécution lorsque nécessaire.

## 5. Architecture et évolutivité

La performance ne doit pas détruire les frontières d'architecture TopDeal.

- Respecter les couches `domain`, `data` et `presentation`.
- Garder Prisma dans la couche Data.
- Ne pas introduire de dépendance technique dans le domaine pour optimiser une requête.
- Les cas d'utilisation doivent demander les données nécessaires au besoin, sans retourner systématiquement des objets complets.
- Les contrats de repository doivent exprimer les besoins de lecture et de pagination de manière claire.
- Éviter les interfaces génériques de pagination trop complexes si une structure simple suffit.
- Les optimisations spécifiques à une base ou un fournisseur doivent rester dans l'adaptateur correspondant.
- Ne pas exposer les types Prisma dans les contrats du domaine.

Une optimisation doit rester remplaçable avec l'adaptateur de persistance lorsque c'est raisonnablement possible.

## 6. API et transfert des données

- Retourner des réponses compactes, adaptées à l'écran.
- Ne pas envoyer des images originales ou des fichiers volumineux dans les réponses de liste.
- Utiliser des miniatures adaptées aux vues de liste lorsque le besoin produit le justifie.
- Éviter les champs redondants et les objets imbriqués trop volumineux.
- Limiter la taille des requêtes et réponses.
- Éviter les appels API multiples qui pourraient être regroupés sans créer un endpoint excessivement général.
- Ne pas créer un endpoint spécifique pour chaque petit composant si cela multiplie inutilement les appels.
- Gérer les délais d'attente et les erreurs des services externes.
- Éviter les appels séquentiels lorsqu'ils sont indépendants et peuvent être exécutés en parallèle en toute sécurité.
- Ne pas paralléliser des opérations dépendantes ou qui risquent de surcharger la base.

## 7. Performance du frontend — Next.js et React

- Éviter les composants inutilement volumineux et les rendus déclenchés sans raison.
- Garder les composants simples et avec une responsabilité claire.
- Ne pas transformer automatiquement chaque composant en composant mémoïsé.
- Utiliser `memo`, `useMemo` et `useCallback` uniquement lorsqu'un coût ou un problème de rendu est identifié ou raisonnablement prévisible.
- Éviter les états dupliqués et les effets qui déclenchent des boucles de récupération.
- Charger les données au niveau adapté au parcours Next.js retenu.
- Éviter de transformer inutilement des composants serveur en composants client.
- Réduire le JavaScript envoyé au navigateur.
- Charger à la demande les composants lourds qui ne sont pas nécessaires immédiatement.
- Utiliser les mécanismes Next.js adaptés pour les images, polices et ressources.
- Définir des dimensions ou proportions d'images pour limiter les déplacements de mise en page.
- Afficher rapidement une structure utile : état de chargement, squelette ou contenu progressif selon le cas.
- Annuler ou ignorer les réponses obsolètes lorsqu'une nouvelle recherche remplace la précédente.
- Éviter que plusieurs composants déclenchent indépendamment la même récupération de données.

Ne pas ajouter de complexité de gestion d'état ou de cache frontend sans besoin démontré.

## 8. Recherche réactive

Pour une recherche interactive :

- utiliser un délai anti-rebond raisonnable lorsque la recherche part pendant la saisie ;
- annuler les requêtes précédentes lorsque le mécanisme utilisé le permet ;
- éviter d'afficher les résultats d'une ancienne requête après une requête plus récente ;
- réinitialiser ou adapter la pagination lorsque les critères de recherche changent ;
- conserver un ordre de tri déterministe ;
- ne pas charger automatiquement un nombre illimité de résultats ;
- afficher clairement le chargement, l'absence de résultat et les erreurs.

La recherche doit rester rapide côté serveur : le debounce ne corrige pas une requête de base de données inefficace.

## 9. Cache

Le cache est un outil, pas une obligation.

Avant d'ajouter un cache, répondre à ces questions :
1. Quel problème mesuré cherche-t-on à résoudre ?
2. Quelles données peuvent être réutilisées ?
3. Combien de temps peuvent-elles rester valides ?
4. Comment invalider ou actualiser les données après une modification ?
5. Quel risque de servir des données périmées ou appartenant à un autre utilisateur existe-t-il ?
6. Le coût de gestion du cache est-il inférieur au bénéfice attendu ?

- Ne pas mettre en cache des données privées sans une séparation stricte par utilisateur et par autorisation.
- Ne jamais laisser une réponse privée être servie à un autre utilisateur par un cache partagé.
- Définir explicitement la durée de vie et la stratégie d'invalidation.
- Éviter les caches multiples qui rendent le comportement difficile à comprendre.
- Ne pas ajouter Redis uniquement parce qu'il est réputé rapide.
- Commencer par optimiser les requêtes et le transfert de données avant d'ajouter une couche de cache.

## 10. Traitements coûteux et tâches en arrière-plan

- Identifier les opérations coûteuses ou longues.
- Ne pas bloquer une réponse HTTP pour un travail qui peut raisonnablement être exécuté en arrière-plan.
- Envisager une file de tâches uniquement lorsque le besoin est réel : génération de documents, traitement de fichiers, envoi massif de notifications ou calcul long.
- Rendre les tâches répétables sans produire d'effets en double lorsque c'est nécessaire.
- Définir les erreurs, reprises et limites de concurrence.
- Ne pas introduire un système de files ou de microservices pour une opération simple et rapide.

## 11. Images et ressources statiques

- Utiliser des formats et dimensions adaptés à l'usage.
- Éviter de télécharger une image haute résolution dans une petite carte de résultat.
- Prévoir des miniatures pour les listes lorsque cela apporte un bénéfice réel.
- Charger les ressources non visibles immédiatement de manière différée lorsque c'est approprié.
- Éviter les bibliothèques d'icônes ou composants qui ajoutent un poids disproportionné.
- Ne pas charger plusieurs fois la même ressource.
- Ne pas sacrifier la qualité visuelle au-delà de ce que le besoin produit autorise.

## 12. Mesure et diagnostic

Ne pas optimiser à l'aveugle.

Selon la tâche, mesurer ou examiner :
- temps de réponse API ;
- durée des requêtes SQL ;
- nombre de requêtes par page ;
- volume de données retourné ;
- taille du JavaScript client ;
- temps de chargement et de rendu ;
- fréquence des rendus React ;
- consommation mémoire ;
- erreurs, délais d'attente et échecs de récupération.

Comparer avant et après une optimisation lorsque les outils et l'environnement le permettent.

Ne pas inventer de mesures. Si aucun environnement de mesure n'est disponible, le signaler et expliquer ce qui a été vérifié statiquement.

## 13. Simplicité et absence de sur-optimisation

La simplicité est une exigence au même titre que la rapidité.

- Préférer un algorithme clair et adapté au volume réel.
- Éviter les abstractions prématurées.
- Ne pas introduire de stratégie de cache, de worker, de file, de microservice ou de couche de préchargement sans justification.
- Ne pas multiplier les états, hooks, couches ou appels réseau.
- Ne pas utiliser un pattern complexe pour gagner un bénéfice hypothétique.
- Ne pas optimiser un code qui n'est pas un goulot d'étranglement au détriment de la lisibilité.
- Supprimer les traitements et données inutiles plutôt que d'ajouter une couche pour les accélérer.

Exemple : pour une liste d'annonces, une requête filtrée, triée et paginée avec les bons index est préférable au chargement de toutes les annonces, suivi d'un filtrage en mémoire et d'un cache ajouté pour masquer le problème.

## 14. Procédure de travail

Avant de coder :
1. Identifier le parcours utilisateur et les données nécessaires.
2. Estimer si la collection ou le traitement peut croître.
3. Définir la pagination et le tri si une liste est concernée.
4. Identifier les filtres, champs retournés et relations nécessaires.
5. Examiner les requêtes et mécanismes déjà présents.
6. Identifier les risques de requêtes répétées ou de N+1.
7. Choisir la solution la plus simple qui répond au besoin.

Pendant le développement :
- paginer les listes côté serveur ;
- filtrer et trier avant le transfert ;
- limiter les champs retournés ;
- garder les composants et cas d'utilisation simples ;
- respecter l'architecture et les règles de sécurité ;
- éviter les optimisations non justifiées.

Après le développement :
1. Vérifier que la pagination fonctionne sur plusieurs pages.
2. Vérifier que les filtres et tris sont appliqués côté serveur.
3. Vérifier les cas de page vide, dernière page et critères modifiés.
4. Examiner les requêtes et leur nombre.
5. Mesurer les performances lorsque l'environnement le permet.
6. Signaler les limites et les optimisations restant à faire.

## 15. Compte rendu attendu

Pour une tâche ayant un impact sur les performances, indiquer :
- **Périmètre :** page, API, cas d'utilisation et requêtes concernés.
- **Optimisations :** pagination, filtres serveur, sélection de champs, index, réduction des appels, etc.
- **Mesures :** résultats réellement observés avant/après, si disponibles.
- **Vérifications :** tests de pagination, requêtes, rendu ou build exécutés.
- **Limites :** éléments non mesurés, dépendances réseau ou infrastructure et risques restants.

Ne jamais affirmer que l'application est « ultra rapide » sans mesure. Expliquer les améliorations concrètes et les conditions de mesure.

## 16. Checklist — définition de terminé

- [ ] Le code reste simple et lisible.
- [ ] Les listes potentiellement volumineuses sont paginées côté serveur.
- [ ] Les filtres et tris sont exécutés avant le transfert des données.
- [ ] Le tri est déterministe.
- [ ] La taille de page est limitée et contrôlée.
- [ ] Seuls les champs nécessaires sont récupérés et retournés.
- [ ] Aucun chargement complet suivi d'un `slice` côté frontend n'est utilisé pour une grande collection.
- [ ] Les requêtes N+1 et récupérations répétées ont été examinées.
- [ ] Les index correspondent aux requêtes réelles lorsqu'ils sont nécessaires.
- [ ] Les réponses API restent compactes.
- [ ] Les rendus et appels réseau frontend inutiles sont évités.
- [ ] Le cache ou les traitements en arrière-plan ne sont ajoutés qu'avec une justification.
- [ ] La sécurité et la cohérence ne sont pas sacrifiées à la performance.
- [ ] Les mesures sont réelles ou leur absence est clairement signalée.
