# AGENTS.md — Application Web TopDeal

## 1. Rôle de l'application

`apps/web` est l'application Web de TopDeal. Elle constitue le point d'entrée de l'application pour les utilisateurs et assure l'intégration des fonctionnalités développées dans les packages du monorepo.

Elle utilise Next.js avec App Router et a pour responsabilités principales :

- Fournir les pages et les interfaces accessibles depuis le navigateur.
- Exposer les fonctionnalités nécessaires au moyen des Route Handlers.
- Gérer les interactions entre l'interface utilisateur et les fonctionnalités métier.
- Initialiser et assembler les dépendances de l'application.
- Configurer l'injection de dépendances avec Awilix.
- Centraliser la configuration propre à l'application Web.
- Appliquer les contrôles de sécurité nécessaires à ses points d'entrée.

L'application Web ne doit pas devenir un emplacement où sont progressivement déplacés les éléments métier des packages.

## 2. Structure de référence

La structure de référence est la suivante :

```text
apps/
└── web/
    ├── app/
    │   ├── api/
    │   ├── connexion/
    │   ├── inscription/
    │   ├── layout.tsx
    │   └── page.tsx
    │
    ├── di/
    │   ├── container.ts
    │   └── registrations/
    │       └── auth.ts
    │
    ├── public/
    ├── fichiers de configuration
    └── AGENTS.md
```

Cette structure représente une organisation de référence, et non une obligation de créer tous les éléments immédiatement.

Les dossiers et fichiers supplémentaires ne doivent être ajoutés que lorsqu'un besoin réel le justifie.

Il est interdit de multiplier les niveaux de dossiers ou de créer des fichiers vides dans le seul but d'anticiper des besoins hypothétiques.

## 3. Responsabilités des dossiers

### 3.1. `app/`

Le dossier `app/` contient les éléments liés au routage et à l'interface de l'application Next.js.

Il accueille notamment :

- Les pages accessibles aux utilisateurs.
- Les layouts partagés entre plusieurs pages.
- Les Route Handlers.
- Les composants propres à une route lorsque leur emplacement local est pertinent.

Les conventions de routage de Next.js App Router doivent être respectées.

#### Pages

Les pages sont responsables de l'affichage des interfaces et de la composition des composants nécessaires à chaque écran.

Elles peuvent :

- Récupérer les données nécessaires à leur affichage.
- Utiliser les fonctionnalités exposées par les packages.
- Composer les composants de présentation.
- Gérer les états propres à l'interface.

Elles ne doivent pas contenir les implémentations des règles métier.

#### Layouts

Les layouts définissent les structures d'interface partagées entre plusieurs pages.

Ils peuvent accueillir les éléments communs de présentation et les mécanismes de navigation nécessaires.

Ils ne doivent pas devenir des conteneurs de logique métier ou de configuration technique sans rapport avec leur responsabilité.

#### Route Handlers

Les Route Handlers constituent les points d'entrée HTTP de l'application.

Ils sont responsables de :

1. Recevoir la requête HTTP.
2. Valider les données reçues.
3. Vérifier l'authentification lorsque nécessaire.
4. Vérifier les autorisations nécessaires.
5. Récupérer les dépendances nécessaires depuis le conteneur DI.
6. Appeler le Use Case approprié.
7. Transformer le résultat en réponse HTTP.
8. Gérer les erreurs conformément aux conventions du projet.

Un Route Handler doit rester un adaptateur HTTP.

Il ne doit pas :

- Implémenter les règles métier.
- Contenir des opérations métier complexes.
- Accéder directement à Prisma.
- Instancier directement les implémentations concrètes des repositories.
- Contourner les Use Cases pour effectuer une opération métier.
- Contenir des mécanismes de persistance.
- Réaliser lui-même l'assemblage des dépendances.

Les Route Handlers doivent déléguer les opérations métier aux Use Cases des packages concernés.

### 3.2. `app/connexion/` et `app/inscription/`

Ces dossiers accueillent respectivement les interfaces de connexion et d'inscription.

Ils sont responsables de la présentation et des interactions nécessaires à ces parcours.

Ils peuvent notamment :

- Afficher les formulaires.
- Gérer les états de chargement.
- Afficher les erreurs de validation.
- Déclencher les opérations d'authentification.
- Rediriger l'utilisateur après une opération réussie.

Ils ne doivent pas implémenter eux-mêmes les mécanismes métier ou techniques d'authentification.

Les règles d'authentification doivent rester cohérentes avec les contrats et les fonctionnalités du package concerné.

### 3.3. `di/`

Le dossier `di/` constitue le Composition Root de l'application Web.

Il est responsable de l'assemblage des dépendances nécessaires à l'exécution de l'application.

Awilix doit être utilisé uniquement dans cette couche pour configurer et résoudre les dépendances de l'application.

Le Composition Root peut :

- Initialiser les dépendances techniques nécessaires.
- Instancier les implémentations concrètes.
- Enregistrer les repositories.
- Enregistrer les services techniques.
- Enregistrer les implémentations des Use Cases.
- Configurer les dépendances partagées.
- Définir les modes de résolution et les cycles de vie des dépendances.

Il ne doit pas contenir les règles métier.

Les implémentations métier et techniques doivent rester dans leurs packages respectifs.

#### `di/container.ts`

Ce fichier constitue le point central de configuration du conteneur de dépendances.

Il est responsable de :

- Créer et configurer le conteneur Awilix.
- Charger les enregistrements nécessaires.
- Assembler les dépendances de l'application.
- Exposer un accès maîtrisé aux dépendances enregistrées.

Il ne doit pas devenir un fichier contenant toutes les implémentations ou toutes les configurations détaillées de chaque fonctionnalité.

#### `di/registrations/`

Ce dossier accueille les enregistrements des dépendances organisés par fonctionnalité.

Exemple :

```text
di/
├── container.ts
└── registrations/
    └── auth.ts
```

`auth.ts` regroupe les enregistrements nécessaires à l'assemblage de la fonctionnalité d'authentification.

Lorsque d'autres fonctionnalités nécessitent leurs propres enregistrements, des fichiers dédiés peuvent être ajoutés.

Exemples possibles :

- `auth.ts`
- `products.ts`
- `orders.ts`
- `payments.ts`

Ces fichiers ne doivent être créés que lorsque les fonctionnalités correspondantes nécessitent réellement une configuration DI.

Les fichiers d'enregistrement doivent uniquement assurer l'assemblage des dépendances. Ils ne doivent pas implémenter les opérations métier.

### 3.4. `public/`

Le dossier `public/` contient les ressources statiques accessibles publiquement par l'application Web.

Il peut notamment accueillir :

- Les images statiques.
- Les icônes.
- Les logos.
- Les ressources publiques nécessaires à l'interface.

Il ne doit pas contenir de fichiers confidentiels, de secrets ou de configurations sensibles.

## 4. Gestion des dépendances

L'application Web doit respecter les frontières architecturales définies dans le `AGENTS.md` global.

Les dépendances doivent être assemblées dans le Composition Root.

Les règles suivantes sont obligatoires :

- Awilix ne doit pas être utilisé directement dans les pages ou les Route Handlers pour enregistrer des dépendances.
- Les pages et les Route Handlers ne doivent pas instancier directement les implémentations concrètes des repositories.
- Les Use Cases doivent être récupérés à travers les mécanismes d'injection définis par l'application.
- Les packages ne doivent pas dépendre de `apps/web`.
- Les fonctionnalités métier ne doivent pas être déplacées dans l'application Web.
- Les dépendances doivent être orientées vers les contrats et non vers des implémentations inutiles à connaître.

Le conteneur doit être initialisé de manière adaptée à l'environnement d'exécution.

Il faut notamment éviter :

- Les créations répétées et inutiles de clients techniques.
- Les initialisations multiples non maîtrisées.
- Les partages accidentels d'état entre utilisateurs.
- L'utilisation d'une instance serveur dans un environnement navigateur.
- L'exposition de dépendances sensibles au client.

Les dépendances serveur et navigateur doivent être séparées lorsque leurs environnements ou leurs responsabilités l'exigent réellement.

Un second conteneur ne doit pas être créé simplement pour reproduire le conteneur serveur côté navigateur.

## 5. Séparation serveur et navigateur

Next.js distingue le code exécuté côté serveur de celui exécuté dans le navigateur.

Cette séparation doit être respectée.

### Code serveur

Le code serveur peut accéder aux ressources et dépendances confidentielles nécessaires à l'application, sous réserve des contrôles de sécurité appropriés.

Cela concerne notamment :

- Les clients de bases de données.
- Les secrets d'authentification.
- Les clés privées.
- Les services techniques exclusivement serveur.
- Les dépendances du conteneur serveur.

Ces éléments ne doivent jamais être exposés au navigateur.

### Code navigateur

Le code exécuté dans le navigateur doit uniquement accéder aux ressources explicitement prévues pour cet environnement.

Il ne doit jamais importer ou exposer :

- Des secrets serveur.
- Des clients de bases de données.
- Des implémentations de repositories serveur.
- Des dépendances exclusivement serveur.
- Des variables d'environnement confidentielles.

Les composants doivent utiliser les directives et conventions Next.js adaptées à leur environnement d'exécution.

La directive `use client` ne doit être utilisée que lorsqu'une fonctionnalité nécessite réellement une exécution côté navigateur.

## 6. Configuration de l'application

Les fichiers de configuration doivent rester à la racine de `apps/web` ou à l'emplacement conventionnel imposé par l'outil concerné.

Ils doivent contenir uniquement la configuration propre à l'application Web.

Les règles suivantes s'appliquent :

- Ne pas dupliquer une configuration déjà centralisée à la racine du monorepo.
- Ne pas disperser les mêmes paramètres dans plusieurs fichiers.
- Ne pas coder en dur des secrets dans le code source.
- Ne jamais exposer une variable confidentielle avec le préfixe `NEXT_PUBLIC_`.
- Valider les variables d'environnement nécessaires au démarrage lorsque cela est pertinent.
- Distinguer les configurations publiques des configurations serveur.

Les configurations communes au monorepo doivent rester centralisées conformément aux conventions globales.

## 7. Sécurité des points d'entrée

Les pages et les Route Handlers doivent respecter les règles de sécurité définies dans le skill global `securite`.

En particulier :

- Ne jamais faire confiance aux données envoyées par le navigateur.
- Valider les données entrantes côté serveur.
- Vérifier les permissions avant toute opération protégée.
- Ne pas considérer qu'une page inaccessible dans l'interface protège une ressource HTTP.
- Ne pas exposer les détails internes des erreurs au client.
- Ne jamais transmettre de secrets dans les réponses HTTP.
- Appliquer les protections adaptées aux opérations sensibles.
- Éviter les accès directs aux ressources sans vérification des droits.

L'authentification et l'autorisation doivent être contrôlées au niveau approprié, notamment dans les points d'entrée serveur.

La sécurité ne doit pas dépendre uniquement des contrôles effectués dans l'interface utilisateur.

## 8. Gestion des erreurs

L'application Web doit respecter la stratégie de gestion des erreurs définie globalement.

Les Route Handlers sont responsables de transformer les erreurs applicatives en réponses HTTP appropriées.

Ils ne doivent pas recréer leurs propres systèmes de gestion des erreurs.

Les erreurs métier, techniques et de validation doivent rester distinguées.

Les informations internes sensibles ne doivent jamais être retournées au client.

Les erreurs inattendues doivent être journalisées de manière appropriée, sans exposer de secrets ou de données sensibles.

## 9. Conventions de développement

Tout développement dans `apps/web` doit respecter les conventions globales de nomenclature, d'architecture et d'évolutivité.

Les règles suivantes sont également applicables :

- Respecter les conventions Next.js App Router.
- Privilégier des composants simples et spécialisés.
- Éviter les composants excessivement volumineux.
- Éviter les fichiers contenant plusieurs responsabilités indépendantes.
- Ne pas mélanger présentation, transport HTTP et logique métier.
- Éviter les abstractions inutiles.
- Réutiliser les fonctionnalités déjà disponibles dans les packages.
- Préférer les mécanismes natifs de Next.js lorsqu'ils répondent au besoin.
- Ne pas introduire une dépendance supplémentaire sans justification.

Les composants génériques réutilisables doivent être placés dans le package `packages/ui` lorsqu'ils correspondent réellement au rôle du design system.

Les composants propres à une fonctionnalité doivent rester dans le package de cette fonctionnalité lorsque leur réutilisation et leur responsabilité le justifient.

## 10. Interdictions

Il est interdit de :

- Déplacer les règles métier dans `apps/web`.
- Implémenter les Use Cases dans les pages ou les Route Handlers.
- Accéder directement à Prisma depuis les pages ou les Route Handlers.
- Instancier directement les repositories concrets dans les points d'entrée HTTP.
- Utiliser Awilix en dehors du Composition Root pour assembler les dépendances.
- Exposer des dépendances serveur au navigateur.
- Exposer des secrets dans le code client.
- Dupliquer les fonctionnalités déjà présentes dans les packages.
- Créer des dossiers, fichiers ou abstractions sans besoin concret.
- Ajouter une couche intermédiaire qui ne possède aucune responsabilité réelle.
- Contourner les contrats définis par les packages.
- Transformer les Route Handlers en services métier.
- Mélanger la configuration de l'application avec les règles métier.

## 11. Principes de décision

Lorsqu'une nouvelle fonctionnalité doit être développée, il faut déterminer précisément sa responsabilité avant de choisir son emplacement.

Les questions suivantes doivent guider la décision :

1. S'agit-il d'une interface ou d'une page ? Elle appartient à `app/`.
2. S'agit-il d'un point d'entrée HTTP ? Il appartient à `app/api/`.
3. S'agit-il de l'assemblage des dépendances ? Il appartient à `di/`.
4. S'agit-il d'une configuration propre à Next.js ou à l'application Web ? Elle appartient à la configuration de `apps/web`.
5. S'agit-il d'une règle métier, d'un Use Case ou d'une implémentation technique d'une fonctionnalité ? Elle appartient au package concerné.

En cas de doute, consulter les documents globaux et les skills spécialisés avant de créer une nouvelle structure.

## 12. Règle finale

`apps/web` doit rester une application d'intégration, de présentation et d'exposition HTTP.

Elle assemble les fonctionnalités existantes, fournit leurs interfaces et les rend accessibles aux utilisateurs.

Elle ne doit pas absorber progressivement les responsabilités des packages.

Toute évolution doit préserver cette séparation, maintenir une architecture compréhensible et éviter la complexité qui n'apporte aucune valeur réelle.