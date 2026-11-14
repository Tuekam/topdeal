# Référence de sécurité — TopDeal

Ce document complète `SKILL.md`. Il aide l'agent à appliquer le skill selon les frontières de l'architecture TopDeal.

## A. Cartographie des frontières de confiance

| Frontière | Données non fiables | Contrôles à envisager |
|---|---|---|
| Navigateur → Route Handler | Corps, paramètres, cookies, en-têtes, identifiants | Validation à l'exécution, authentification, autorisation, limites de taille |
| Route Handler → Use Case | Identité résolue, commande applicative | Transmettre un contexte d'acteur vérifié, vérifier les permissions métier nécessaires |
| Use Case → contrat de repository | Identifiants et critères métier | Contraintes métier, propriété, transitions d'état |
| Data → PostgreSQL/Prisma | Critères et valeurs persistées | API paramétrées, contraintes, transactions, privilèges minimaux |
| Application → Firebase Auth | Jetons et réponses fournisseur | Vérification serveur, claims attendus, gestion de l'expiration |
| Application → MinIO | Fichiers et métadonnées | Accès privé, noms générés, limites, autorisation, URL signées |
| Fournisseur → webhook | Requête entrante | Signature, fraîcheur, anti-rejeu, idempotence |

## B. Placement des contrôles

- **Route Handler (`apps/web`) :** validation du protocole HTTP, authentification de la requête, limites de taille, format de réponse et protections HTTP.
- **Use Case (fonctionnalité) :** orchestration métier, règles d'accès liées à l'opération et vérification des transitions métier.
- **Domain (fonctionnalité) :** invariants et règles métier indépendantes des fournisseurs.
- **Data (fonctionnalité) :** accès sécurisé à la persistance et aux services externes, conversion des modèles techniques.
- **Composition Root (`apps/web`) :** configuration et assemblage des implémentations, sans y placer les règles métier.

Ne pas dupliquer aveuglément un contrôle dans toutes les couches. Placer chaque contrôle à la frontière qui possède le contexte nécessaire et ajouter une défense supplémentaire lorsque l'impact le justifie.

## C. Matrice de tests négatifs par fonctionnalité

| Fonctionnalité | Cas négatifs essentiels |
|---|---|
| Authentification | jeton invalide ou expiré, compte désactivé, tentatives répétées |
| Annonce | modification ou suppression d'une annonce appartenant à un autre utilisateur, champs interdits |
| Commande | lecture d'une commande tierce, transition de statut non autorisée, montant manipulé |
| Paiement / versement | fausse confirmation client, doublon, référence altérée, acteur non autorisé |
| Conversation | lecture ou envoi dans une conversation dont l'utilisateur n'est pas membre |
| Favoris | modification du favori d'un autre compte |
| CV / fichiers | accès au document privé d'un autre utilisateur, fichier trop volumineux ou type non accepté |
| Vérification d'identité | accès non autorisé aux documents et au résultat de vérification |
| Administration | accès par un compte non administrateur, action sans permission |
| Webhooks | signature absente ou invalide, requête rejouée, contenu malformé |

Cette matrice indique des catégories de tests, pas de nouvelles règles métier. Les transitions et permissions exactes doivent provenir des spécifications validées.

## D. Ne pas confondre les statuts

Ne pas confondre :
- utilisateur authentifié et utilisateur autorisé ;
- paiement signalé et paiement vérifié ;
- fichier téléversé et fichier approuvé ;
- identité soumise et identité vérifiée ;
- requête reçue et opération exécutée ;
- réponse du fournisseur et résultat validé par l'application.

Les noms et transitions exacts doivent correspondre au modèle métier approuvé.

## E. Points de contrôle rapides en revue de code

Rechercher notamment :
- accès directs à Prisma depuis `apps/web` ou `presentation` ;
- import de Firebase, Prisma ou MinIO dans `domain` ;
- confiance accordée à `userId`, `role`, `ownerId`, `price` ou `status` fournis par le client ;
- réponses qui sérialisent directement un enregistrement complet ;
- routes privées sans contrôle serveur ;
- fichiers accessibles par une URL publique non intentionnelle ;
- secrets dans le dépôt ou les journaux ;
- utilisation de `dangerouslySetInnerHTML` ;
- requêtes SQL construites par concaténation ;
- erreurs techniques renvoyées au client ;
- opérations sensibles non protégées contre les doublons.

Un résultat de recherche textuelle n'est pas à lui seul une preuve de vulnérabilité : examiner le contexte et le flux d'exécution.

## F. Vérifications avant déploiement

Les contrôles de déploiement dépendent de l'hébergeur et de la configuration réelle. Avant la mise en production, vérifier au minimum :
- HTTPS et configuration TLS ;
- variables d'environnement et secrets de production ;
- règles réseau et accès aux bases et services ;
- permissions des buckets et comptes de service ;
- configuration des cookies et origines autorisées ;
- en-têtes HTTP et politique CSP compatibles avec l'application ;
- sauvegardes et capacité de restauration ;
- mises à jour de sécurité et surveillance ;
- absence de données de test ou de comptes de démonstration privilégiés.

Ne pas prétendre avoir vérifié ces éléments sans accès à l'environnement concerné.
