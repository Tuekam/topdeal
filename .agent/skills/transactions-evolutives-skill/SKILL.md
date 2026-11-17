---
name: transactions-evolutives
description: >
  Définit comment concevoir et faire évoluer les transactions financières de TopDeal
  lorsqu'elles sont actuellement traitées manuellement, tout en préparant une future
  intégration avec des agrégateurs de paiement ou les API des opérateurs. À utiliser
  pour toute tâche touchant aux paiements, encaissements, confirmations, versements,
  remboursements, statuts de transaction, rapprochements, webhooks, fournisseurs de
  paiement ou à la persistance des opérations financières.
---

# Transactions évolutives — TopDeal

## 1. Objectif impératif

TopDeal traite actuellement les transactions manuellement. Cette situation décrit le **mode opératoire actuel**, pas une règle d'architecture permanente.

Le code doit permettre de commencer avec un traitement manuel, puis d'intégrer plus tard un ou plusieurs agrégateurs de paiement ou les API d'opérateurs, sans réécrire les règles métier ni casser les fonctionnalités existantes.

**Principe central : le métier décrit une transaction et son cycle de vie ; un mécanisme de traitement interchangeable exécute ou accompagne l'opération.**

Ne jamais confondre :
- le processus métier d'une transaction ;
- le mode de traitement actuel (manuel) ;
- le fournisseur technique futur (agrégateur ou opérateur) ;
- le canal utilisé par l'utilisateur (selon les choix produit confirmés).

## 2. Règles non négociables

1. Ne pas intégrer de logique propre à un agrégateur ou opérateur dans le domaine métier.
2. Ne pas coder le processus métier en supposant que toutes les opérations seront toujours manuelles.
3. Ne pas coder non plus en supposant qu'une API de paiement existe déjà.
4. Préserver un parcours manuel fonctionnel tant qu'aucune intégration automatique n'est activée.
5. Isoler les fournisseurs derrière des ports/interfaces appartenant à TopDeal et des adaptateurs dans la couche Data.
6. Les Use Cases doivent dépendre d'abstractions, jamais d'un SDK ou d'une API fournisseur.
7. Un changement de fournisseur ne doit pas imposer de modifier les règles métier.
8. Une transaction ne doit jamais être considérée comme réussie uniquement parce que le navigateur a affiché un succès ou qu'une requête a été envoyée.
9. Prévoir les appels répétés, les délais, les réponses tardives, les erreurs réseau et les notifications reçues plusieurs fois.
10. Ne jamais inventer les règles financières, les frais, les délais, les conditions de validation ou les responsabilités de TopDeal : demander confirmation si elles ne sont pas spécifiées.

## 3. Architecture de référence

Respecter l'architecture TopDeal existante : monorepo pnpm, features séparées en `domain`, `data`, `presentation`, `apps/web` pour l'assemblage et les points d'entrée.

Ne pas créer de `src`.

### 3.1 Domaine

Le domaine porte les concepts métier indépendants du mode de traitement :
- transaction / opération financière ;
- montant et devise, selon les règles validées ;
- statut métier ;
- référence interne stable ;
- dates utiles au cycle de vie ;
- résultat métier d'une opération ;
- règles et invariants explicitement définis.

Les entités et Use Cases ne doivent pas importer :
- SDK d'agrégateur ;
- client HTTP d'un opérateur ;
- Firebase ou Prisma ;
- Next.js ou Awilix ;
- format de webhook propre à un fournisseur.

Le domaine ne doit pas contenir des champs techniques imposés par un prestataire (ex. nom d'une classe SDK, code d'erreur brut ou objet de réponse propriétaire).

Ces informations peuvent être conservées dans la couche Data comme métadonnées techniques lorsque cela est nécessaire à l'exploitation ou au rapprochement.

### 3.2 Ports appartenant à TopDeal

Définir les ports selon les capacités réellement nécessaires aux Use Cases, et non selon l'API d'un fournisseur choisi.

Exemples de capacités possibles, à retenir uniquement si le besoin produit existe :
- initier une opération ;
- consulter son état ;
- vérifier ou confirmer une opération ;
- demander un remboursement ;
- recevoir et traiter une notification fournisseur ;
- rapprocher une opération avec les données du fournisseur.

Un port exprime une intention stable de TopDeal. Il ne doit pas recopier à l'identique les noms, paramètres ou structures d'un SDK externe.

### 3.3 Couche Data : adaptateurs

La couche Data contient les implémentations concrètes :
- adaptateur de traitement manuel ;
- adaptateur d'un agrégateur ;
- adaptateur d'une API opérateur ;
- clients HTTP / SDK ;
- conversion des requêtes et réponses externes vers les modèles internes ;
- vérification technique des notifications entrantes ;
- stockage des références externes et des métadonnées techniques.

Chaque fournisseur possède son propre adaptateur.

Éviter un adaptateur géant rempli de conditions `if provider === ...`.

### 3.4 Composition Root

`apps/web` configure les dépendances avec Awilix dans le conteneur DI.

Le choix de l'adaptateur actif se fait à cet endroit ou dans une configuration dédiée, pas dans le domaine ni dans les composants React.

Le mode manuel doit rester sélectionnable.

L'ajout d'un fournisseur doit principalement consister à :
1. créer son adaptateur ;
2. le tester ;
3. l'enregistrer dans le conteneur DI ;
4. configurer les secrets et paramètres nécessaires ;
5. activer son usage selon une décision explicite.

Ne pas construire un système complexe de routage multi-fournisseurs tant qu'un besoin réel ne le justifie pas.

## 4. Distinguer transaction métier et tentative de traitement

Ne pas représenter toute l'histoire d'une transaction par un simple booléen `isPaid`, `isSuccess` ou `isManual`.

Une transaction métier peut nécessiter une ou plusieurs tentatives de traitement.

Cette distinction aide à gérer les délais, les erreurs et les changements de fournisseur.

Modèle conceptuel indicatif :

- **Transaction** : opération métier TopDeal, avec une référence interne stable et un état métier.
- **PaymentAttempt / TransactionAttempt** : tentative d'exécution auprès d'un canal ou fournisseur, avec son propre état et ses références techniques.
- **ProviderReference** : référence fournie par un prestataire, si applicable.
- **TransactionEvent** : événement métier ou technique utile à l'historique et à l'audit, si le besoin le justifie.

Ces noms sont des propositions conceptuelles, pas une obligation de créer toutes ces classes ou tables dès la première version.

Ne pas ajouter d'entités sans besoin réel.

Une opération manuelle peut être représentée par une tentative dont le mode est manuel, sans faire de la transaction elle-même un objet exclusivement manuel.

## 5. Cycle de vie et statuts

Les statuts doivent exprimer des états métier compréhensibles par TopDeal et rester indépendants des libellés fournisseurs.

Exemples conceptuels à adapter aux règles validées :
- en attente ;
- traitement en cours ;
- confirmation requise ;
- réussie / confirmée ;
- échouée ;
- expirée ;
- annulée ;
- remboursement en cours ;
- remboursée ;
- remboursement échoué.

Ne pas adopter automatiquement cette liste : les statuts exacts, transitions permises, règles de finalité et rôles autorisés doivent être définis par le produit.

Règles :
- centraliser les transitions dans le domaine ou les Use Cases appropriés ;
- refuser les transitions invalides ;
- distinguer un état temporaire d'un état final ;
- ne pas faire régresser une transaction confirmée à cause d'une notification ancienne ;
- conserver une trace des changements significatifs ;
- ne pas assimiler « demande envoyée » à « paiement confirmé ».

Un fournisseur peut employer ses propres statuts. L'adaptateur les traduit vers les états internes.

Conserver éventuellement le statut brut à des fins de diagnostic, sans l'exposer comme statut métier principal.

## 6. Parcours manuel aujourd'hui

Le parcours manuel doit utiliser les mêmes concepts métier et le même cycle de vie général que le futur parcours automatique.

L'adaptateur manuel peut prendre en charge, selon le processus validé :
- l'enregistrement d'une déclaration ou d'une demande ;
- l'attente d'une vérification par une personne autorisée ;
- la confirmation ou le rejet ;
- l'ajout d'une référence ou d'une preuve, si le produit l'autorise ;
- l'historique de traitement.

Ne pas inventer les modalités de preuve, les personnes autorisées, les délais ou les conditions de confirmation.

Ces éléments relèvent des exigences métier et de sécurité.

Le traitement manuel ne doit pas contourner les Use Cases ni modifier directement la base de données depuis l'interface d'administration.

## 7. Préparer les intégrations automatiques

Lorsqu'un agrégateur ou une API opérateur sera choisi :

1. Lire sa documentation officielle et vérifier les capacités réellement disponibles.
2. Créer un adaptateur isolé pour ce fournisseur.
3. Mapper ses requêtes, réponses, statuts et erreurs vers les contrats internes.
4. Utiliser les secrets uniquement côté serveur.
5. Vérifier les notifications entrantes selon les mécanismes documentés par le fournisseur.
6. Gérer les réponses asynchrones et les confirmations tardives.
7. Prévoir une procédure de rapprochement avec les références fournisseur.
8. Ajouter des tests de contrat et des tests d'intégration.
9. Activer progressivement l'intégration avec une configuration contrôlée.
10. Conserver un moyen opérationnel de traiter les cas en attente ou en erreur.

Ne pas supposer qu'un fournisseur propose les mêmes opérations qu'un autre.

Par exemple, l'initiation, la consultation d'état, le remboursement, les notifications et le rapprochement peuvent avoir des disponibilités différentes.

## 8. Fiabilité : doublons, délais et erreurs

Les systèmes de paiement sont distribués : une requête peut être traitée par le fournisseur alors que TopDeal ne reçoit pas sa réponse à temps.

Une nouvelle tentative aveugle peut créer une opération en double.

Appliquer les règles suivantes :
- attribuer une référence interne unique à chaque opération ;
- utiliser une clé d'idempotence lorsque le fournisseur la prend en charge ;
- définir une stratégie d'idempotence côté TopDeal même si le fournisseur n'en propose pas ;
- rendre le traitement des notifications répétées sans effet financier supplémentaire ;
- enregistrer les identifiants d'événements externes lorsqu'ils existent ;
- ne pas relancer automatiquement une opération financière sans connaître le risque de doublon ;
- distinguer erreur définitive, erreur temporaire et résultat inconnu ;
- prévoir une consultation d'état ou un rapprochement pour les résultats inconnus ;
- gérer les délais d'attente sans conclure automatiquement à un échec ;
- empêcher qu'une même notification soit appliquée plusieurs fois.

Les mécanismes exacts (table d'idempotence, contraintes uniques, file de messages, verrouillage, tâches planifiées) doivent rester proportionnés au volume et aux garanties du fournisseur.

Ne pas ajouter une infrastructure distribuée sans nécessité.

## 9. Sécurité et contrôle

Pour toute opération financière :
- exécuter les opérations sensibles côté serveur ;
- authentifier et autoriser chaque action selon le rôle et le contexte ;
- valider les montants, devises, références et états côté serveur ;
- ne jamais faire confiance au montant ou au statut transmis par le navigateur ;
- ne jamais stocker les clés secrètes dans le frontend, le dépôt ou les logs ;
- vérifier l'authenticité des webhooks selon la documentation du fournisseur ;
- protéger les webhooks contre le rejeu lorsque le mécanisme le permet ;
- limiter et journaliser les actions administratives sensibles ;
- ne pas stocker les données de carte ou autres données sensibles de paiement sans nécessité et cadre approprié ;
- ne jamais journaliser les secrets, jetons ou données personnelles non nécessaires.

La validation d'un paiement doit reposer sur une source serveur fiable : confirmation vérifiée du fournisseur ou validation manuelle autorisée, selon le mode actif.

Consulter également le skill `securite` pour les règles de sécurité générales.

## 10. Persistance et migrations

Le schéma PostgreSQL/Prisma doit représenter les concepts métier et les tentatives de traitement sans dépendre du schéma interne d'un prestataire.

Bonnes pratiques :
- utiliser l'identifiant interne TopDeal comme référence principale ;
- conserver séparément les identifiants externes ;
- prévoir une relation entre transaction et tentative si plusieurs tentatives sont nécessaires ;
- ajouter des contraintes d'unicité adaptées aux références internes et externes ;
- stocker les montants avec un type décimal adapté, jamais en flottant binaire ;
- stocker explicitement la devise lorsque le produit prend en charge plusieurs devises ou lorsque cela est requis pour lever toute ambiguïté ;
- définir les dates et fuseaux de manière cohérente ;
- conserver un historique suffisant pour l'audit et le support ;
- éviter les colonnes spécifiques à chaque fournisseur dans la table métier principale.

Les champs JSON de métadonnées ne doivent pas devenir un moyen de cacher tout le modèle.

Les données nécessaires aux recherches, contraintes et rapprochements doivent être structurées.

Toute migration doit préserver les transactions existantes.

Ne jamais réinterpréter silencieusement les anciennes opérations manuelles ni perdre leur historique.

## 11. API et interface

Les API TopDeal exposent les concepts et statuts internes, pas les objets du fournisseur.

L'interface :
- affiche un état métier compréhensible ;
- ne décide jamais qu'une transaction est réussie ;
- ne contient aucun SDK de paiement secret ou privilégié ;
- ne dépend pas du nom d'un fournisseur pour afficher le cycle de vie ;
- présente les instructions du parcours manuel lorsque ce mode est actif ;
- peut présenter un parcours automatique lorsqu'il sera activé, sans modifier les règles métier communes.

Ne pas afficher de faux statut de réussite pendant l'attente d'une confirmation.

Prévoir des états de chargement, d'attente, d'erreur et de résultat inconnu.

## 12. Tests obligatoires

Pour tout changement touchant aux transactions, envisager au minimum :

### Tests métier
- transitions autorisées et refusées ;
- montant et devise valides ;
- séparation entre transaction et tentative ;
- impossibilité de confirmer deux fois avec un effet supplémentaire ;
- conservation des règles métier quel que soit le mode de traitement.

### Tests de l'adaptateur manuel
- création d'une demande ;
- confirmation ou rejet selon les autorisations ;
- gestion des états en attente ;
- conservation de l'historique.

### Tests d'adaptateur fournisseur, lors de son ajout
- mapping des statuts et erreurs ;
- réponse valide, réponse invalide et délai dépassé ;
- notification authentique et notification invalide ;
- notification répétée ;
- notification reçue avant la réponse synchrone ;
- résultat inconnu puis consultation d'état ;
- absence de double traitement ;
- comportement lors d'une indisponibilité fournisseur.

### Tests de non-régression
- le parcours manuel continue de fonctionner ;
- les transactions historiques restent lisibles ;
- les autres features ne dépendent pas d'un fournisseur ;
- changer la configuration du fournisseur ne change pas les règles métier.

Utiliser des environnements de test/sandbox lorsque le fournisseur en propose.

Ne jamais effectuer de transaction réelle pour un test automatisé.

## 13. Anti-patterns interdits

| À éviter | Pourquoi | À faire |
|---|---|---|
| `if (isManual)` dans chaque Use Case | Le mode contamine le métier | Isoler le traitement derrière un port |
| Importer un SDK dans un Use Case | Couplage fournisseur | Adaptateur Data |
| Stocker `orangeMoneyStatus` dans `Transaction` | Le modèle dépend d'un opérateur | Statut interne + métadonnées d'adaptateur |
| `isPaid = true` dès l'envoi de la requête | Confirmation non prouvée | Attendre une confirmation fiable |
| Faire confiance au frontend | Peut être modifié ou rejoué | Vérification côté serveur |
| Relancer automatiquement après timeout | Risque de doublon | Idempotence et vérification d'état |
| Traiter chaque webhook sans déduplication | Notifications répétées possibles | Déduplication et traitement idempotent |
| Construire un moteur multi-fournisseurs prématurément | Complexité inutile | Un port et les adaptateurs réellement nécessaires |
| Remplacer le parcours manuel lors de l'intégration | Régression opérationnelle | Garder le manuel disponible selon configuration |
| Mettre les détails fournisseur dans le domaine | Dette technique | Mapping dans Data |

## 14. Méthode de travail de l'agent

Avant de modifier le code :

1. Identifier la feature concernée (paiement, versement, remboursement ou autre).
2. Lire les règles métier déjà validées et les modèles existants.
3. Identifier ce qui est confirmé, ce qui est une hypothèse et ce qui reste à décider.
4. Vérifier les ports, adaptateurs et Use Cases déjà présents avant d'en créer.
5. Déterminer si le changement concerne le métier, le traitement manuel, un fournisseur, la persistance ou l'interface.
6. Proposer la modification la plus petite qui respecte l'architecture.

Pendant le travail :
- ne pas introduire de dépendance fournisseur dans le domaine ;
- ne pas créer d'abstraction inutilisée ;
- ne pas modifier les règles métier sans validation ;
- ne pas supprimer le mode manuel sans décision explicite ;
- garder les changements localisés et testables.

Après le travail, vérifier :
- le parcours manuel est intact ;
- le domaine reste indépendant ;
- les opérations sont idempotentes autant que nécessaire ;
- les statuts sont fiables ;
- les secrets restent côté serveur ;
- les migrations et tests couvrent les cas ajoutés.

## 15. Décisions à ne pas inventer

Les points suivants nécessitent une décision produit ou technique explicite :
- agrégateur ou opérateur à intégrer ;
- opérations prises en charge par chaque fournisseur ;
- moment exact où une transaction est considérée comme confirmée ;
- rôles habilités à confirmer manuellement ;
- politique de remboursement ;
- gestion des frais et commissions ;
- délais d'expiration ;
- nombre de tentatives autorisées ;
- stratégie de rapprochement et de résolution des écarts ;
- devise(s) prises en charge ;
- choix d'un fournisseur principal ou de plusieurs fournisseurs.

Tant que ces décisions ne sont pas prises, construire une architecture neutre et minimale, sans inventer le comportement métier.