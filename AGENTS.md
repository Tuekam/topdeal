
# AGENTS.md — Instructions globales du projet TopDeal

Ce fichier définit les règles communes que tout agent de développement doit respecter lorsqu'il intervient sur TopDeal.

Il complète les skills spécialisés du projet. En cas de besoin, l'agent doit consulter le skill concerné avant de prendre une décision ou de modifier le code.

---

## 1. Mission de l'agent

Tu interviens comme un ingénieur logiciel expérimenté chargé de faire évoluer TopDeal avec une architecture claire, maintenable et fortement évolutive.

Tes priorités, dans cet ordre, sont :

1. Respecter le besoin fonctionnel réellement exprimé.
2. Préserver les règles métier et les décisions déjà validées.
3. Limiter le couplage entre le métier et les technologies.
4. Produire une solution simple, lisible, testable et maintenable.
5. Garantir de bonnes performances et une récupération rapide des données.
6. Protéger les données et les opérations sensibles.
7. Éviter les abstractions, dépendances et fonctionnalités non nécessaires.

Ne considère jamais une proposition, un exemple ou une hypothèse comme une décision validée sans confirmation explicite.

## 2. Skills du projet
les skills sont situes dans .agent/skill

Des skills spécialisés complètent ce fichier. Consulte-les dès qu'ils sont pertinents pour la tâche.

| Skill | À consulter pour |
|---|---|
| `architecture` | Structure du monorepo, responsabilités des couches, dépendances, flux entre les couches et règles d'architecture |
| `design-system` | Interfaces, composants visuels, styles, responsive, états d'interface et cohérence graphique |
| `nomenclature` | Noms des fichiers, dossiers, classes, interfaces, fonctions, hooks et autres éléments |
| `evolutivite` | Découplage technologique, ports/adapters, remplaçabilité des infrastructures, choix d'abstractions et revues de code |
| `securite` | Authentification, autorisations, validation, protection des données, API, fichiers, opérations sensibles et intégrations externes |
| `performance` | Temps de réponse, accès aux données, pagination, recherche, requêtes, indexation, chargement frontend et mesure des performances |
| `transactions-evolutives` | Paiements, versements, remboursements, traitement manuel actuel et futures intégrations avec des agrégateurs ou API d'opérateurs |

Si les skills ne sont pas directement disponibles dans l'environnement, demande leur emplacement ou leur contenu au lieu d'inventer leurs règles.

Pour toute création ou modification de code, consulte au minimum les skills `architecture`, `nomenclature` et `evolutivite`.

Consulte également :

- `design-system` dès que la tâche touche à l'interface.
- `securite` dès que la tâche touche à l'authentification, aux autorisations, aux données sensibles, aux API, aux fichiers ou à une opération sensible.
- `performance` dès que la tâche touche aux requêtes, à la recherche, à la pagination, au chargement ou à la récupération des données.
- `transactions-evolutives` dès que la tâche touche aux paiements, transactions, versements, remboursements, confirmations ou fournisseurs de paiement.

En cas de contradiction apparente, ne choisis pas arbitrairement : identifie la règle concernée et demande une clarification si la décision ne peut pas être déduite des choix déjà validés.

## 3. Contexte et objectif de TopDeal

TopDeal est une plateforme de marketplace destinée au contexte de Bafoussam, au Cameroun.

Le projet doit pouvoir évoluer sans rendre coûteux le remplacement d'une technologie. Par exemple, le choix actuel d'une base relationnelle ne doit pas rendre impossible une migration future vers une base NoSQL ; le choix de Prisma ne doit pas rendre l'ensemble du métier dépendant de Prisma.

L'évolutivité est une exigence d'architecture, pas une raison pour multiplier les couches ou anticiper tous les scénarios imaginables.

Ne crée pas de règles métier, de parcours utilisateur, de garanties commerciales ou de fonctionnalités qui n'ont pas été validés.

## 4. Décisions techniques et structurelles validées

Les éléments ci-dessous représentent les décisions actuellement retenues. Ils pourront changer si le propriétaire du projet le demande.

### 4.1 Organisation générale

- Le projet utilise un monorepo géré avec pnpm workspaces.
- Aucun dossier `src` ne doit être créé, ni à la racine des applications, ni dans les packages.
- L'organisation est orientée fonctionnalités (*feature-first*).
- Les fonctionnalités possèdent leurs propres responsabilités `domain`, `data` et `presentation`.
- `packages/core` contient uniquement les éléments réellement transversaux.
- L'application Web est dans `apps/web`.
- Le projet doit éviter les dossiers globaux fourre-tout tels que `repositories/`, `use-cases/` ou `services/` à la racine pour y centraliser le code de toutes les fonctionnalités.

### 4.2 Technologies retenues actuellement

| Domaine | Choix actuel |
|---|---|
| Monorepo | pnpm workspaces |
| Application Web | Next.js App Router, React, TypeScript |
| Styles | Tailwind CSS, en respectant le Design System |
| Injection de dépendances | Awilix |
| Base de données actuelle | PostgreSQL |
| Accès aux données actuel | Prisma |
| Authentification actuelle | Firebase Auth, derrière une abstraction |
| Stockage de fichiers actuel | MinIO, compatible avec l'API S3 |
| Contrat d'API à prévoir | OpenAPI |
| Client mobile envisagé | Kotlin Multiplatform |

Ces choix ne doivent pas devenir des dépendances directes du domaine métier. Une technologie envisagée pour plus tard ne doit pas être implémentée prématurément.

### 4.3 Packages et fonctionnalités

- Les packages partagés sont regroupés sous `packages/`.
- Le namespace de packages est `@topdeal`, par exemple `@topdeal/ui` et `@topdeal/feature-annonce`.
- Chaque fonctionnalité est isolée dans son package, par exemple `packages/features/annonce`.
- Une fonctionnalité peut contenir :
  - `domain/` : règles métier, modèles métier, cas d'utilisation et contrats nécessaires ;
  - `data/` : implémentations d'accès aux données, adaptateurs et transformations ;
  - `presentation/` : éléments de présentation propres à la fonctionnalité.
- Ne crée que les sous-dossiers et fichiers utiles. Une structure théorique ne justifie pas la création de dossiers vides.

Fonctionnalités identifiées à ce stade :

`auth`, `annonce`, `commande`, `paiement`, `conversation`, `favoris`, `proposition`, `versement`, `remboursement`, `troc`, `affiliation`, `verification-identite`, `notification`, `litige`, `support`, `administration`.

N'ajoute pas automatiquement toutes ces fonctionnalités au code si elles ne sont pas encore nécessaires au périmètre en cours.

### 4.4 Responsabilités des couches

**Domain**
- Contient les règles métier et les cas d'utilisation.
- Ne dépend pas de Prisma, Firebase, Next.js, React, Awilix ou d'une implémentation concrète de la couche Data.
- Définit les contrats dont le métier a besoin lorsque cela est justifié.
- Ne contient pas de types propres à un ORM ou à un fournisseur externe.

**Data**
- Implémente les contrats utilisés par le domaine.
- Contient les accès à Prisma et les intégrations avec les fournisseurs externes.
- Convertit les données techniques en modèles attendus par le domaine.
- Ne doit pas faire remonter les objets Prisma ou SDK externes dans le domaine.

**Presentation**
- Contient les composants, hooks et états de présentation de la fonctionnalité.
- Ne doit pas contenir les règles métier complexes ni accéder directement à Prisma.
- Utilise les mécanismes d'accès aux cas d'utilisation prévus par l'architecture.

**apps/web**
- Contient les routes Next.js, les points d'entrée HTTP, les providers, la configuration et le démarrage de l'application.
- Contient le conteneur DI et le Composition Root.
- Les Route Handlers valident la requête, appliquent les contrôles liés au protocole et à l'accès, puis appellent les cas d'utilisation via le mécanisme prévu.
- Un Route Handler ne doit pas appeler Prisma ou un repository concret directement.

**packages/core**
- Contient uniquement les modèles, interfaces, enums, erreurs et utilitaires purs réellement partagés par plusieurs fonctionnalités.
- Ne devient pas un emplacement par défaut pour du code qui ne trouve pas sa place ailleurs.
- Un élément utilisé par une seule fonctionnalité reste dans cette fonctionnalité.

**packages/ui**
- Contient les composants visuels réutilisables.
- Ne contient pas de règles métier propres à une fonctionnalité.

## 5. Règles d'évolutivité et de découplage

L'agent doit concevoir le code pour que les technologies d'infrastructure puissent être remplacées avec un impact limité sur le métier.

- Le domaine ne doit pas importer les bibliothèques d'infrastructure.
- Les dépendances doivent être orientées vers les contrats métier, pas vers les implémentations techniques.
- Les implémentations concrètes sont assemblées au niveau du Composition Root.
- Les modèles métier doivent être séparés des DTO HTTP, des modèles Prisma et des types de SDK.
- Une dépendance externe doit être isolée derrière un contrat lorsque son remplacement ou son indépendance est un besoin réel.
- Ne crée pas systématiquement une interface pour chaque classe ou fonction.
- Ne crée pas de repository générique universel sans besoin concret.
- Ne multiplie pas les couches de mapping si elles n'apportent aucune séparation utile.
- N'introduis pas un design pattern uniquement pour appliquer un principe de manière théorique.

Exemples d'objectifs :
- Remplacer Prisma sans réécrire les cas d'utilisation.
- Remplacer PostgreSQL par une autre technologie de persistance en réévaluant explicitement les différences de comportement.
- Remplacer Firebase Auth ou MinIO sans propager leurs types dans le domaine.

Une migration technologique n'est jamais automatiquement sans coût : l'agent doit signaler les différences de transactions, cohérence, contraintes, requêtes, recherche, pagination, unicité ou performances qui peuvent affecter le métier.

## 6. Injection de dépendances

- Awilix est utilisé pour l'injection de dépendances dans l'application Web.
- Le conteneur et l'assemblage des implémentations techniques appartiennent à `apps/web`.
- Les fonctionnalités ne doivent pas importer le conteneur global.
- Le domaine ne doit pas connaître Awilix.
- Évite le Service Locator : une classe ou un cas d'utilisation doit recevoir explicitement ses dépendances.
- N'ajoute pas de résolution dynamique ou de dépendance globale cachée.

## 7. Interface utilisateur et Design System

Pour toute tâche d'interface, le skill `design-system` fait autorité pour les détails visuels.

Rappels importants :
- Utiliser React, TypeScript et Tailwind CSS selon les conventions du projet.
- Réutiliser les composants partagés plutôt que recopier les mêmes styles.
- Ne pas inventer une nouvelle palette, typographie, échelle d'espacement ou convention visuelle.
- Respecter les versions responsive mobile, tablette et desktop.
- Prévoir les états utiles : chargement, vide, erreur, succès et désactivation lorsque pertinents.
- Les tableaux doivent avoir une présentation adaptée aux petits écrans.
- Ne pas ajouter d'ombres, de couleurs ou d'effets décoratifs qui contredisent le Design System.
- Ne pas inventer de promesses produit telles que « annonces vérifiées », « remboursement automatique » ou « 100 % sécurisé ».

Les règles métier validées priment sur les éléments purement illustratifs d'une maquette. En particulier :
- Ne pas créer de portefeuille utilisateur.
- Ne pas ajouter de solde disponible ou de retrait de portefeuille.
- Pour les vues de suivi concernées, utiliser l'historique des versements lorsque cela correspond au besoin validé.

## 8. Qualité du code et principes de conception

Applique les principes de conception avec discernement :

- **SOLID** : lorsque cela améliore réellement la séparation des responsabilités et la capacité d'évolution.
- **DRY** : factoriser les duplications significatives, sans créer une abstraction plus complexe que le code répété.
- **KISS** : préférer la solution la plus simple qui répond correctement au besoin.
- **YAGNI** : ne pas développer une fonctionnalité ou une abstraction hypothétique.
- **Modularité** : maintenir des frontières claires et des dépendances maîtrisées.
- **Performance** : mesurer ou identifier un problème réel avant d'ajouter une optimisation complexe.
- **Sécurité** : valider les entrées, contrôler les autorisations côté serveur et ne jamais exposer de secrets.

Exemple : si une règle de calcul est unique et stable, une méthode simple peut suffire. N'introduis pas un Strategy Pattern tant qu'il n'existe pas plusieurs stratégies réelles à sélectionner.

Ne cherche pas à appliquer tous les design patterns. Explique le problème concret qu'un pattern résout avant de l'introduire.

## 9. Sécurité et données

- Ne place jamais de secret, clé privée, mot de passe ou jeton sensible dans le code versionné.
- Utilise les variables d'environnement et ne publie pas leur valeur.
- Valide les données reçues aux frontières du système.
- Vérifie les autorisations côté serveur ; masquer un bouton dans l'interface ne constitue pas un contrôle d'accès.
- Ne fais pas confiance aux identifiants, prix, statuts ou rôles transmis par le client sans validation serveur.
- Évite de journaliser des données personnelles, des secrets ou des informations sensibles.
- N'ajoute pas de collecte de données personnelles sans nécessité fonctionnelle.
- Les opérations sensibles doivent respecter les règles métier et les contrôles d'accès définis.
- Pour les tâches de sécurité, consulte obligatoirement le skill `securite`.

## 9.1. Exigences de performance

La rapidité de l'application est une exigence transversale. L'agent doit privilégier des solutions simples qui évitent les chargements inutiles et les traitements coûteux.

- Toute liste ou recherche susceptible de contenir beaucoup de résultats doit utiliser une pagination côté serveur.
- Ne récupère pas tous les enregistrements pour les filtrer ou les paginer ensuite dans le frontend.
- Applique les filtres, tris et limites au niveau de la base de données lorsque cela est pertinent.
- Ne récupère que les champs nécessaires à l'écran ou au cas d'utilisation.
- Évite les requêtes répétitives, les problèmes N+1 et les appels réseau inutiles.
- Évite les chargements successifs inutiles lorsque les données peuvent être récupérées efficacement.
- N'ajoute pas de cache sans besoin identifié, stratégie d'invalidation et cohérence maîtrisée.
- Mesure ou diagnostique les lenteurs avant d'introduire une optimisation complexe.
- Ne sacrifie pas la cohérence des données pour obtenir artificiellement de meilleures performances.
- Consulte le skill `performance` pour toute tâche touchant aux données, recherches, listes, pagination ou temps de réponse.

Le but est une application rapide et prévisible, sans sacrifier la simplicité, la cohérence des données ou la maintenabilité.

## 10. Transactions et évolutivité des paiements

Le traitement des transactions est actuellement manuel. Cela décrit le fonctionnement opérationnel actuel, pas une contrainte d'architecture permanente.

Le code doit préserver le parcours manuel tout en permettant l'ajout futur d'agrégateurs de paiement ou d'API d'opérateurs sans réécrire les règles métier.

Règles fondamentales :

- Les règles métier des transactions doivent rester indépendantes du fournisseur et du mode de traitement.
- Les intégrations concrètes doivent être isolées derrière des ports et des adaptateurs.
- Les Use Cases ne doivent jamais dépendre directement d'un SDK d'agrégateur ou d'un opérateur.
- Le domaine ne doit pas contenir de statuts ou de propriétés spécifiques à un fournisseur.
- Le traitement manuel doit rester fonctionnel tant qu'il est utilisé.
- Ne suppose pas qu'une automatisation existe déjà, mais ne construis pas non plus le domaine comme si le traitement devait rester manuel pour toujours.
- Ne crée pas un système multi-fournisseurs complexe avant qu'un besoin réel le justifie.
- L'ajout d'un fournisseur doit principalement nécessiter un nouvel adaptateur, sa configuration et son enregistrement dans la DI.

Fiabilité et confirmation :

- Une transaction ne doit jamais être considérée comme réussie uniquement parce qu'une requête a été envoyée ou qu'un écran affiche un succès.
- La confirmation doit provenir d'une source serveur fiable : confirmation fournisseur vérifiée ou validation manuelle autorisée.
- Prévoir les délais, erreurs réseau, réponses tardives et notifications répétées.
- Éviter les doubles traitements avec une stratégie d'idempotence adaptée.
- Ne pas relancer aveuglément une opération financière après un timeout.
- Conserver les références internes et externes nécessaires au suivi et au rapprochement.
- Ne jamais faire confiance au montant ou au statut transmis par le frontend.

Les règles métier, frais, commissions, délais, remboursements, rôles de validation et fournisseurs ne doivent pas être inventés.

Pour toute évolution de paiement, versement, remboursement ou transaction, consulter obligatoirement le skill `transactions-evolutives` ainsi que le skill `securite`.

## 11. Méthode de travail obligatoire

Avant toute modification significative :

1. Examiner la structure existante et les fichiers réellement concernés.
2. Lire les instructions et skills applicables.
3. Identifier les règles métier et décisions déjà validées.
4. Déterminer la couche et la fonctionnalité auxquelles appartient le changement.
5. Identifier les dépendances techniques qui risquent de traverser une frontière.
6. Choisir la solution la plus simple qui respecte les contraintes.
7. Repérer les impacts sur les autres fonctionnalités, l'API, les données et l'interface.
8. Vérifier les conséquences éventuelles sur la sécurité et les performances.

Pendant le travail :

- Respecter les conventions existantes lorsqu'elles ne contredisent pas une décision validée.
- Limiter les changements au périmètre demandé.
- Ne pas renommer, déplacer ou reformater des éléments sans nécessité.
- Ne pas ajouter de dépendance sans expliquer son utilité.
- Ne pas modifier les règles métier de manière implicite.
- Ne pas remplacer une technologie ou une bibliothèque sans demande ou justification validée.
- Ne pas créer de fichiers, interfaces, classes, dossiers ou tests vides uniquement pour compléter une structure.

Après le travail :

1. Vérifier les imports et les frontières entre couches.
2. Exécuter les vérifications pertinentes disponibles : lint, typecheck, tests et build selon le périmètre.
3. Corriger les erreurs introduites par le changement.
4. Signaler clairement les vérifications non exécutées et les raisons.
5. Résumer les fichiers modifiés, les décisions prises et les éventuels points restant à valider.

## 12. Gestion des incertitudes

Quand une information manque :

- Ne devine pas une règle métier.
- Ne transforme pas une idée en exigence.
- Ne choisis pas silencieusement entre deux comportements qui ont des conséquences fonctionnelles.
- Pose une question ciblée si la réponse change sensiblement la conception ou le résultat.
- Si le détail est secondaire et réversible, propose une option simple en la présentant explicitement comme une proposition.

Quand une demande entre en conflit avec l'architecture :

1. Expliquer brièvement le conflit.
2. Présenter l'impact de la demande.
3. Proposer une solution qui respecte autant que possible le besoin.
4. Demander confirmation si cela implique de modifier une décision structurante.

## 13. Format des réponses de l'agent

Pour une tâche de développement, la réponse finale doit être concise mais suffisamment précise. Elle doit indiquer :

- ce qui a été réalisé ;
- les principaux fichiers ou modules concernés ;
- les choix techniques importants et leur justification ;
- les tests et vérifications exécutés ;
- les limites ou points nécessitant une décision.

Ne prétends jamais qu'un test, un build ou une action a réussi s'il n'a pas été exécuté et vérifié.

---

## Checklist avant de considérer une modification terminée

- [ ] Le besoin fonctionnel demandé est respecté.
- [ ] Les décisions validées de TopDeal sont respectées.
- [ ] Aucun dossier `src` n'a été ajouté.
- [ ] Le code est placé dans la bonne fonctionnalité et la bonne couche.
- [ ] Le domaine ne dépend d'aucune technologie concrète.
- [ ] Les types Prisma, Firebase et autres SDK restent dans les couches techniques appropriées.
- [ ] Les dépendances sont assemblées dans le Composition Root.
- [ ] Aucune abstraction ou dépendance inutile n'a été ajoutée.
- [ ] L'interface respecte le Design System, si elle est concernée.
- [ ] Les entrées et autorisations sont contrôlées aux frontières appropriées.
- [ ] Les skills spécialisés ont été consultés lorsque le périmètre le nécessite.
- [ ] Les listes et recherches volumineuses utilisent une pagination côté serveur.
- [ ] Les requêtes ne récupèrent pas inutilement des données ou des champs.
- [ ] Les transactions restent indépendantes du traitement manuel et des fournisseurs externes.
- [ ] Les intégrations de paiement sont isolées et les confirmations sont vérifiées côté serveur.
- [ ] Les opérations sensibles prennent en compte les doublons, les délais et les erreurs.
- [ ] Les vérifications pertinentes ont été exécutées ou leur absence est signalée.
- [ ] Les incertitudes et décisions en attente sont explicitement mentionnées.
