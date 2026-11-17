---
name: securite
description: À appliquer lors de toute création, modification, revue, vérification ou mise en production de code TopDeal touchant aux utilisateurs, à l'authentification, aux autorisations, aux données personnelles, aux fichiers, aux paiements, aux conversations, aux API, aux bases de données, aux dépendances, à la configuration ou aux journaux. Imposer une conception sécurisée et vérifier les contrôles à chaque frontière de confiance.
---

# Skill — Sécurité

## 1. Objectif

Ce skill définit les règles de sécurité à respecter lors du développement et de la maintenance de TopDeal.

La sécurité doit être intégrée à chaque couche concernée, tout en conservant une architecture simple, lisible et maintenable.

Les objectifs sont de :

- protéger les données et les ressources ;
- garantir une authentification fiable ;
- appliquer correctement les autorisations ;
- valider les données entrantes ;
- protéger les informations sensibles ;
- centraliser la gestion des erreurs de sécurité ;
- éviter les accès non autorisés ;
- limiter les risques liés aux dépendances techniques.

La sécurité ne doit pas être considérée comme une fonctionnalité isolée, mais comme une responsabilité transversale.

## 2. Principes fondamentaux

Appliquer les principes suivants :

- **Deny by default** : refuser l'accès lorsqu'une autorisation ne peut pas être établie.
- **Least privilege** : accorder uniquement les permissions nécessaires.
- **Defense in depth** : ne pas dépendre d'une seule vérification de sécurité.
- **Validate input** : ne jamais considérer une donnée entrante comme fiable.
- **Secure by design** : intégrer la sécurité dès la conception.
- **Separation of concerns** : séparer authentification, autorisation, validation et logique métier.
- **Fail safely** : en cas d'incertitude ou d'échec de vérification, ne pas accorder l'accès.

Ne pas ajouter de mécanismes de sécurité artificiels sans risque identifié.

## 3. Authentification

TopDeal utilise Firebase Authentication pour l'authentification des utilisateurs.

L'authentification permet de vérifier l'identité d'un utilisateur. Elle ne signifie pas automatiquement que cet utilisateur est autorisé à effectuer toutes les opérations.

### 3.1 Responsabilités

Respecter les règles suivantes :

- Utiliser Firebase Authentication comme mécanisme d'identification.
- Vérifier les jetons d'authentification côté serveur avant de faire confiance à une identité.
- Ne jamais considérer une information fournie uniquement par le client comme une preuve d'identité.
- Ne jamais accepter un identifiant utilisateur transmis par le client comme substitut à l'identité vérifiée.
- Vérifier la validité du jeton selon le mécanisme officiellement prévu par le SDK utilisé.
- Gérer explicitement les situations où le jeton est absent, invalide ou expiré.
- Ne jamais exposer les secrets d'administration Firebase dans le client.

Avant toute modification du système d'authentification, examiner la configuration Firebase existante et les mécanismes déjà implémentés.

Ne pas créer un second système d'authentification parallèle.

### 3.2 Sessions

La gestion des sessions doit rester cohérente avec Firebase Authentication et les mécanismes de session effectivement utilisés par l'application.

- Ne pas inventer un système de session supplémentaire sans besoin fonctionnel.
- Protéger les mécanismes de persistance des sessions.
- Éviter de stocker des jetons dans des emplacements accessibles inutilement au JavaScript côté client.
- Ne jamais journaliser les jetons ou les informations d'authentification.
- Gérer proprement la déconnexion et l'expiration des sessions.
- Vérifier les mécanismes de révocation lorsque le niveau de sécurité de l'opération l'exige.

Toute modification de la stratégie de session doit être cohérente entre le client et le serveur.

## 4. Autorisation

L'autorisation détermine ce qu'un utilisateur authentifié a le droit de faire.

Elle doit être vérifiée indépendamment de l'authentification.

### 4.1 Vérification des permissions

Avant une opération protégée, vérifier :

1. que l'utilisateur est authentifié ;
2. que l'utilisateur possède les permissions nécessaires ;
3. qu'il peut accéder à la ressource concernée ;
4. que l'opération demandée est autorisée dans le contexte métier.

Ne jamais déduire une autorisation du simple fait qu'un utilisateur possède un compte.

### 4.2 Accès aux ressources

Pour toute ressource appartenant à un utilisateur :

- vérifier que l'utilisateur connecté en est propriétaire, sauf règle métier contraire ;
- ne pas faire confiance à un identifiant de propriétaire transmis par le client ;
- utiliser l'identité vérifiée côté serveur pour déterminer le contexte utilisateur ;
- vérifier les permissions avant toute lecture, modification ou suppression ;
- éviter les accès indirects à des ressources appartenant à d'autres utilisateurs.

Les règles de propriété doivent être définies explicitement dans le métier.

### 4.3 Rôles et permissions

Ne pas introduire un système complexe de rôles et permissions si les besoins fonctionnels ne le justifient pas.

Lorsque plusieurs niveaux d'accès sont nécessaires :

- définir clairement les rôles ;
- identifier les permissions associées ;
- éviter les vérifications dispersées et contradictoires ;
- conserver une source de vérité cohérente ;
- ne jamais considérer une valeur de rôle fournie par le client comme fiable.

## 5. Protection des routes et des API

Les routes Next.js et les Route Handlers doivent appliquer les contrôles de sécurité adaptés à leur responsabilité.

Un Route Handler doit notamment :

1. recevoir la requête ;
2. valider les données entrantes ;
3. vérifier l'authentification lorsque nécessaire ;
4. vérifier l'autorisation lorsque nécessaire ;
5. appeler le Use Case approprié ;
6. transformer le résultat en réponse HTTP.

Un Route Handler ne doit pas contourner les contrôles de sécurité en appelant directement Prisma ou un repository concret.

### 5.1 Routes protégées

- Identifier explicitement les routes publiques et protégées.
- Vérifier les droits avant de transmettre une opération au métier.
- Ne pas se limiter à masquer une page dans l'interface.
- Ne jamais considérer une redirection côté client comme une protection suffisante.
- Appliquer les contrôles nécessaires côté serveur.

### 5.2 Requêtes HTTP

- Vérifier les méthodes HTTP autorisées.
- Valider les paramètres de route, les query parameters et le corps des requêtes.
- Ne pas exposer de données internes dans les réponses.
- Appliquer les protections adaptées aux mécanismes d'authentification utilisés, notamment contre les attaques CSRF lorsque des cookies de session sont employés.
- Ne pas autoriser automatiquement toutes les origines avec CORS.

Les règles CORS doivent être limitées aux origines réellement nécessaires.

## 6. Validation des données

Toutes les données provenant d'une source externe doivent être considérées comme non fiables.

Cela inclut notamment :

- les formulaires ;
- les paramètres d'URL ;
- les query parameters ;
- les corps de requêtes HTTP ;
- les fichiers envoyés ;
- les données provenant de services externes.

### 6.1 Règles de validation

- Vérifier les types.
- Vérifier les formats.
- Vérifier les longueurs et les limites.
- Vérifier les valeurs autorisées.
- Vérifier les relations entre les champs.
- Refuser les données invalides.
- Ne pas se fier uniquement aux validations effectuées dans l'interface.

Utiliser les mécanismes de validation déjà présents dans le projet avant d'introduire une nouvelle bibliothèque.

### 6.2 Validation et métier

Distinguer :

- la validation de structure : vérifier que les données respectent le format attendu ;
- la validation métier : vérifier que l'opération respecte les règles fonctionnelles.

La validation de structure peut être effectuée à l'entrée de l'application.

Les règles métier doivent rester dans les responsabilités métier appropriées.

Ne pas disperser une même règle métier entre l'interface, le Route Handler et le repository.

## 7. Protection de la base de données

L'accès à PostgreSQL doit passer par les mécanismes prévus dans la couche Data.

Règles à respecter :

- Utiliser Prisma conformément à son API.
- Ne jamais construire des requêtes SQL à partir de chaînes contenant directement des données utilisateur.
- Utiliser les requêtes paramétrées lorsque du SQL brut est nécessaire.
- Ne pas exposer les identifiants internes de connexion à la base.
- Ne pas retourner automatiquement toutes les propriétés d'un modèle Prisma.
- Sélectionner uniquement les champs nécessaires.
- Vérifier les autorisations avant les opérations sensibles.
- Respecter les contraintes et relations définies dans le schéma.
- Ne pas contourner les contraintes de la base pour simplifier une opération.

Les migrations et modifications destructrices de la base nécessitent une autorisation explicite.

## 8. Protection des fichiers et des ressources externes

TopDeal utilise MinIO compatible S3 pour le stockage de fichiers.

Respecter les règles suivantes :

- Ne pas considérer un nom de fichier fourni par le client comme fiable.
- Vérifier les types et tailles de fichiers autorisés.
- Contrôler les autorisations avant de permettre l'accès à un fichier.
- Éviter de rendre publiques des ressources qui doivent rester privées.
- Ne pas exposer les identifiants d'accès MinIO.
- Ne pas construire des chemins de stockage à partir de données utilisateur sans validation.
- Limiter la durée et les permissions des URL temporaires lorsque ce mécanisme est utilisé.
- Ne pas faire confiance uniquement à l'extension d'un fichier pour déterminer son type.

Les règles exactes doivent correspondre aux besoins fonctionnels et à la configuration MinIO existante.

## 9. Gestion sécurisée des erreurs

Les erreurs doivent respecter le modèle centralisé défini par l'architecture du projet.

Une erreur interne ne doit pas révéler inutilement :

- les chemins internes du serveur ;
- les requêtes SQL ;
- les détails de configuration ;
- les secrets ;
- les jetons ;
- les informations personnelles d'autres utilisateurs ;
- les détails techniques permettant de comprendre l'implémentation interne.

### 9.1 Réponses externes

Les réponses HTTP doivent contenir uniquement les informations nécessaires au client.

Distinguer notamment :

- une absence d'authentification ;
- un accès interdit ;
- une ressource inexistante ;
- une donnée invalide ;
- une erreur interne.

Ne pas retourner systématiquement une erreur générique lorsque le client a besoin d'un code précis pour gérer correctement la situation.

En revanche, ne pas révéler la cause technique interne lorsqu'elle expose des informations sensibles.

### 9.2 Journalisation

Les logs doivent faciliter le diagnostic sans compromettre la confidentialité.

Ne jamais journaliser :

- les mots de passe ;
- les jetons d'accès ;
- les secrets d'administration ;
- les clés privées ;
- les informations bancaires sensibles ;
- les données personnelles non nécessaires au diagnostic.

Limiter les informations personnelles présentes dans les logs et contrôler leur accès.

## 10. Protection des secrets et de la configuration

Les secrets doivent être gérés par les mécanismes de configuration adaptés à l'environnement.

- Utiliser les variables d'environnement pour les configurations sensibles.
- Ne jamais committer de secrets dans le dépôt.
- Ne jamais exposer une variable secrète dans le code client.
- Vérifier les préfixes et mécanismes d'exposition des variables Next.js.
- Ne pas réutiliser les identifiants de production dans les environnements de développement.
- Limiter les permissions des comptes techniques.
- Ne pas afficher les secrets dans les logs ou les messages d'erreur.

Les fichiers d'exemple de configuration doivent contenir uniquement des valeurs fictives ou des indications de variables attendues.

## 11. Protection contre les attaques courantes

Prendre en compte les risques adaptés aux fonctionnalités développées.

### 11.1 Injection

- Ne pas concaténer des entrées utilisateur dans des requêtes SQL.
- Valider les données avant leur utilisation.
- Utiliser les mécanismes de requêtes sécurisés des bibliothèques employées.

### 11.2 XSS

- Utiliser les mécanismes d'échappement et de rendu sécurisés de React.
- Éviter l'utilisation de `dangerouslySetInnerHTML`.
- Si du HTML externe doit être rendu, prévoir une stratégie de nettoyage adaptée.
- Ne pas considérer le contenu provenant de la base de données comme automatiquement fiable.

### 11.3 CSRF

Lorsque l'authentification repose sur des cookies :

- examiner les risques de requêtes intersites ;
- configurer correctement les attributs des cookies ;
- appliquer une protection CSRF adaptée aux opérations sensibles ;
- ne pas supposer que CORS suffit à empêcher les attaques CSRF.

### 11.4 Abus et limitation des requêtes

Pour les opérations exposées ou sensibles, évaluer la nécessité de mécanismes de limitation :

- limitation du nombre de requêtes ;
- protection contre les tentatives répétées ;
- limites de taille des requêtes ;
- contrôles supplémentaires pour les opérations coûteuses.

Ne pas introduire systématiquement un système complexe de rate limiting pour toutes les routes. Adapter les protections au risque réel.

## 12. Dépendances et bibliothèques

Les bibliothèques utilisées dans les zones sensibles doivent être maintenues et configurées correctement.

- Préférer les bibliothèques reconnues et adaptées au besoin.
- Éviter les dépendances inutiles.
- Vérifier les versions et les vulnérabilités connues.
- Ne pas implémenter soi-même des mécanismes cryptographiques.
- Ne pas inventer de protocoles d'authentification.
- Utiliser les API officielles des fournisseurs.

Avant d'ajouter une dépendance de sécurité, vérifier si les outils déjà présents dans le projet couvrent le besoin.

## 13. Responsabilités par couche

La sécurité doit respecter les frontières de l'architecture TopDeal.

### Presentation

Responsabilités :

- afficher les états d'accès ;
- guider l'utilisateur ;
- effectuer les validations ergonomiques ;
- ne pas exposer les informations sensibles ;
- ne pas considérer les contrôles d'interface comme une protection serveur.

### Route Handlers

Responsabilités :

- vérifier l'authentification ;
- appliquer les contrôles d'accès nécessaires ;
- valider les entrées HTTP ;
- transmettre une identité vérifiée au mécanisme métier approprié ;
- transformer les erreurs en réponses HTTP sécurisées.

### Core

Responsabilités :

- définir les contrats et modèles nécessaires ;
- exprimer les règles et contraintes métier dans les abstractions appropriées ;
- ne pas dépendre directement de Firebase, Prisma ou MinIO.

### Domain

Responsabilités :

- appliquer les règles métier ;
- vérifier les conditions métier nécessaires à une opération ;
- ne pas dépendre directement des SDK techniques.

### Data

Responsabilités :

- implémenter les repositories et services ;
- communiquer avec les fournisseurs techniques ;
- protéger les accès aux ressources techniques ;
- traduire les erreurs techniques dans le modèle d'erreurs du projet.

Aucune couche ne doit être considérée comme dispensée de ses responsabilités de sécurité.

## 14. Méthode de travail

Avant toute modification liée à la sécurité :

1. Examiner l'architecture existante.
2. Identifier les mécanismes de sécurité déjà présents.
3. Identifier la source de vérité pour les identités et permissions.
4. Comprendre les flux entre client, serveur et fournisseurs externes.
5. Identifier les risques réellement concernés.
6. Proposer une solution adaptée à l'architecture actuelle.
7. Vérifier les impacts sur les fonctionnalités existantes.
8. Ajouter ou adapter les tests pertinents.

Ne pas remplacer un mécanisme existant sans comprendre ses dépendances et ses conséquences.

Pour une modification de sécurité importante, expliquer le risque traité, les contrôles ajoutés et les limites restantes.

## 15. Tests de sécurité

Les tests doivent vérifier les comportements autorisés et interdits.

Selon la fonctionnalité, vérifier notamment :

- une requête sans authentification ;
- un jeton invalide ou expiré ;
- un utilisateur authentifié sans permission ;
- un utilisateur tentant d'accéder à une ressource appartenant à un autre utilisateur ;
- des données invalides ;
- des paramètres manquants ;
- des valeurs hors limites ;
- les réponses HTTP associées ;
- l'absence d'informations sensibles dans les réponses et logs.

Les tests doivent rester ciblés et reproductibles.

Ne pas se limiter aux scénarios où tout fonctionne correctement.

## 16. Anti-sur-ingénierie

La sécurité doit être proportionnée au risque.

Ne pas :

- créer une couche de sécurité générique sans besoin réel ;
- multiplier les vérifications identiques dans toutes les couches ;
- créer un système de permissions complexe pour quelques règles simples ;
- ajouter plusieurs bibliothèques pour couvrir le même besoin ;
- dupliquer les mécanismes Firebase ;
- créer des abstractions qui ne protègent aucune frontière réelle.

Privilégier des contrôles explicites, centralisés lorsque cela est pertinent, et faciles à tester.

## 17. Checklist avant validation

Avant de considérer une modification comme terminée, vérifier :

- [ ] L'authentification est vérifiée côté serveur lorsque nécessaire.
- [ ] L'authentification et l'autorisation sont distinctes.
- [ ] Les permissions sont contrôlées avant l'accès aux ressources.
- [ ] Les données entrantes sont validées.
- [ ] Les informations sensibles ne sont pas exposées.
- [ ] Les secrets ne sont ni committés ni envoyés au client.
- [ ] Les erreurs externes ne révèlent pas les détails internes.
- [ ] Les accès à la base et aux fichiers respectent les autorisations.
- [ ] Les protections correspondent aux risques réels.
- [ ] Les tests couvrent les accès autorisés et interdits.
- [ ] La solution respecte l'architecture existante.
- [ ] Aucune complexité inutile n'a été introduite.

## 18. Règle finale

La sécurité de TopDeal doit reposer sur des contrôles explicites, une séparation claire des responsabilités et une vérification systématique des accès.

Une fonctionnalité ne doit jamais être considérée comme sécurisée simplement parce que son interface masque les actions interdites ou parce que l'utilisateur est authentifié.

La protection réelle doit être assurée par les mécanismes appropriés côté serveur et dans les couches responsables de l'accès aux ressources.