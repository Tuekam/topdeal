---
name: securite
description: À appliquer lors de toute création, modification, revue, vérification ou mise en production de code TopDeal touchant aux utilisateurs, à l'authentification, aux autorisations, aux données personnelles, aux fichiers, aux paiements, aux conversations, aux API, aux bases de données, aux dépendances, à la configuration ou aux journaux. Imposer une conception sécurisée et vérifier les contrôles à chaque frontière de confiance.
---

# Skill Sécurité — TopDeal

## 1. Mission

Développer et maintenir TopDeal en intégrant la sécurité dès la conception et à chaque modification, et non comme une correction ajoutée à la fin.

Les objectifs sont de réduire la surface d'attaque, empêcher les accès non autorisés et les fuites de données, protéger l'intégrité et la disponibilité du système, et rendre les contrôles de sécurité vérifiables et maintenables.

**Ne jamais promettre qu'une application est « sécurisée à 100 % » ou « totalement invulnérable ».** Aucune application non triviale ne peut être garantie sans vulnérabilité. Employer plutôt les formulations « conçue selon les principes de sécurité », « contrôles de sécurité mis en place » et « risques évalués ». Signaler honnêtement les risques résiduels.

La sécurité ne justifie pas d'inventer des règles métier, de collecter des données inutiles ou d'ajouter une infrastructure complexe sans besoin démontré.

## 2. Règles obligatoires

Pour chaque tâche concernée :

1. Identifier les données manipulées et leur sensibilité.
2. Identifier l'utilisateur, le processus ou le service à l'origine de la demande.
3. Identifier la frontière de confiance traversée.
4. Identifier les actifs à protéger et les menaces plausibles.
5. Appliquer les contrôles efficaces les plus simples.
6. Tester les comportements autorisés et ceux qui doivent être refusés.
7. Indiquer ce qui a été vérifié, ce qui ne l'a pas été et les risques restants.

Ne jamais :
- faire confiance à une donnée simplement parce qu'elle provient du frontend ;
- considérer qu'un bouton masqué ou une protection de route côté client suffit pour autoriser une opération ;
- exposer des secrets dans le code, les journaux, les bundles client, les captures ou la configuration versionnée ;
- renvoyer aux clients des traces d'exécution, erreurs SQL, jetons ou détails internes sensibles ;
- affaiblir un contrôle de sécurité pour faire passer un test ;
- désactiver silencieusement l'authentification, les autorisations, la validation, la limitation de débit ou les en-têtes de sécurité ;
- stocker des mots de passe en clair ou implémenter soi-même une cryptographie de mots de passe ;
- inventer des règles de confirmation de paiement, de vérification d'identité ou de remboursement ;
- prétendre qu'un audit ou un test d'intrusion a été réalisé s'il ne l'a pas été.

## 3. Principes fondamentaux

Appliquer systématiquement les principes suivants :

- **Moindre privilège :** chaque utilisateur, service, processus et identifiant d'accès ne reçoit que les permissions nécessaires.
- **Refus par défaut :** un accès est refusé tant qu'il n'a pas été explicitement autorisé.
- **Défense en profondeur :** les protections importantes ne reposent pas sur un seul mécanisme.
- **Configuration sécurisée par défaut :** les nouvelles routes, ressources et configurations commencent dans l'état le plus sûr.
- **Vérification systématique :** chaque opération protégée est autorisée à la frontière serveur appropriée.
- **Minimisation des données :** ne collecter, exposer, conserver et journaliser que le nécessaire.
- **Échec sécurisé :** une erreur ne doit ni révéler un secret ni accorder un accès involontaire.
- **Séparation des responsabilités :** une opération sensible ne doit pas dépendre d'une décision client non vérifiée.
- **Frontières de confiance explicites :** navigateurs, fournisseurs externes, fichiers téléversés et entrées utilisateur sont considérés comme non fiables.

## 4. Évaluation des menaces avant implémentation

Pour une fonctionnalité ou une modification significative, examiner brièvement :

| Question | Exemples |
|---|---|
| Que faut-il protéger ? | Compte, CV, numéro de téléphone, conversation, annonce, commande, preuve de paiement |
| Qui peut interagir ? | Visiteur, acheteur, vendeur, administrateur, service externe |
| Que peut-il se passer ? | Lecture ou modification non autorisée, prise de contrôle de compte, fuite, abus, falsification |
| Quelle frontière est traversée ? | Navigateur vers Route Handler, API vers cas d'utilisation, application vers base de données ou fournisseur |
| Quels contrôles faut-il ? | Authentification, autorisation, validation, vérification de propriété, limites, journal d'audit |

Utiliser une analyse légère pour les changements ordinaires. Faire une analyse plus détaillée pour l'authentification, les paiements, la vérification d'identité, l'administration, les téléversements et les flux de données personnelles.

Ne pas produire un long document d'analyse de menaces pour un simple changement visuel.

## 5. Authentification et identité

### 5.1 Fournisseur d'authentification

- Firebase Auth est le fournisseur actuellement retenu, mais il doit rester derrière une frontière appartenant à l'application.
- Ne pas propager les types du SDK Firebase ni ses hypothèses propres au fournisseur dans la logique métier.
- Vérifier les jetons d'authentification côté serveur avec le mécanisme serveur fiable prévu par le fournisseur.
- Ne jamais accepter un identifiant utilisateur, un rôle, un e-mail ou un état d'authentification fourni uniquement par le navigateur comme preuve d'identité.
- Résoudre l'identité externe authentifiée vers l'utilisateur interne correspondant dans TopDeal.
- Garder l'UID Firebase distinct de l'UUID interne TopDeal.
- Ne pas créer un second système de mots de passe à côté de Firebase Auth sans validation explicite.

### 5.2 Sessions et jetons

- Ne pas stocker de jetons d'authentification de longue durée dans le stockage local du navigateur.
- Préférer des cookies sécurisés, `HttpOnly`, adaptés aux sessions gérées côté serveur lorsque le mécanisme de session retenu le permet.
- Configurer délibérément les attributs des cookies : `HttpOnly`, `Secure` en HTTPS et une politique `SameSite` appropriée.
- Protéger contre les attaques CSRF les requêtes de modification authentifiées par cookie.
- Vérifier l'émetteur, l'audience, la signature, l'expiration et les autres claims nécessaires avec le SDK fiable du fournisseur.
- Gérer la déconnexion, l'expiration, la révocation et la désactivation des comptes selon le flux d'authentification retenu.
- Ne jamais journaliser les jetons d'accès, jetons de renouvellement, identifiants de session ou en-têtes d'autorisation.

Ne pas inventer une architecture de session. Examiner l'implémentation existante et la documentation du fournisseur avant toute modification.

### 5.3 Cycle de vie des comptes

- Éviter autant que possible l'énumération des comptes par des réponses ou des temps de réponse sensiblement différents.
- Limiter le débit des tentatives de connexion, d'inscription, de récupération de compte, de vérification et des autres opérations sensibles.
- Employer des messages publics génériques lorsque révéler l'existence d'un compte crée un risque.
- Exiger une réauthentification ou une vérification supplémentaire adaptée pour les changements à fort impact lorsque le parcours produit validé le permet.
- Ne jamais exposer les informations du compte d'un autre utilisateur lors d'une recherche de profil ou dans une réponse d'erreur.

## 6. Autorisations et propriété des ressources

L'authentification répond à « qui effectue la demande ? ». L'autorisation répond à « cette identité peut-elle effectuer cette action sur cette ressource ? ».

- Appliquer les autorisations côté serveur pour chaque opération protégée.
- Vérifier séparément le rôle, la propriété de la ressource et les conditions métier.
- Ne jamais faire confiance à un rôle, identifiant de propriétaire, prix, statut ou permission transmis par le client.
- Déduire l'utilisateur actif de l'identité vérifiée côté serveur.
- Pour accéder à une ressource, la charger ou la rechercher en appliquant les contraintes de propriété et de visibilité nécessaires.
- Éviter les références directes non sécurisées aux objets : modifier un identifiant dans une URL ou un corps de requête ne doit pas donner accès aux données d'un autre utilisateur.
- Appliquer les autorisations aux lectures comme aux écritures.
- Traiter les opérations d'administration comme des opérations à haut risque et vérifier explicitement les permissions.
- Ne pas se reposer uniquement sur un middleware ; appliquer également les règles d'accès aux ressources à la frontière applicative appropriée.

Pour chaque endpoint protégé, tester au minimum :
1. une requête non authentifiée ;
2. un utilisateur authentifié et autorisé ;
3. un utilisateur authentifié mais non autorisé ;
4. une tentative d'accès à la ressource d'un autre utilisateur ;
5. des identifiants et champs invalides ou manipulés.

## 7. Validation des entrées et traitement des sorties

- Valider toutes les entrées non fiables aux frontières du système : Route Handlers, API, webhooks, métadonnées de fichiers téléversés et réponses de services externes.
- Utiliser des schémas ou validateurs explicites avec des contraintes claires.
- Vérifier le type, la longueur, le format, les limites, les valeurs autorisées et les conditions entre champs.
- Rejeter les champs inattendus ou interdits lorsque c'est pertinent.
- Ne pas considérer les types TypeScript comme une validation à l'exécution : ils disparaissent à l'exécution.
- Normaliser les données uniquement lorsque les règles métier définissent cette normalisation.
- Utiliser les opérations ORM sécurisées et les requêtes paramétrées ; ne jamais construire une requête SQL par concaténation de données non fiables.
- Encoder les sorties selon leur contexte de destination.
- Utiliser l'échappement normal de React pour le texte ordinaire. Ne pas utiliser `dangerouslySetInnerHTML` avec du contenu non fiable.
- Si du HTML enrichi est réellement nécessaire, utiliser un assainisseur maintenu avec une liste d'autorisation stricte et documenter ce besoin.
- Éviter de sérialiser directement des enregistrements complets de la base. Construire des DTO de réponse explicites qui ne contiennent que les champs visibles par le destinataire.

La validation n'est pas une autorisation. Un identifiant valide ne prouve pas que l'appelant a le droit de l'utiliser.

## 8. Sécurité de la base de données et de la persistance

- Prisma est la technologie d'accès aux données actuellement retenue, mais doit rester confiné à la couche Data.
- Utiliser les opérations ORM paramétrées ; ne pas construire de SQL brut à partir de chaînes contrôlées par l'utilisateur.
- Valider et autoriser avant les modifications sensibles.
- Appliquer les contraintes d'intégrité importantes dans la base en plus de la logique applicative lorsque c'est pertinent.
- Utiliser des transactions pour les modifications en plusieurs étapes qui doivent être atomiques.
- Ne pas exposer les identifiants de connexion à la base ni les erreurs internes de la base.
- Utiliser, lorsque c'est possible, des identifiants et rôles de base distincts et de privilèges minimaux pour le développement, les tests et la production.
- Ne pas utiliser de données personnelles de production dans les tests locaux sans autorisation explicite et protections adaptées.
- Éviter les requêtes trop larges qui chargent des champs personnels ou sensibles inutiles.
- Définir la conservation et la suppression des données selon les exigences produit et légales validées ; ne pas inventer de durées de conservation.

Une future migration de SQL vers NoSQL nécessite de réévaluer les transactions, la cohérence, l'unicité, les contraintes, le comportement des requêtes et les modèles d'autorisation. Ne pas supposer que changer uniquement l'adaptateur préserve la sécurité ou la correction.

## 9. Secrets et configuration

- Ne jamais versionner de vraies clés API, clés privées, mots de passe, URL de base de données, secrets de signature ou identifiants fournisseurs.
- Ne placer que des valeurs fictives dans les fichiers d'environnement d'exemple.
- Vérifier les variables d'environnement nécessaires au démarrage et échouer de manière sûre si une configuration critique manque.
- Garder les secrets réservés au serveur hors des variables exposées au navigateur (par exemple, les variables Next.js préfixées pour l'exposition publique).
- Utiliser des identifiants différents pour le développement, les tests et la production.
- Limiter les permissions des identifiants et les renouveler en cas de suspicion d'exposition.
- Ne pas coller de secrets dans les tickets, journaux de conversation, instantanés de tests ou documentation générée.
- Si un secret est exposé, le considérer comme compromis : le révoquer ou le renouveler, examiner les accès concernés et cesser de l'utiliser. Supprimer simplement le texte visible ne suffit pas.

Ne jamais fabriquer de valeurs secrètes ni prétendre qu'une valeur fictive est un identifiant fonctionnel.

## 10. Sécurité des API et HTTP

Pour chaque Route Handler ou endpoint API :

- Définir les méthodes HTTP autorisées et refuser les autres.
- Authentifier et autoriser avant d'exposer des données protégées ou d'exécuter une opération protégée.
- Valider les paramètres de route, paramètres de requête, en-têtes et corps de requête.
- Imposer des limites de taille adaptées à l'endpoint.
- Ne retourner que les données nécessaires à l'appelant.
- Utiliser des codes HTTP cohérents sans divulguer de détails internes.
- Appliquer des limites de débit ou protections contre les abus aux endpoints sensibles et coûteux.
- Configurer CORS de manière restrictive pour les origines connues lorsque l'accès cross-origin est nécessaire ; ne pas utiliser une origine générique avec des identifiants.
- Appliquer les en-têtes de sécurité appropriés au niveau de l'application ou de l'hébergement.
- Éviter les redirections ouvertes : valider les destinations avec une liste d'autorisation ou utiliser des chemins internes sûrs.
- Ne pas exposer les noms d'hôtes internes, traces d'exécution, diagnostics du framework ou détails d'infrastructure.

Ne pas ajouter aveuglément des règles CORS, CSRF ou cookies : déterminer d'abord si l'endpoint est same-origin, authentifié par cookie, par jeton ou appelé par un service de confiance.

## 11. Risques côté navigateur

Évaluer les risques suivants lorsqu'ils sont pertinents :

- **XSS :** afficher le texte non fiable de manière sûre ; assainir tout HTML enrichi explicitement pris en charge.
- **CSRF :** protéger les modifications authentifiées par cookie ; choisir `SameSite` et les contrôles par jeton selon le flux réel.
- **Clickjacking :** configurer les restrictions d'intégration en iframe adaptées au produit.
- **Redirection ouverte :** restreindre les destinations.
- **Détection de contenu et transport :** utiliser les en-têtes appropriés et HTTPS en production.
- **Stockage navigateur sensible :** ne pas placer de secrets ou données personnelles sensibles dans localStorage ou sessionStorage sans conception justifiée et documentée.

Ne pas copier une configuration générique d'en-têtes de sécurité sans vérifier sa compatibilité avec Next.js, les callbacks d'authentification, les ressources externes et l'environnement de déploiement.

## 12. Téléversement de fichiers et stockage objet

MinIO est le choix actuel pour le stockage. Tous les fichiers téléversés doivent être considérés comme non fiables, même lorsqu'ils proviennent d'un utilisateur authentifié.

- Authentifier l'émetteur et vérifier son droit d'accès à la ressource cible.
- Imposer une taille maximale et les types de fichiers autorisés.
- Ne pas faire confiance uniquement à l'extension du nom ou au type MIME fourni par le navigateur.
- Vérifier si possible la signature et le contenu du fichier pour les formats pris en charge.
- Générer les noms des objets côté serveur ; ne pas utiliser directement les noms fournis par l'utilisateur comme chemins de stockage.
- Empêcher la traversée de chemins et l'écrasement des objets d'un autre utilisateur.
- Garder les fichiers privés par défaut.
- Utiliser des URL signées de courte durée et de portée limitée lorsqu'un accès temporaire est nécessaire.
- Ne pas exposer les identifiants de stockage ni un accès illimité aux buckets dans le navigateur.
- Éviter de servir du contenu potentiellement actif depuis l'origine de confiance de l'application lorsqu'une origine de diffusion séparée est préférable.
- Envisager une analyse antivirus pour les types et parcours où le risque le justifie.
- Définir le comportement de suppression et de révocation d'accès des fichiers remplacés ou supprimés.

Ne pas accepter de types de fichiers exécutables ou dangereux sans besoin produit explicite et examiné.

## 13. Paiements, commandes, versements et remboursements

Les parcours liés aux paiements sont à fort impact et exigent une attention particulière.

- Ne jamais considérer un écran de succès frontend, une capture, un callback client ou une référence saisie par l'utilisateur comme preuve définitive de réception d'argent.
- Distinguer « paiement signalé » de « paiement vérifié » et des autres statuts uniquement selon les règles métier approuvées.
- Ne pas permettre à un acheteur ou vendeur de s'attribuer lui-même un statut de paiement vérifié.
- Vérifier les notifications externes de paiement avec le mécanisme de signature et d'authentification documenté du fournisseur si une intégration est introduite.
- Protéger les endpoints webhook contre les requêtes falsifiées et rejouées.
- Rendre les requêtes répétées sûres lorsque des traitements en double pourraient créer une incohérence financière ; utiliser des mécanismes d'idempotence adaptés au flux.
- Enregistrer l'acteur et les transitions sensibles pertinentes sans journaliser de secrets ni de données personnelles inutiles.
- Vérifier côté serveur les montants, la propriété de la commande, les transitions autorisées et l'éligibilité au remboursement selon les règles métier approuvées.
- Ne jamais inventer de remboursements automatiques, soldes de portefeuille, retraits ou garanties de paiement.

TopDeal utilise actuellement un processus de signalement manuel du paiement. Préserver ce processus validé tant que le responsable du produit ne l'a pas explicitement modifié. Ne pas créer de portefeuille utilisateur.

## 14. Données personnelles et confidentialité

TopDeal peut traiter des noms, coordonnées, CV, documents de vérification d'identité, conversations, historiques de commandes et preuves de paiement.

- Collecter uniquement les données nécessaires à une finalité produit définie.
- Restreindre les accès selon le rôle, la propriété et la finalité.
- Ne pas rendre publics par défaut les CV, documents d'identité, numéros de téléphone, conversations privées ou preuves de paiement.
- Éviter de placer des données personnelles dans les URL, événements analytiques, journaux ou messages d'erreur.
- Masquer ou omettre les champs sensibles des vues administratives lorsqu'ils ne sont pas nécessaires.
- Ne pas réutiliser les données personnelles pour une nouvelle finalité sans base approuvée.
- Implémenter la suppression, l'export, la correction et la conservation uniquement selon les exigences validées pour le produit et le droit applicable.
- Ne pas prétendre à une conformité légale sans évaluation documentée.

Pour la vérification d'identité, limiter l'accès aux documents soumis et séparer les décisions de vérification des informations publiques du profil.

## 15. Conversations, notifications et contenus utilisateurs

- Vérifier l'appartenance à une conversation lors de chaque lecture, envoi, modification, accès à une pièce jointe et suppression.
- Ne pas supposer que connaître l'identifiant d'une conversation donne le droit d'y accéder.
- Valider les messages et les données des notifications.
- Empêcher la falsification de l'identité de l'expéditeur ou de la propriété d'une notification.
- Traiter les descriptions d'annonces, messages, noms de fichiers et autres contenus utilisateurs comme non fiables.
- Éviter d'afficher du HTML arbitraire ou du contenu actif fourni par les utilisateurs.
- Appliquer des protections contre les abus, comme des limites de débit, lorsque nécessaire.
- Ne pas exposer le contenu privé d'une notification à des utilisateurs non concernés.

## 16. Services externes et intégrations

Firebase, MinIO, les fournisseurs d'e-mails, les fournisseurs de paiement et les futurs services constituent des frontières de confiance distinctes.

- Garder les identifiants fournisseurs côté serveur.
- Utiliser des permissions minimales et des politiques d'accès limitées.
- Vérifier les signatures ou mécanismes d'authentification des callbacks et webhooks entrants.
- Valider les réponses externes avant de les utiliser.
- Définir des délais d'attente et gérer les défaillances sans exposer de détails internes.
- Ne transmettre à un fournisseur que les données personnelles nécessaires à l'intégration.
- Ne pas laisser les types de réponse propres à un fournisseur se propager dans la logique métier.
- Documenter les hypothèses de sécurité de chaque intégration.

## 17. Dépendances et chaîne d'approvisionnement logicielle

- Préférer des packages maintenus, réputés et ayant un objectif clair.
- Éviter d'ajouter une dépendance pour un petit utilitaire pouvant être implémenté simplement et sûrement.
- Examiner le nom du package, son mainteneur, son dépôt, son historique de versions et les permissions requises avant son introduction.
- Mettre à jour les dépendances de manière contrôlée.
- Examiner les avis de sécurité et les résultats d'audit des dépendances.
- Ne pas appliquer aveuglément des mises à jour automatiques pouvant introduire des changements incompatibles.
- Versionner et préserver le fichier de verrouillage.
- Ne pas installer de packages ni exécuter de scripts provenant de sources non fiables sans examen.
- Traiter les scripts de build et post-installation comme du code exécutable.

Lorsqu'un audit signale une vulnérabilité, identifier les chemins de dépendance concernés, le code réellement accessible, la gravité, les correctifs disponibles et l'impact de compatibilité. Ne pas masquer ou écarter un résultat sans explication.

## 18. Journaux, surveillance et gestion des erreurs

- Journaliser les événements pertinents pour la sécurité, comme les échecs d'authentification répétés, les refus d'opérations privilégiées et les changements d'état sensibles, lorsque c'est approprié.
- Conserver assez de contexte pour une investigation sans enregistrer mots de passe, jetons, documents d'identité complets, secrets de paiement ou contenu inutile de messages.
- Éviter de renvoyer des traces d'exécution ou exceptions internes aux clients.
- Utiliser des réponses d'erreur publiques stables et conserver les détails de diagnostic uniquement dans des journaux serveur protégés.
- Restreindre l'accès aux journaux et définir leur durée de conservation selon les exigences opérationnelles validées.
- Ne pas prétendre qu'une surveillance ou des alertes existent si elles ne sont pas configurées et vérifiées.

## 19. Tests de sécurité

Les tests de sécurité doivent vérifier les opérations autorisées et celles qui doivent être refusées.

Pour chaque fonctionnalité concernée, envisager :

- accès sans authentification ;
- rôle ou permission insuffisant ;
- accès à la ressource d'un autre utilisateur ;
- entrée malformée, trop volumineuse, inattendue ou en limite de plage ;
- champs de propriété, rôle, statut ou montant manipulés ;
- requêtes répétées et tentatives de rejeu pour les opérations sensibles ;
- authentification expirée ou invalide ;
- réponses d'erreur susceptibles de divulguer des informations ;
- comportement des limites de débit sur les endpoints exposés aux abus ;
- accès aux fichiers privés et expiration des URL signées ;
- validation de signature des webhooks, le cas échéant.

Utiliser des données de test synthétiques. Ne jamais exécuter de tests destructifs en production ou sur des données réelles sans autorisation explicite et plan contrôlé.

Un test unitaire réussi ne prouve pas que toute l'application est sécurisée. Combiner, selon le besoin, tests unitaires, intégration, bout en bout, audit de dépendances, vérification de configuration et revue manuelle.

## 20. Procédure de revue de sécurité

Avant de terminer une modification liée à la sécurité, répondre aux questions suivantes :

1. Quels actifs et quelles données cette modification touche-t-elle ?
2. Quelle identité est considérée comme fiable et comment est-elle vérifiée ?
3. Où l'autorisation est-elle appliquée ?
4. Les entrées sont-elles validées à la frontière ?
5. Des données sensibles ou secrets peuvent-ils fuiter dans les réponses, journaux, URL ou bundles client ?
6. Les services externes et fichiers téléversés sont-ils considérés comme non fiables ?
7. Des requêtes répétées, réordonnées ou non autorisées peuvent-elles causer un dommage ?
8. Quels tests négatifs de sécurité ont été exécutés ?
9. Quels éléments restent non vérifiés ?

Si un contrôle critique manque, ne pas déclarer la fonctionnalité prête pour la production. Expliquer le manque et proposer une prochaine étape sûre.

## 21. Format du compte rendu

Pour un travail lié à la sécurité, indiquer :

- **Périmètre :** fichiers, endpoints, données et flux examinés ou modifiés.
- **Contrôles ajoutés ou vérifiés :** authentification, autorisation, validation, confidentialité, limites de débit, etc.
- **Tests :** vérifications exactes exécutées et résultats.
- **Constats :** problèmes trouvés, justification de leur gravité et état de correction.
- **Risques résiduels :** hypothèses, zones non testées et contrôles dépendant du déploiement.

Utiliser les niveaux de gravité de manière cohérente :
- **Critique :** compromission probable de l'application ou impact large sur les données sensibles ou les privilèges.
- **Élevé :** accès non autorisé grave, compromission de compte ou exposition de données sensibles.
- **Moyen :** faiblesse de sécurité significative mais limitée.
- **Faible :** impact limité ou amélioration de défense en profondeur.
- **Informatif :** observation ou recommandation de renforcement sans vulnérabilité démontrée.

Ne pas reprendre uniquement la gravité d'un scanner ; expliquer l'impact réel et si le code concerné est accessible.

## 22. Définition de terminé — checklist sécurité

- [ ] Les données sensibles et frontières de confiance ont été identifiées.
- [ ] L'authentification est vérifiée côté serveur lorsque nécessaire.
- [ ] L'autorisation est appliquée côté serveur pour les lectures et écritures.
- [ ] Les rôles et identifiants de propriété ne sont pas crus lorsqu'ils viennent du client.
- [ ] Toutes les entrées non fiables sont validées à l'exécution.
- [ ] Les réponses n'exposent que les champs autorisés.
- [ ] Les secrets ne sont ni versionnés, ni journalisés, ni envoyés au navigateur.
- [ ] Les opérations de base de données utilisent des API paramétrées sûres.
- [ ] Les téléversements et callbacks externes sont considérés comme non fiables.
- [ ] Les opérations sensibles disposent de protections adaptées à l'intégrité et au rejeu.
- [ ] Les données personnelles sont minimisées et leur accès restreint.
- [ ] Les tests négatifs pertinents ont été exécutés.
- [ ] Les risques liés aux dépendances et à la configuration ont été examinés.
- [ ] Les contrôles non vérifiés et risques résiduels sont signalés.
- [ ] Aucune garantie de sécurité absolue n'est formulée.
