# Mémoire de travail TopDeal

## Prochaine séance

- Le propriétaire souhaite reprendre le code Auth pour le rendre plus maintenable, sécurisé et évolutif, avec des responsabilités atomiques et des commentaires utiles, sans transformer les modules en fourre-tout.
- Consulter les skills `architecture`, `nomenclature`, `evolutivite` et `securite`, ainsi que `performance-skill` pour examiner les accès aux données et la rapidité de l’application. Suivre aussi `design-system` si les écrans Auth sont touchés.
- Commencer par cartographier les fichiers et responsabilités réels, identifier les duplications et dépendances croisées, puis proposer un plan de refactorisation par petits lots avant de modifier largement.
- Garder les parcours `/connexion` et `/inscription` distincts. Le propriétaire a confirmé que le conflit affiché lors de la complétion du profil venait d’une erreur de saisie de son côté ; le parcours fonctionne maintenant. Ne pas reprendre le diagnostic de collision sans nouveau symptôme.
- Aucune refactorisation n’a été réalisée dans la séance de préparation ; les derniers contrôles TypeScript, lint et `git diff --check` passaient après la séparation des parcours.

## Correctif courant — séparation connexion / inscription (16 novembre 2026)

- Correction de la décision précédente : un compte absent ne doit pas être créé ou bloqué dans `/connexion`. `CreateWebSessionUseCase` n’interroge plus l’adresse e-mail ; une identité Firebase non liée reçoit `registration_required`. Les identités déjà liées continuent le parcours normal de connexion.
- Ajout de `/inscription` avec Firebase e-mail/mot de passe ou Google. Le compte e-mail/mot de passe est créé dans Firebase, puis Firebase envoie le lien de vérification. Un nouveau compte Google doit lier un mot de passe au même UID, conformément à la décision déjà validée.
- Après vérification Firebase, `POST /api/auth/registration/eligibility` contrôle le jeton, l’état `email_verified`, l’identité externe et l’utilisation de l’adresse TopDeal. En cas de doublon, le formulaire de profil n’est pas affiché ; aucune identité n’est liée automatiquement.
- Après éligibilité, l’utilisateur complète prénom, nom, téléphone et date de naissance. La création TopDeal reste dans la transaction existante, avec contrôles serveur d’âge et de doublons comme garde contre les courses concurrentes.
- Changements principaux : `packages/features/auth/domain/use-cases/CheckAuthRegistrationEligibilityUseCase.ts`, les nouveaux Use Cases d’inscription et contrôles client dans `packages/features/auth/domain/use-cases/`, les adaptateurs Firebase/gateway, `apps/web/app/api/auth/registration/eligibility/route.ts`, `/inscription` et ses écrans.
- Nouvelle revue à la demande du propriétaire, avec la documentation officielle Firebase : `createUserWithEmailAndPassword` crée un compte, `signInWithEmailAndPassword` connecte un compte existant ; le popup Google peut créer l’identité Firebase au premier passage, tandis que TopDeal sépare l’inscription métier de la connexion par son état interne. `linkWithCredential` est une liaison de fournisseurs, pas la connexion TopDeal.
- Correction du mélange d’interface : `/connexion` ne demande plus d’ajouter un mot de passe Google. Le mot de passe Google requis dans le parcours retenu n’est demandé que sous `/inscription`. `SignInUseCase` et `AuthRegistrationResult` sont distincts ; `AddEmailPasswordScreen` et son erreur de connexion ont été remplacés par un écran d’inscription propre, avec seulement le formulaire de mot de passe partagé.
- Références Firebase consultées : Password auth (`https://firebase.google.com/docs/auth/web/password-auth`), Google sign-in (`https://firebase.google.com/docs/auth/web/google-signin`), account linking (`https://firebase.google.com/docs/auth/web/account-linking`) et gestion/vérification d’e-mail (`https://firebase.google.com/docs/auth/web/manage-users`).
- Vérifications : TypeScript, lint Web et `git diff --check` passent. Aucun test automatisé, appel Firebase réel, ni accès aux données d’utilisateurs n’a été effectué. Le test manuel des parcours Google et e-mail/mot de passe reste à faire.

## État courant — 16 novembre 2026

- Le parcours Web de connexion est maintenant interactif : Google et e-mail/mot de passe passent par le Firebase Web SDK, un Use Case Auth, puis l’échange de jeton same-origin existant pour créer un cookie serveur HttpOnly.
- Après une connexion Google, un compte sans fournisseur mot de passe doit lier un mot de passe Firebase au même UID avant de continuer ; cette étape est obligatoire. Aucun mot de passe ne transite par l’API TopDeal ou PostgreSQL. La liaison d’un e-mail déjà associé à un autre compte est refusée, sans fusion automatique. Après la liaison, l’adaptateur force le renouvellement du jeton pour que le serveur reçoive le claim `email_verified` à jour.
- Si Firebase indique que l’adresse n’est pas vérifiée, `/connexion` affiche maintenant un écran permettant d’envoyer le courriel de vérification puis de recharger l’identité et retenter la session. La vérification serveur reste obligatoire ; le courriel n’a pas été envoyé par l’agent et le parcours doit être testé par le propriétaire.
- Les nouvelles identités vérifiées qui n’ont pas encore de profil TopDeal peuvent compléter prénom, nom, téléphone et date de naissance. Le serveur valide l’âge minimum de 18 ans, vérifie le jeton Firebase et crée utilisateur + identité externe dans une transaction Prisma.
- Composition Roots Awilix séparés : `apps/web/di/container.ts` côté serveur et `apps/web/di/clientAuthContainer.ts` côté navigateur. Les imports Firebase Admin restent côté serveur ; Firebase Web est une dépendance de `@topdeal/feature-auth`.
- Vérifications du dernier lot : lint Web, TypeScript et `git diff --check` passent. Le build Turbopack a échoué dans un worker CSS (création d’un processus enfant) ; un build Webpack de repli a ensuite échoué avec `EPERM` à la création de `apps/web/.next/server/app/connexion`. Aucun test automatisé ni appel Firebase réel n’a été effectué.
- Aucun appel Firebase réel n’a été fait. La clé privée Admin signalée compromise doit être révoquée/remplacée avant le test manuel ; le secret MinIO apparu dans le contexte doit aussi être remplacé s’il est encore actif. La récupération de compte et la création d’identité Firebase e-mail depuis l’interface restent hors parcours.
- Le propriétaire a confirmé que Firebase Web et Firebase Admin sont déjà configurés dans `apps/web/.env.local` ; les paramètres `S3_*` de ce fichier concernent MinIO. `DATABASE_URL` a été copié depuis `packages/database/.env` vers `apps/web/.env.local` sans afficher sa valeur, ce qui a corrigé le 500 de création de session. Ne pas afficher les valeurs de `.env.local`. Le fichier `apps/web/firebase-auth.env.example` est un modèle non utilisé pour l’environnement courant.
- Périmètre confirmé par le propriétaire : terminer `/connexion` d’abord ; la page d’inscription avec nom, téléphone, e-mail et les autres champs sera traitée plus tard. Sur la page actuelle, un nouvel utilisateur Google doit obligatoirement définir un mot de passe avant de continuer. Ne pas ajouter ici la création autonome de comptes e-mail/mot de passe.
- Incident initial apres verification Firebase : le formulaire de profil signalait un conflit tardif. Le premier correctif a place a tort le controle dans la connexion ; correction du 16 novembre : le controle a ete deplace vers le parcours d inscription, avant l affichage du profil. Aucune donnee DB n a ete consultee.
- Lors du test de connexion Google après liaison du mot de passe, le propriétaire a reçu `Vérifiez votre adresse e-mail avant de vous connecter` et l’endpoint de session a répondu 403. La réponse correspond au contrôle serveur `email_verified`. Le parcours d’envoi/contrôle d’e-mail est maintenant présent ; lint, TypeScript et `git diff --check` passent. Aucun appel Firebase réel n’a été fait ; retest manuel en attente.
- Après rotation de la clé Admin, le propriétaire pourra tester : activer Google et E-mail/Mot de passe dans Firebase Auth, autoriser `localhost`, puis lancer le Web. Une première connexion Google ou e-mail Firebase vérifiée sans profil TopDeal passe par la complétion du profil.

Dernière mise à jour : 16 novembre 2026
État : liaison Google et e-mail/mot de passe implémentée ; test manuel propriétaire à effectuer. La création d’identifiants e-mail/mot de passe indépendants depuis l’interface et la récupération de compte restent hors parcours. La clé Firebase Admin signalée compromise doit être remplacée ; aucun appel Firebase réel n’a été fait par l’agent.

## Rôle de cette mémoire

Ce fichier est la mémoire de continuité du projet pour le propriétaire et les agents qui y travaillent. Il indique l’objectif, les règles, les décisions établies, les points ouverts, l’état réel du dépôt et la prochaine étape.

Après chaque lot de changements au projet, mettre à jour ce fichier avec les fichiers modifiés, les vérifications, les décisions prises et les questions restantes. Ne pas présenter une proposition comme une décision validée.

`docs/DIRECTION_DESIGN_SYSTEM.md` conserve le relevé initial des maquettes ; en cas de différence sur l’avancement actuel, cette mémoire est la source de suivi.

## Dernière intervention — parcours Auth Web

- Ajouté `SignInUseCase`, `CompleteAuthProfileFromWebUseCase`, les ports client Auth/session et l’erreur métier de connexion ; le Domain ne dépend pas de Firebase Web, Awilix ou Next.js.
- Ajouté les adaptateurs `FirebaseWebSignInProvider` (Google popup, e-mail/mot de passe, persistance mémoire) et `FetchWebSessionGateway` (échange same-origin et complétion de profil). Firebase Admin demeure dans Data côté serveur.
- Rendu `/connexion` fonctionnel pour la connexion. Pour un profil manquant, le jeton Firebase reste uniquement en mémoire ; le formulaire de profil demande les champs validés et POST `/api/auth/profile` vérifie le jeton, l’e-mail vérifié, le format/date/âge et les conflits. La transaction Prisma crée ou complète le profil associé au même UID Firebase, sans liaison automatique à un compte portant seulement la même adresse.
- Extrait le cookie de session HttpOnly dans `sessionResponse.ts` pour le partager entre les routes `/api/auth/session` et `/api/auth/profile`. Corps JSON plafonné à 8 Kio, champs stricts et garde-fou same-origin conservé.
- Créé `apps/web/firebase-auth.env.example` avec les variables nécessaires, sans valeur de secret. La config Web Firebase doit fournir `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` ; la config Admin privée existante reste côté serveur.
- `pnpm install --ignore-scripts` a mis à jour les dépendances workspace/lockfile ; Firebase Web est déclaré dans le package Auth, plus dans `apps/web`.
- Vérifications : lint Web OK ; lint Auth OK (avertissement du plugin Next « Pages directory » car le package est volontairement hors `apps/web`) ; TypeScript OK ; `next build --webpack` OK, routes `/api/auth/profile` et `/api/auth/session` produites. Avertissement Webpack Awilix sur une dépendance dynamique. Le build Turbopack par défaut a échoué à deux reprises pendant l’évaluation CSS avec un worker Node qui sort sans erreur ; le build Webpack a contourné ce problème. Un premier build Webpack sans accès réseau a été bloqué par `next/font` et Google Fonts ; avec réseau, le build a réussi.
- Correction après revue read-only : `SignInUseCase` laisse maintenant le nettoyage Firebase s’exécuter après les erreurs Firebase reconnues ; seule la réponse `profile_required` conserve temporairement l’identité en mémoire pour le formulaire de profil.
- Diagnostic local autorisé : `FirebaseWebSignInProvider` journalise maintenant uniquement un code `auth/...` filtré dans la console navigateur en développement. Aucun message brut, e-mail, mot de passe ou jeton n’est journalisé ; lint et TypeScript passent. Aucun appel Firebase n’a été fait par l’agent.
- Correction approuvée après observation de `auth/argument-error` sur le bouton Google : `initializeAuth` reçoit désormais `browserPopupRedirectResolver` en plus de la persistance mémoire. La documentation Firebase confirme que `signInWithPopup` exige ce résolveur si `getAuth()` ne fournit pas les dépendances par défaut. TypeScript, lint Web et `git diff --check` passent ; connexion réelle encore à retester par le propriétaire.
- Aucun test unitaire/e2e n’a été exécuté dans ce lot et aucun appel Firebase n’a été fait. La clé Firebase Admin a été exposée dans le contexte ; elle reste à révoquer/remplacer avant le test manuel. Le parcours de création d’identité Firebase e-mail depuis l’UI et la récupération de mot de passe ne sont pas implémentés ; après création/vérification côté Firebase, une première connexion e-mail peut désormais compléter le profil TopDeal.
- Prochaine étape : après rotation de la clé exposée, vérifier la configuration Firebase Console et tester Google puis e-mail/mot de passe avec une adresse vérifiée. Une identité e-mail Firebase vérifiée et non liée peut compléter son profil TopDeal au premier accès ; la création de l’identité Firebase depuis l’interface et la récupération de mot de passe restent hors périmètre. Ne jamais afficher ni copier les secrets dans le chat.

## Objectif courant

Achever l’authentification Web sans réécriture globale : connexion Google et e-mail/mot de passe, création de session serveur et complétion du profil requis. Avant tout appel Firebase réel, confirmer la révocation/remplacement de la clé exposée ; la récupération de compte reste hors périmètre.

## Règles à suivre

- Lire `AGENTS.md` avant d’intervenir.
- Pour toute modification de code, consulter au minimum les skills architecture, nomenclature et évolutivité.
- Pour le Design System, suivre `.agent/skills/design-system-skill/SKILL.md` et `references/design-system-reference.md`.
- Pour l’authentification, consulter également le skill sécurité et vérifier les règles fonctionnelles et métier applicables.
- Ne pas ajouter de dossier `src`.
- Le Design System vit dans `packages/ui` ; il reste indépendant des fonctionnalités et de l’application Web.
- Les composants UI sont génériques, accessibles, sans accès réseau, métier, DI ou base de données.
- Les valeurs visuelles viennent de tokens partagés. Ne pas inventer les couleurs d’état non validées, les breakpoints, le thème sombre ou les comportements absents des maquettes.
- Travailler écran par écran et faire valider les choix visuels qui changent sensiblement le rendu attendu.
- Le domaine d’une fonctionnalité ne dépend pas de Next.js, React, Awilix, Prisma ou Firebase ; le Composition Root reste dans `apps/web`.

## Direction visuelle de référence

Les maquettes communiquées montrent une marketplace française claire, sobre et chaleureuse : fond `#FAF9F7`, surfaces blanches, tons bruns, tuiles d’image beige et accent orange `#B8531A` réservé aux actions principales. La police cible est Schibsted Grotesk, avec fallback.

Références écrites actuelles : contenu desktop centré autour de 1200 px, marge habituelle de 24 px, en-tête de 76 px, champ standard de 46 px, bouton standard de 44 px, rayons de 12 px pour cartes/champs/recherche, 10 px pour boutons, bordure de 1 px et absence d’ombre dans le thème clair.

Les maquettes diffèrent parfois (dimensions, rayons et responsive). Ces écarts doivent être comparés avant de devenir des règles globales. Le propriétaire a validé le rouge `#A33D35` de « commandes et ventes » pour les erreurs de champ. La maquette Auth fournit en plus un fond `#FAEFED` pour son alerte et `#F8F6F3` pour son avis ; ces deux tons sont exposés comme tokens et leur usage reste limité à cette maquette, sans validation d’une palette d’état globale. Les breakpoints numériques, la palette sombre et la bibliothèque d’icônes restent à confirmer.

Les HTML originaux fournis se trouvent dans le dossier `Downloads` local du propriétaire, pas dans le dépôt. Un autre agent peut ne pas y avoir accès ; les observations et décisions utiles doivent donc rester consignées ici.

## Plan et état d’avancement

| Étape | Travail | État |
|---|---|---|
| 0 | Conserver la mémoire et le plan de continuité dans ce fichier | Terminé |
| 1 | Établir les tokens de base confirmés et les relier au thème Tailwind/UI | Terminé ; token d’erreur de champ validé, autres couleurs d’état exclues |
| 2 | Construire les composants UI fondamentaux nécessaires, avec variantes et états accessibles | Première version de Button, Input et Card avec état d’erreur approuvé |
| 3 | Vérifier les composants dans une page de démonstration aux tailles pertinentes, comparer aux maquettes et faire valider | Vérifiée sur desktop/mobile ; direction de base, texte 14 px et rouge d’erreur approuvés |
| 4 | Examiner le périmètre et les décisions d’authentification, résoudre les ambiguïtés avant le parcours UI | Terminé ; méthodes, profil, vérification e-mail, liaison et session cadrés |
| 5 | Réaliser l’aperçu de connexion selon la maquette, avec les interactions visuelles nécessaires sans simuler une authentification | Terminé ; actions d’authentification toujours désactivées |
| 6 | Faire valider l’écran et traiter l’en-tête/pied de page dans un layout partagé | Écran validé par le propriétaire ; shell reporté au layout partagé |
| 7 | Cadrer profil, liaison des méthodes, session, vérification e-mail et récupération avant l’intégration Firebase | Terminé ; règles et durée de 14 jours validées, récupération reportée |
| 8 | Proposer l’écran de complétion de profil après Google en réutilisant la forme de la connexion | Terminé et validé par le propriétaire ; aperçu non fonctionnel disponible sur `/design-system/auth-profile` |
| 9 | Implémenter l’authentification par couches, derrière les contrats nécessaires, avec Firebase isolé dans Data et assemblage dans `apps/web` | Première tranche réalisée : use case, adaptateurs, conteneur Awilix et route de session ; aucun appel Firebase n’a été exécuté |
| 10 | Vérifier les cas autorisés/refusés, les erreurs, les tests et les frontières de sécurité | Lint, build et tests ciblés CSRF réussis ; tests d’intégration Firebase différés jusqu’à la rotation de la clé |
| 11 | Remettre progressivement les responsabilités et les points d’entrée des packages au clair, sans réécriture globale | En cours ; premier lot local décrit dans le journal du 16 novembre 2026 ; vérifications non encore exécutées |

### Questions à résoudre avant d’élargir les tokens

- Champs et boutons varient en taille entre les maquettes ; les références écrites donnent 46 px et 44 px.
- Les breakpoints des maquettes ne sont pas cohérents et ne sont pas définis comme tokens globaux.
- Les couleurs succès/alerte apparaissent dans certaines maquettes, mais restent à valider ; seul le rouge d’erreur des champs est approuvé.
- Les espacements de formulaire ajoutés aux premiers composants proviennent des motifs récurrents des maquettes ; ils restent ajustables après la comparaison visuelle.

### Décisions Auth validées et points techniques restant à résoudre

- Le propriétaire a choisi Google comme méthode prioritaire, puis e-mail/mot de passe ; cette décision remplace les modes seulement envisagés dans la spécification.
- Firebase propose l’authentification téléphone par code SMS à usage unique et l’authentification e-mail/mot de passe ; le téléphone/mot de passe demanderait un mécanisme distinct, à valider explicitement. Références : [Firebase Phone Auth](https://firebase.google.com/docs/auth/web/phone-auth) et [Firebase Email/Password Auth](https://firebase.google.com/docs/auth/web/password-auth).
- La spécification exige prénom, nom, téléphone unique, date de naissance et âge minimum de 18 ans à l’inscription. Décision confirmée : un nouvel utilisateur Google doit compléter les champs obligatoires de son profil avant tout accès au compte. La première proposition de présentation est créée ; la vérification serveur reste à implémenter.
- Décision confirmée : ne pas lier Google et e-mail/mot de passe sur la seule égalité d’adresse. L’utilisateur doit prouver l’accès au compte existant, puis déclencher explicitement la liaison. Les cas de conflit et le traitement d’une adresse non vérifiée restent à spécifier.
- Décision confirmée : exiger une adresse e-mail vérifiée avant tout accès au compte. L’état doit venir d’une source fournisseur fiable et être contrôlé côté serveur.
- Décision confirmée : gérer la session Web au moyen d’un cookie de session Firebase validé côté serveur, avec attributs `HttpOnly`, `Secure` en production et `SameSite` adapté. La révocation et le renouvellement restent à définir.
- Décision confirmée : durée maximale de session de 14 jours, dans la limite documentée par Firebase. Le renouvellement/renouvellement glissant et la révocation restent à définir.
- Firebase documente une expiration de cookie de session configurable de 5 minutes à 2 semaines et recommande de prendre en compte la protection CSRF lors de l’échange de jeton : [Gestion des cookies de session Firebase](https://firebase.google.com/docs/auth/admin/manage-cookies). La durée de 14 jours et le garde-fou CSRF Web same-origin sont validés.
- Décision confirmée : une adresse e-mail vérifiée ne peut appartenir qu’à un seul compte TopDeal, toutes méthodes confondues. RG-004 est alignée. Le schéma Prisma ne représente pas encore l’index fonctionnel existant dans la base ; seules les adresses vérifiées devront être persistées.
- La base locale a été interrogée en lecture seule avant le baseline : zéro e-mail non vide, zéro doublon normalisé et zéro e-mail vide. Elle possède `uq_utilisateur_email`, index unique sur `lower(email)` avec prédicat `email IS NOT NULL`, non représentable par le schéma Prisma courant.
- Le baseline Prisma a été généré depuis `schema.prisma`, complété avec les 31 contraintes `CHECK` et l’index fonctionnel e-mail, puis exécuté dans un schéma temporaire au sein d’une transaction annulée. Les 29 tables, 31 contraintes `CHECK`, 59 clés étrangères et l’index fonctionnel correspondent à la base existante.
- Après comparaison, `prisma migrate resolve --applied 20261114190000_baseline` a créé l’historique et marqué le baseline comme appliqué sur la base locale, sans exécuter son SQL contre les tables existantes. `prisma migrate status` confirme que la base est à jour.
- Pour toute autre base déjà provisionnée, vérifier l’équivalence avant de marquer le baseline comme appliqué ; pour une base vide, utiliser `prisma migrate deploy`.
- Protection CSRF Web validée : endpoints Auth same-origin uniquement, sans CORS ; mutations en `application/json` avec en-tête personnalisé, `Origin` comparé à `AUTH_APP_ORIGIN` côté serveur et contrôle de `Sec-Fetch-Site`. Le cookie reste `SameSite=Lax`. Les clients mobiles futurs auront un contrat distinct, pas d’exception CORS sur ces routes.
- Aucune adresse e-mail utilisateur n’a été lue ou affichée. Une clé privée Firebase Admin a toutefois été affichée accidentellement dans une sortie d’outil ; elle doit être traitée comme compromise et remplacée.
- La procédure de récupération de mot de passe est reportée à plus tard ; la maquette ne doit pas encore naviguer vers un parcours non défini.
- Vérifier les règles de permissions sans propager les types Firebase dans le domaine.
- `apps/web/di/container.ts` expose `buildContainer`, `getContainer` et `resolveCreateWebSessionUseCase`. L’instance Awilix est conservée dans un singleton au niveau du module ; les registrations utilisent `asClass` pour les composants Auth et `asValue` pour Prisma.
- Le propriétaire a demandé et validé la même forme de carte que l’écran de connexion pour la complétion de profil. La page reste un aperçu non fonctionnel et non protégée ; aucune interface ne crée ni ne contrôle encore une session pour cet aperçu, et les champs ne sont pas traités ou enregistrés.

## État vérifié du dépôt

- `apps/web` contient les routes Next.js, le Composition Root Awilix (`di/container.ts`) et la validation same-origin des mutations Auth (`security/authRequest.ts`).
- `POST /api/auth/session` valide une requete JSON bornee, appelle `CreateWebSessionUseCase` et pose un cookie `HttpOnly`, `SameSite=Lax` et `Secure` en production. Le parsing de l'entree et la conversion des refus HTTP sont isoles dans `sessionRequest.ts` et `sessionResponse.ts`.
- `packages/features/auth` expose des points d’entrée distincts `./domain` et `./data`, en plus de son entrée de présentation. Le Use Case et les contrats restent dans `domain` ; les adaptateurs Firebase Admin et Prisma restent dans `data`. Aucun flux d’inscription ou de complétion de profil fonctionnel n’est présent.
- Les packages `@topdeal/feature-annonce` et `@topdeal/core` ne sont pas présents : leurs seuls fichiers étaient des points d’entrée vides sans consommateur. Les recréer lorsque la feature Annonce aura du code ou qu’un contrat sera réellement partagé.
- `packages/database` contient le schema Prisma et le baseline initial ; le baseline est enregistre comme applique sur la base locale.
- `packages/ui` contient les tokens partages et les composants `Button`, `Input` et `Card`. Les choix visuels valides et les points encore ouverts sont decrits dans `docs/DIRECTION_DESIGN_SYSTEM.md`.
- Les apercus de connexion et de completion de profil ne soumettent ni n'enregistrent de donnees. La recuperation de mot de passe est reportee.
- Une cle privee Firebase Admin a ete exposee dans une sortie d'outil anterieure : attendre la confirmation de sa rotation avant tout appel Firebase reel. Aucun appel Firebase reel n'a ete effectue par le lot de remise en ordre.
- Les changements presents avant ce lot etaient deja locaux et non commites ; ils ont ete preserves.
- Le lint et le build Next.js passent sur l’état courant ; le build a terminé le contrôle TypeScript. Le test unitaire du Use Case passe ; aucun test n’a contacté Firebase ou la base de données.

## Journal de progression


### 16 novembre 2026 - premier lot de remise en ordre

- Le proprietaire demande une architecture modulaire et atomique : une responsabilite claire par dossier et par fichier, avec DRY/KISS sans abstractions superflues.
- Consulte le skill `conception-logicielle-system-design`, les references architecture, nomenclature, evolutivite et securite, ainsi que la documentation locale Next.js sur les Route Handlers.
- Corrige `packages/features/annonce/package.json` : retrait des references au dossier `src` interdit/inexistant et de la dependance `@topdeal/core` inutilisee ; aligne l'importeur correspondant dans `pnpm-lock.yaml`.
- Extrait le parsing et la validation bornee du corps dans `apps/web/app/api/auth/session/sessionRequest.ts`, et la traduction des refus applicatifs dans `sessionResponse.ts`. `route.ts` conserve l'orchestration HTTP et la pose du cookie.
- Reconcile la section d'etat verifie ci-dessus ; le journal des decisions anterieures reste conserve.
- Aucune verification automatisee ni aucun appel Firebase n'a ete execute pour ce lot.
- Prochaine etape : relire les frontieres des modules restants et traiter un seul lot supplementaire si une responsabilite mal placee est confirmee. Ne pas lancer Firebase avant confirmation de rotation de la cle.

### 16 novembre 2026 - retrait des packages et exports vides

- Vérifié que `packages/core/index.ts`, `packages/features/annonce/index.ts`, `packages/ui/tokens/breakpoints.ts` et `packages/ui/styles/globals.css` étaient vides.
- Vérifié qu’aucun code n’importait `@topdeal/core`, `@topdeal/feature-annonce` ou les breakpoints ; `styles/globals.css` n’était pas utilisé et son export était inutile.
- Retiré les packages `core` et `annonce` sans code ni consommateur, retiré les deux fichiers UI vides et supprimé l’export UI correspondant. Les thèmes et styles de composants utilisés restent exportés.
- Retiré leurs importeurs du workspace et du lockfile ; aucun import ne référence les packages ou exports retirés.
- Retiré également leurs dossiers vides et le lien `node_modules/@topdeal/core` orphelin ; aucune autre partie de `node_modules` n’a été supprimée.
- Ces packages pourront être créés quand une responsabilité métier ou transversale réelle sera implémentée.
- Aucune vérification automatisée n’a été exécutée.

### 16 novembre 2026 - Composition Root Awilix Auth

- Le propriétaire a précisé le style Awilix attendu : construction explicite du conteneur, instance paresseuse, résolveur dédié et cradle séparé.
- Ajouté `apps/web/di/types.ts` pour le type `AuthCradle`.
- Réorganisé `apps/web/di/container.ts` autour de `buildContainer()`, `getContainer()` et `resolveCreateWebSessionUseCase()`. Les classes du domaine et de Data sont enregistrées avec `asClass`, Prisma avec `asValue` ; aucune dépendance Awilix n’a été ajoutée au domaine.
- La route `POST /api/auth/session` appelle maintenant le résolveur dédié au lieu de résoudre elle-même un nom dans le conteneur.
- Choix appliqué à la demande du propriétaire : singleton au niveau du module, conformément au style fourni, au lieu du cache `globalThis` antérieur.
- Revue statique des frontières Auth : aucun import Prisma, Firebase, Awilix ou Next.js dans `domain` et aucun import d’infrastructure dans `presentation` ; la présentation importe React comme attendu. Le module `security/authRequest.ts` et son fichier de tests ont chacun une responsabilité cohérente et n’ont pas été déplacés.
- Aucune vérification automatisée n’a été exécutée ; aucun appel Firebase n’a été effectué.

### 16 novembre 2026 - points d'entree par couche Auth

- Le Composition Root ne doit pas importer le Use Case et les adaptateurs via un barrel serveur commun.
- Ajouté les exports publics `@topdeal/feature-auth/domain` et `@topdeal/feature-auth/data`. Le point d’entrée Data porte `server-only` ; le point d’entrée Domain n’exporte que le métier, ses contrats et types.
- Mis à jour le Composition Root, le cradle et les imports HTTP pour cibler la couche appropriée ; supprimé l’ancien `server.ts` qui mélangeait ces exports.
- Aucune vérification automatisée n’a été exécutée ; aucun appel Firebase n’a été effectué.

### 16 novembre 2026 - verification du decoupage

- Le lint a d’abord signalé un import `PrismaClient` inutilisé dans `apps/web/di/container.ts` ; cet import a été retiré.
- `pnpm.cmd --filter @topdeal/web lint` passe sans avertissement après correction.
- `pnpm.cmd --filter @topdeal/web build` passe, compilation et contrôle TypeScript inclus.
- Aucun test unitaire n’a été exécuté et aucun appel Firebase n’a été effectué.
- Revue du Use Case et des adaptateurs : orchestration des règles d’accès dans le domaine ; vérification Firebase isolée dans l’adaptateur Firebase ; lecture et mapping Prisma isolés dans le repository. Aucun autre déplacement justifié.

### 16 novembre 2026 - test du Use Case de session

- Ajouté `CreateWebSessionUseCase.test.mjs` à côté du Use Case ; il couvre identité invalide, e-mail non vérifié, compte absent/profil incomplet, compte suspendu et création de session autorisée.
- Le premier lancement en mode `--experimental-strip-types` a révélé les limites du mode strip-only de Node avec les propriétés de paramètres et les imports TypeScript sans extension.
- Activé `allowImportingTsExtensions` dans le tsconfig Web et explicité l’import runtime de `sessionPolicy.ts` pour permettre le test natif Node sans dépendance de test supplémentaire.
- `node --experimental-transform-types --test packages/features/auth/domain/use-cases/CreateWebSessionUseCase.test.mjs` passe : 5 tests réussis. Node affiche son avertissement habituel sur le caractère expérimental de cette option.
- `pnpm.cmd --filter @topdeal/web lint` passe sans avertissement ; `pnpm.cmd --filter @topdeal/web build` passe, contrôle TypeScript inclus.
- Aucun appel Firebase ou à la base de données n’a été effectué.

### 16 novembre 2026 - documentation d'accueil

- Remplacé le README générique Create Next App par un guide TopDeal : commandes pnpm réelles, packages présents et état non fonctionnel des aperçus Auth.
- Pointé les règles d’architecture vers `AGENTS.md` et l’état courant vers cette mémoire.
- Aucun code applicatif modifié par ce lot documentaire.

### 16 novembre 2026 - dépendance Web redondante

- Revue des imports et manifests : `apps/web` ne consomme pas directement `server-only`, tandis que `packages/features/auth/data` le déclare et l’importe.
- Retiré `server-only` des dépendances directes de `apps/web` et de son importeur dans `pnpm-lock.yaml`. Le package Auth conserve sa propre dépendance.
- `firebase-admin` reste dans `apps/web` car `apps/web/verif-firebase.mjs` l’importe directement ; ce script de vérification n’a pas été exécuté.
- Après le changement, `pnpm.cmd --filter @topdeal/web lint` passe sans avertissement et pnpm confirme que le lockfile est à jour.
- `pnpm.cmd --filter @topdeal/web build` passe, contrôle TypeScript et génération des routes inclus. Aucun test unitaire ni script Firebase n’a été exécuté.

### 14 novembre 2026 — cadrage et début des tokens

- Confirmé l’objectif : Design System d’abord, authentification ensuite, progression pas à pas.
- Consulté les skills et références du Design System, de l’architecture, de la nomenclature, de l’évolutivité, de la performance et de la sécurité.
- Planifié les étapes Design System puis Auth et relevé les ambiguïtés à résoudre.
- Implémenté les tokens documentés dans `packages/ui/tokens/{colors,typography,spacing,radius,shadows,sizes}.ts` et `packages/ui/styles/themes.css`, ainsi que les exports publics et les styles de base du body.
- Mis à jour `docs/DIRECTION_DESIGN_SYSTEM.md` pour le référencer comme relevé initial et pointer vers cette mémoire pour l’avancement courant.
- Vérifications réussies après les dernières modifications : `pnpm.cmd --filter @topdeal/web build`, `pnpm.cmd --filter @topdeal/web lint` et `pnpm.cmd --filter @topdeal/web exec tsc --noEmit --target ES2017 --module ESNext --moduleResolution Bundler --strict ..\\..\\packages\\ui\\index.ts`.
- Prochaine action : construire les premiers composants UI fondamentaux et leurs états accessibles, sans démarrer encore l’écran Auth.

### 14 novembre 2026 — premiers composants UI

- Ajouté `Button` (variantes principale et secondaire, type bouton par défaut, état désactivé), `Input` (label obligatoire, aide, erreur associée, invalidité ARIA) et `Card` (surface générique sans padding imposé).
- Ajouté les styles partagés dans `packages/ui/styles/components.css` et exporté les composants depuis `packages/ui/index.ts`.
- Ajouté des dépendances de développement React/ReactDOM et types React à `@topdeal/ui`, nécessaires au contrôle TypeScript du package.
- Vérifications réussies après ces changements : build web, lint web et vérification TypeScript de l’index public UI avec `--jsx react-jsx`.
- Pas encore de revue visuelle au navigateur ; prochaine action : créer une page de démonstration pour comparer ces composants aux maquettes et les valider avant de poursuivre.

### 14 novembre 2026 — page de démonstration

- Créé `/design-system` pour rendre les tokens et composants UI existants sans commencer un parcours produit.
- Chargé Schibsted Grotesk avec `next/font/google`, `display: swap` et un fallback, afin d’éviter une requête de police depuis le navigateur.
- Vérifié visuellement la page au navigateur à une largeur desktop (1170 px) et mobile (390 px) ; aucun débordement horizontal visible.
- Vérifications réussies après ces changements : build web, lint web et vérification TypeScript de l’index public UI avec `--jsx react-jsx`.
- Le propriétaire valide la direction générale, le texte courant de 14 px et l’usage du rouge de la maquette Commandes/Ventes pour l’état d’erreur des champs.

### 14 novembre 2026 — token d’erreur validé

- Ajouté `colors.error` avec `#A33D35` aux tokens partagés et à leur mapping Tailwind.
- Appliqué le token à la bordure des champs invalides et au message d’erreur associé ; la couleur de fond `#FAEFED` de la maquette n’est pas appliquée au champ.
- Ajouté l’échantillon d’erreur à `/design-system` et distingué les couleurs d’état encore à confirmer dans la documentation.
- Contraste calculé du rouge sur blanc : 6,41:1.
- Vérifications réussies après cette modification : build web, lint web et vérification TypeScript de l’index public UI avec `--jsx react-jsx`.
- Revu la page au navigateur : le token calculé est `#a33d35`, la bordure et le texte d’erreur affichent bien `rgb(163, 61, 53)`. La composition n’a pas changé ; la vérification responsive antérieure reste valide.

### 14 novembre 2026 — cadrage initial de l’authentification

- Relu les sections Auth de `docs/SPECIFICATION_FONCTIONNELLE.md` et `docs/REGLES_METIERS.md`, ainsi que le skill sécurité.
- La spécification qualifie téléphone/mot de passe et Google de modes « envisagés » ; le numéro doit être unique, tandis que l’unicité e-mail et la récupération de compte restent à confirmer.
- Vérifié dans la documentation Firebase que l’authentification téléphone utilise un code SMS à usage unique, tandis que le mode mot de passe natif se base sur l’e-mail. Le téléphone/mot de passe n’est donc pas présumé réalisable avec le fournisseur retenu sans décision supplémentaire.
- Aucun package `packages/features/auth` n’existe encore. Aucune implémentation Auth commencée ; attendre le choix du propriétaire sur les méthodes de connexion avant de créer le parcours ou les registrations DI.

### 14 novembre 2026 — méthodes Auth choisies

- Le propriétaire choisit Google en premier, puis e-mail/mot de passe ; Google est une méthode supplémentaire.
- Firebase Web SDK et Firebase Admin sont déjà déclarés dans `apps/web`; aucune intégration Auth applicative ni registration Awilix n’existe encore.
- Inspecté le schéma : `utilisateur` porte les champs de profil et `identite_externe` permet de relier un UID fournisseur ; téléphone/date de naissance sont nullable dans le schéma et l’e-mail n’a pas de contrainte unique ici. Ne pas modifier ces contraintes sans traduire les règles métier validées.
- Prochaine étape : comparer l’aperçu de connexion à la maquette, puis cadrer la complétion de profil avant de connecter les fournisseurs et la session serveur.

### 14 novembre 2026 — aperçu de connexion selon la maquette

- Créé la présentation `@topdeal/feature-auth` et la route `/connexion`. La carte suit la maquette (480 px max, Google d’abord, formulaire e-mail/mot de passe, aide, avis de sécurité).
- Ajouté les tokens `surfaceMuted`, `errorBackground` et `radius.notice` d’après les tons explicitement présents dans cette maquette ; ils ne constituent pas une palette d’états générale validée.
- Étendu le composant partagé `Input` avec une action de fin optionnelle, utilisée par le bouton accessible d’affichage/masquage du mot de passe. Aucun flux réel de connexion, inscription ou récupération n’est ajouté ; les actions non implémentées restent désactivées ou non navigables.
- Ajouté la détection Tailwind du package Auth et documenté les tons propres à la maquette dans `docs/DIRECTION_DESIGN_SYSTEM.md`.
- Vérifications réussies : `pnpm.cmd --filter @topdeal/web build` et `pnpm.cmd --filter @topdeal/web lint`. Revue navigateur desktop et mobile à 390 px sans débordement horizontal ; bascule du mot de passe validée au clavier. Une correction de superposition a été apportée au bouton ; confirmer le clic souris lors de la prochaine revue.
- Le propriétaire confirme que l’en-tête et le pied de page seront réalisés ultérieurement dans un layout partagé, pas dans l’écran `/connexion`. Profil, sessions, liaison de comptes, e-mail vérifié, récupération et DI sont encore à cadrer avant l’intégration Auth.
- Le propriétaire valide visuellement l’écran de connexion actuel ; l’aperçu reste non fonctionnel jusqu’à l’implémentation et aux décisions de sécurité Auth.

### 14 novembre 2026 — décisions de continuité Auth

- Le propriétaire choisit de reporter l’en-tête et le pied de page au futur layout partagé ; ne pas créer un shell uniquement pour `/connexion`.
- Décision métier confirmée : un nouvel utilisateur Google doit compléter les champs obligatoires de son profil avant tout accès au compte. Les règles fonctionnelles exigées (dont téléphone unique, date de naissance et âge minimal de 18 ans) doivent être vérifiées côté serveur avant l’accès ; le parcours d’écran reste à concevoir.
- Le propriétaire valide l’écran de connexion, sans demander d’ajustement visuel supplémentaire.
- Ne pas commencer l’intégration Firebase tant que les règles restantes de liaison des comptes, sessions, e-mail vérifié et récupération ne sont pas clarifiées ; l’écran de connexion de référence est maintenant validé.
- Décision de sécurité confirmée : lier Google à un compte e-mail/mot de passe seulement après preuve d’accès au compte existant et action explicite de l’utilisateur ; ne pas se baser sur la seule égalité d’adresse e-mail.
- Décision confirmée : exiger la vérification de l’adresse e-mail avant tout accès au compte ; son état devra être validé côté serveur.
- Décision confirmée : utiliser un cookie de session Firebase vérifié côté serveur, `HttpOnly`, `Secure` en production, `SameSite` adapté et avec une durée maximale de 14 jours ; révocation, renouvellement et CSRF restent à définir.
- Décision confirmée : choisir une durée maximale de 14 jours pour le cookie de session Firebase.
- La récupération du mot de passe est explicitement reportée ; ne pas supposer de réinitialisation Firebase ni de parcours support tant que la règle n’est pas choisie.
- Décision confirmée : une adresse e-mail vérifiée ne peut être associée qu’à un compte TopDeal, quelle que soit la méthode ; toute liaison de méthode exige une authentification préalable et une action explicite.
- Les règles métier RG-004, RG-164, RG-165 et la section 3.1 de la spécification ont été mises à jour selon les décisions validées : e-mail unique, vérifié avant accès, liaison explicite après preuve du compte et profil Google complété avant accès.

### 14 novembre 2026 — proposition de complétion de profil

- À la demande du propriétaire, créé une première présentation de complétion de profil avec la même carte de 480 px et la hiérarchie visuelle que la connexion.
- Ajouté prénom, nom, téléphone et date de naissance ; les règles d’unicité du téléphone et d’âge minimal sont rappelées. Le bouton est désactivé, aucun formulaire n’est envoyé et aucun profil n’est enregistré.
- Ajouté l’aperçu `/design-system/auth-profile` avec un avertissement visible et un retour vers `/connexion`. Il s’agit d’une page de revue visuelle, pas du parcours Auth réel.
- Build, lint et `git diff --check` réussis ; le preview répond HTTP 200. Le propriétaire valide la présentation ; une revue navigateur responsive reste à effectuer.

### 14 novembre 2026 — préparation de l’intégration Auth

- Relu `AGENTS.md` et les skills architecture, nomenclature, évolutivité, sécurité et performance ainsi que la référence sécurité.
- Confirmé que le dossier de migrations Prisma et la table `_prisma_migrations` sont absents ; la base locale a une configuration `DATABASE_URL` locale.
- Effectué uniquement des requêtes PostgreSQL en lecture seule : aucune adresse e-mail retournée ; 0 adresse non vide, 0 doublon après normalisation et 0 adresse vide.
- Découvert dans la base l’index `uq_utilisateur_email` sur `lower(email)` avec `WHERE email IS NOT NULL`. L’introspection Prisma indique explicitement que cet index fonctionnel est non pris en charge par le schéma/client courant.
- Aucun code Auth ni schéma n’a été modifié. Avant l’implémentation, définir la stratégie CSRF et décider comment établir les migrations sans perdre l’index existant ni omettre les contraintes actuelles.

### 14 novembre 2026 — baseline Prisma initial

- À la demande du propriétaire, établi un baseline Prisma avant de commencer l’Auth.
- Généré `packages/database/prisma/migrations/20261114190000_baseline/migration.sql` depuis `schema.prisma`, puis ajouté les 31 contraintes `CHECK` et l’index unique fonctionnel e-mail existants, car Prisma ne les représente pas.
- Ajouté `migration_lock.toml` et `README.md` pour documenter l’application sur une base vide, le marquage d’une base existante et le suivi manuel des contraintes non prises en charge.
- Comparaison réussie sur un schéma temporaire transactionnel : 29 tables, 31 contraintes `CHECK`, 59 clés étrangères et index e-mail fonctionnel équivalents à la base locale ; le schéma temporaire a été annulé.
- Marqué le baseline comme appliqué sur la base locale avec `prisma migrate resolve` (aucun SQL de création/recréation exécuté sur les tables existantes). `prisma migrate status` indique « Database schema is up to date ».
- `prisma validate` et `git diff --check` réussis. Aucune adresse e-mail ni valeur de secret n’a été affichée.
- Le propriétaire valide la stratégie CSRF Web same-origin : requêtes JSON avec en-tête personnalisé, validation stricte de `Origin` à partir de `AUTH_APP_ORIGIN`, contrôle `Sec-Fetch-Site`, sans CORS ; cookie `SameSite=Lax`.
- Incident de sécurité : une sortie d’outil a affiché la valeur de `FIREBASE_PRIVATE_KEY` provenant de la configuration locale. Traiter cette clé comme compromise : ne plus l’utiliser, la révoquer dans Google Cloud IAM, en créer une nouvelle et la remplacer localement sans la coller dans le chat. Le fichier local est ignoré par Git ; aucune valeur n’a été commitée. Ne reprendre aucune opération Firebase avant confirmation de la rotation.
- Prochaine étape bloquée : attendre la confirmation de rotation de la clé ; ensuite seulement poursuivre les éléments Auth par couches et les endpoints.

### 16 novembre 2026 — blocage d’un e-mail TopDeal déjà utilisé avant le profil

- Clarification du propriétaire : après une connexion Firebase avec e-mail vérifié, si l’adresse est déjà associée à un autre compte TopDeal, l’utilisateur ne doit jamais arriver au formulaire de profil puis découvrir le conflit après soumission.
- Ajout du contrôle dans `CreateWebSessionUseCase` après la vérification du jeton/e-mail et la recherche de l’identité externe, mais avant `profile_required`. Le contrôle ne s’applique qu’en l’absence d’identité externe Firebase correspondante : un utilisateur déjà relié à son propre compte n’est pas bloqué.
- `PrismaAuthUserRepository` vérifie l’adresse normalisée avec `lower(email)`, en s’appuyant sur l’index unique fonctionnel déjà présent. La décision reste côté serveur ; aucun rapprochement ni rattachement automatique par adresse n’est effectué.
- La réponse `EMAIL_ALREADY_IN_USE` (HTTP 409, `Cache-Control: no-store`) est traduite dans le gateway et affichée comme une invitation à se connecter au compte existant. La contrainte unique lors de la création du profil reste la protection contre les courses concurrentes.
- `pnpm.cmd --filter @topdeal/web exec tsc --noEmit`, `pnpm.cmd --filter @topdeal/web lint` et `git diff --check` passent. Aucun test automatise, acces aux donnees utilisateurs, appel Firebase reel ou test d authentification live n a ete effectue.
