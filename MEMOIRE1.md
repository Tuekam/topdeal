# Mémoire de travail — refonte Auth

## Objectif

Rendre la fonctionnalité Auth claire, maintenable et conforme à l’architecture TopDeal, sans modifier les parcours de connexion et d’inscription ni leurs règles métier.

## Décisions validées par le propriétaire

- La refonte commence par la fonctionnalité `packages/features/auth`.
- L’architecture feature-first et les responsabilités définies dans `AGENTS.md` s’appliquent : `core` pour les contrats et modèles, `domain` pour les implémentations de Use Cases, `data` pour les repositories et services, `presentation` pour l’interface.
- `packages/database` reste à sa place avec Prisma, le schéma, les migrations et le client de base de données. Cette refonte ne modifie pas son schéma.
- Les parcours, règles métier, routes HTTP et comportements visibles doivent rester inchangés.
- Cette mémoire est un plan courant avec décisions et validations d’étapes ; elle ne sert pas de journal daté.

## Plan d’action et validations

| Étape | État | Résultat / validation |
|---|---|---|
| Cartographier Auth, ses dépendances et les frontières actuelles | Validée | Contrats présents dans `domain/interfaces`, contrats et implémentations de Use Cases regroupés, intégrations sous `data/adapters`, deux conteneurs pour les environnements serveur et navigateur. Le découpage serveur/navigateur est conservé. |
| Déplacer les contrats et types Auth dans le Core propre à la fonctionnalité | Validée | Les contrats sont dans `core/repositories` et `core/usecases`; les types partagés Auth et la politique de session sont dans `core/models`. |
| Isoler chaque contrat de Use Case de son implémentation Domain | Validée | Les dix contrats sont dans Core; chaque implémentation Domain porte le suffixe `UseCaseImpl`. Les entrées et résultats existants sont conservés. |
| Réorganiser Data en repositories et services sans déplacer Prisma | Validée | Les intégrations sont dans `data/services`; le repository Auth est dans `data/repositories`. Il utilise toujours `@topdeal/database`; aucun fichier de `packages/database` n’a été modifié. |
| Mettre à jour les exports, les imports et les types Awilix | Validée | Le sous-chemin `@topdeal/feature-auth/core` est exporté. Les deux conteneurs Awilix restent séparés et leurs consommateurs dépendent des contrats Core. |
| Revoir les frontières de Presentation sans changer l’interface | Validée | Les écrans importent leurs types depuis Core. Les parcours et composants visuels n’ont pas été réorganisés. |
| Faire une revue finale des imports, responsabilités et comportements | Validée | TypeScript et ESLint sur les fichiers `apps/web` modifiés réussissent. La recherche des anciens chemins ne retourne aucun résultat. Le propriétaire confirme que les parcours de connexion et d’inscription fonctionnent toujours après la refonte. Les tests automatisés n’ont pas été exécutés. ESLint ne prend pas les fichiers du package Auth en charge depuis la configuration `apps/web`; `git diff --check` signale des espaces de fin dans les modifications préexistantes de `AGENTS.md` et du skill Architecture, pas dans les fichiers Auth modifiés. |
| Éviter de persister un profil si Firebase ne peut pas créer sa session | Validée | Le Use Case crée le cookie Firebase avant l’écriture du profil. Le propriétaire confirme que le parcours de profil fonctionne après ce changement. Le typecheck TypeScript passe. |
| Unifier la traduction des codes HTTP dans le gateway de session | Validée | La requête POST commune et le mapping des codes d’erreur sont regroupés dans `FetchWebSessionGateway`. Le propriétaire confirme que connexion et inscription fonctionnent toujours; le typecheck TypeScript passe. |
| Centraliser le calcul de complétude du profil dans le repository Auth | Implémentée | Le repository utilise maintenant un seul calcul pour identifier un profil complet ou incomplet. La création du profil interne et de l’identité externe reste atomique et cette contrainte est commentée. Le typecheck TypeScript passe. |
| Unifier la traduction des erreurs de mot de passe Firebase | Implémentée | Une seule fonction traduit `weak-password`, `email-already-in-use` et `credential-already-in-use` vers les erreurs Auth métier pour la création et la liaison des identifiants. Les autres erreurs restent propagées. Le typecheck TypeScript passe. |
| Retourner un état contrôlé si le SDK échoue pendant la complétion du profil Web | Implémentée | Les échecs de lecture du jeton ou du gateway retournent `request_failed`. Si seul le nettoyage de l’identité Firebase échoue après la création de session, le statut `authenticated` reste préservé. Le typecheck TypeScript passe. |

## Contraintes de la refonte

- Ne pas modifier les règles métier, les contrats HTTP, les réponses API, les textes d’interface ou les mécanismes de session.
- Ne pas ajouter de couche, interface, fichier ou abstraction sans responsabilité réelle.
- Garder les types Firebase, Prisma et Next.js hors des contrats métier.
- Ajouter des commentaires uniquement pour expliquer une décision ou un invariant non évident.
- Ne pas modifier ni déplacer `packages/database`.

## État courant

La refonte structurelle Auth est achevée : contrats, implémentations, intégrations, repository, exports et DI respectent les frontières retenues. Les parcours d’inscription, connexion et complétion de profil ont été validés manuellement par le propriétaire avant les derniers changements de factorisation. La feature Annonce est en cours, avec MinIO inclus dans le périmètre.

## Plan de travail courant — Annonce et MinIO

| Étape | État | Résultat / validation |
|---|---|---|
| Examiner les règles métier Annonce et les contrats de données existants | Validée | `annonce`, `categorie` et `photo_annonce` existent dans `packages/database`; aucune modification de ce package n’est prévue sans besoin et validation séparés. RG-020 à RG-028 et RG-031 à RG-048 documentent le périmètre. |
| Examiner les skills applicables et les intégrations de stockage | Validée | Skills architecture, nomenclature, évolutivité, sécurité, performance et design-system consultés. Les dépendances AWS S3 et la configuration Compose MinIO existent; aucun adaptateur S3 applicatif n’a été trouvé. Le stockage et ses secrets restent côté serveur, dans `data`. |
| Définir le premier parcours vertical et les règles photo | Validée | Le propriétaire valide 1 à 6 photos JPEG/PNG/WebP, 5 Mo maximum par photo. Le premier parcours couvre création, publication et détail d’une annonce; la lecture utilise un bucket privé et des URLs temporaires signées côté serveur. |
| Ajouter la vérification serveur de la session et la création d’annonce | Implémentée | Le cookie Firebase est vérifié côté serveur avec contrôle de révocation, puis l’identité est reliée au compte TopDeal actif et complet. Le propriétaire de l’annonce vient de cette session, jamais du formulaire. Route, Use Cases, repositories et DI sont reliés. |
| Ajouter l’envoi et la lecture des photos via MinIO | Implémentée | L’adaptateur S3 est isolé dans `data/services`, vérifie la signature binaire JPEG/PNG/WebP, génère des clés aléatoires, émet des URLs temporaires et tente de supprimer les objets si l’écriture atomique annonce/métadonnées échoue. |
| Ajouter le formulaire de création et la consultation du détail | Implémentée | Le formulaire respecte le Design System; le détail public expose seulement les annonces publiées et affiche leur disponibilité. |
| Ajouter la recherche, les filtres et les résultats paginés | Implémentée | Filtres validés : titre/description, catégorie/sous-catégorie, état, prix, quartier et troc. Pagination par curseur côté serveur; les requêtes sélectionnent les champs nécessaires et signent une image par résultat. |
| Permettre au vendeur de gérer ses annonces | Implémentée | Espace privé paginé; le vendeur peut changer le prix/la quantité et masquer/republier ses annonces. L’API vérifie la session et la propriété de la ressource; une annonce suspendue ne peut pas être republiée par son propriétaire. |
| Centraliser les codes d’erreur de l’API Annonce | Validée | Les codes HTTP de la fonctionnalité sont regroupés dans `apps/web/app/api/annonces/errorCodes.ts`. |
| Vérifier le code et valider le parcours MinIO | Vérifications automatiques validées | TypeScript Web et ESLint Web passent après les derniers changements. Le test réel de publication via MinIO reste à faire avec au moins une catégorie active en base. |
| Modération des annonces par l’administration | À faire plus tard | La suspension existe dans les règles métier, mais relève de la fonctionnalité Administration et n’est pas exposée par les actions vendeur. |

Contraintes confirmées pour cette fonctionnalité : pas de `src`; pas de Prisma/MinIO/Firebase dans Domain; Awilix uniquement dans `apps/web`; garder `packages/database` à sa place; ne pas inventer de règles non validées; maintenir cette mémoire comme plan et validations, sans journal daté.

Précondition de validation manuelle : le formulaire ne crée pas de catégories. Il faut au moins une catégorie active en base; aucune taxonomie ni donnée de départ n’a été inventée. Le schéma et les migrations de `packages/database` sont restés inchangés.

## Refonte visuelle du parcours Annonce — état courant

| Étape | État | Résultat / validation |
|---|---|---|
| Reprendre les maquettes Accueil et Publication Phase 1/2 | Validée | Deux étapes visuelles confirmées. L’affiliation est reportée; aucune règle d’affiliation n’est introduite dans le parcours. |
| Installer le cadre connecté partagé pour les pages Annonce | Implémentée | En-tête, pied de page et layout communs aux routes `/annonces`. |
| Refaire la publication en deux étapes | Implémentée | Étape 1 : photos, titre, catégorie/sous-catégorie, état et description. Étape 2 : prix, quantité, quartier et troc facultatif. Le formulaire conserve ses données entre les étapes. |
| Maintenir les validations métier et MinIO | Implémentée, à valider en navigateur | Le client contrôle les 1 à 6 photos JPEG/PNG/WebP de 5 Mo maximum; l’API et le Use Case restent responsables des contrôles serveur et du stockage MinIO. La catégorie choisie est transmise à l’API et les données sont envoyées en multipart. |
| Vérifier les changements de présentation | En cours | Le typecheck Web et ESLint sur les routes/composants apps/web passent. La configuration ESLint ne couvre pas les fichiers du package Annonce. La publication réelle avec MinIO et une catégorie active reste à valider manuellement. |

## Correctifs signalés dans la capture — état courant

| Étape | État | Résultat / validation |
|---|---|---|
| Corriger le rendu dynamique des routes Annonce avec Cache Components | Implémentée, typechecké | Une frontière `Suspense` avec état de chargement entoure le contenu des routes Annonce; les accès Prisma/session restent non mis en cache et s’exécutent par requête. |
| Aligner l’en-tête Annonce sur la maquette « Mon profil » | Implémentée, à valider visuellement | Recherche Bafoussam et navigation complète de la maquette reprises. Troc et Mon espace pointent vers les parcours disponibles; Favoris, Messages et notifications sont visuellement présents mais désactivés, sans compteurs inventés. |
| Réduire le sélecteur de photos qui déborde | Corrigée, à valider visuellement | Dimensions explicites de 28 × 28 px sur l’icône SVG du sélecteur pour éviter son rendu à sa taille intrinsèque. |
| Vérifier les corrections | En cours | TypeScript Web et ESLint sur les routes et composants Web passent. Recharger `/annonces` et `/annonces/nouvelle` dans le navigateur reste nécessaire pour valider le streaming et la mise en page. |
## Données de catégories validées

| Étape | État | Résultat / validation |
|---|---|---|
| Confirmer la taxonomie de démarrage depuis les catégories candidates de la maquette | Validée par le propriétaire | 5 catégories racines et 23 sous-catégories confirmées. |
| Insérer les catégories en PostgreSQL local | Terminée | Transaction validée : 5 racines + 23 sous-catégories, toutes actives. L’insertion évite les lignes déjà présentes; aucune migration ni modification du schéma n’a été faite. |
| Vérifier l’arborescence après insertion | Validée | La requête de vérification retourne les 28 catégories avec leur parent et `active=true`. Le formulaire de publication peut maintenant charger ces catégories depuis la base. |
## Reprise de l’étape 2 de publication

| Étape | État | Résultat / validation |
|---|---|---|
| Comparer l’étape 2 avec la maquette Phase 2 | Validée | La maquette présente un contenu de 920 px, une carte Prix et disponibilité en deux colonnes avec le quartier pleine largeur, puis une carte Options avec un interrupteur de troc. |
| Aligner l’interface de l’étape 2 | Implémentée | Les champs sont regroupés dans les cartes attendues; FCFA est un suffixe statique ajouté au composant Input du Design System; le troc utilise un interrupteur et révèle la saisie souhaitée. L’affiliation reste reportée selon la décision validée. |
| Vérifier le comportement et le code | Validée automatiquement, visuel à confirmer | Le typecheck Web et ESLint sur les routes/composants Web passent. La publication conserve les champs HTTP existants; le détail d’échange est transmis par `souhaitEchangeDescription`. Une vérification visuelle navigateur reste à faire. |
## Correction de l’échec de publication et réutilisation UI

| Étape | État | Résultat / validation |
|---|---|---|
| Corriger le 400 lors de la publication depuis l’étape 2 | Implémentée | Le groupe radio `etat` de l’étape 1 est désactivé sur l’étape 2 et est donc absent de `FormData`; le brouillon est maintenant copié explicitement dans la requête multipart. |
| Réutiliser les composants génériques du Design System dans Annonce | Implémentée | `Card`, `Input`, `Select` et `Switch` sont exportés par `@topdeal/ui`; les cartes et sélecteurs Annonce sont raccordés aux primitives communes. `Input` fournit aussi le suffixe statique FCFA. |
| Vérifier les changements | Validée automatiquement | TypeScript Web et ESLint Web passent. Le lint Web ne couvre pas les fichiers `packages/ui` et `packages/features/annonce`; la publication complète avec session, MinIO et données locales est à retester dans le navigateur. |
## Vérification de session sur « Mes annonces »

| Étape | État | Résultat / validation |
|---|---|---|
| Empêcher Next de pré-rendre la vérification de session/Firebase | Corrigée | `connection()` est appelé avant la vérification de session de la page, dans sa frontière dynamique. TypeScript Web et ESLint Web passent. |
| Résoudre l’échec DNS Firebase Admin | À résoudre dans l’environnement local | `getaddrinfo ENOTFOUND identitytoolkit.googleapis.com` indique que la machine ne résout pas l’hôte Firebase. `verifySessionCookie(..., true)` conserve le contrôle de révocation et requiert cette requête réseau; aucun contournement n’a été ajouté. |
## Police des maquettes

| Étape | État | Résultat / validation |
|---|---|---|
| Appliquer la police des maquettes à l’application | Corrigée | Les maquettes utilisent Schibsted Grotesk. La classe auto-hébergée par `next/font` est maintenant appliquée directement au `body`; le jeton du Design System continue de référencer la même famille. TypeScript Web et ESLint Web passent. |

## Alignement des maquettes Accueil et détail d’annonce

| Étape | État | Résultat / validation |
|---|---|---|
| Comparer l’accueil et le détail actuels aux maquettes fournies | Validée | L’accueil `/` était un écran temporaire. `/annonces` possédait les données paginées mais présentait un grand formulaire de filtres et un bouton « Voir plus ». Le détail affichait les photos en grille sans hiérarchie visuelle. Les contrats actuels ne fournissent pas les métriques de compte ni les coordonnées vendeur visibles dans certains éléments de maquette. |
| Aligner l’accueil du catalogue | Implémentée | `/` redirige désormais vers `/annonces`. La page catalogue présente les catégories actives, les annonces en grille 4:3, leur catégorie, prix, état, quartier et le badge troc lorsqu’il est accepté. Les filtres restent accessibles dans un panneau repliable et utilisent les composants du Design System. |
| Aligner le détail public d’annonce | Implémentée | Le détail présente un fil d’Ariane, une grande photo principale et les photos secondaires, puis titre, prix, état, disponibilité, troc, localisation et description. Les informations vendeur et les actions de messagerie non disponibles dans les contrats actuels ne sont pas simulées. |
| Remplacer « Voir plus » par une pagination | Implémentée | La navigation Précédent/Suivant conserve la pagination par curseur serveur et les filtres. Le parcours de curseurs permet de revenir sur les pages déjà consultées. Le même composant est utilisé sur « Mes annonces ». |
| Vérifier le code | Validée automatiquement, revue visuelle à faire | `pnpm.cmd --filter @topdeal/web exec tsc --noEmit` et `pnpm.cmd --filter @topdeal/web lint` réussissent. La validation visuelle des deux routes dans le navigateur reste à effectuer. |

Décision de pagination : conserver le curseur serveur déjà en place pour éviter un comptage global et les décalages coûteux par offset. Les contrôles affichent une page courante et des liens Précédent/Suivant; le numéro des pages précédentes n’est pas deviné par une requête `COUNT`.

## Correction d’alignement Accueil et fiche annonce — état courant

| Étape | État | Résultat / validation |
|---|---|---|
| Reproduire la disposition réelle de la ligne filtres/catégories | Implémentée | Les catégories sont des onglets soulignés; les contrôles Filtres et Plus récentes sont alignés à droite sur la même ligne. Filtres ouvre un panneau ancré contenant les champs existants et les composants `Input`/`Select` du Design System. Ordre des catégories aligné sur la maquette, avec la catégorie Maison et mobilier validée en plus. |
| Positionner Troc accepté et Favoris sur les cartes | Implémentée | « Troc accepté » s’affiche en haut à gauche de la photo, uniquement si le champ métier est vrai. Le bouton Favoris est en haut à droite; il reste désactivé tant que la fonctionnalité n’est pas disponible. Le contenu de la carte suit la maquette : prix, titre, état et quartier. |
| Reproduire la hiérarchie de la fiche | Implémentée | Galerie principale de 490 px sur ordinateur, vignettes de 82 × 68 px, fil d’Ariane avec catégorie parente, titre/prix/tags quantité et état, localisation, description sur séparateur et vendeur. Le vendeur et sa date d’inscription viennent de la relation existante en base; aucun nom de démonstration n’est codé en dur. |
| Garder les données réelles et les fonctionnalités disponibles | Validée | Les compteurs commandes/messages restent `—` car leurs contrats ne sont pas présents dans cette page. Les actions Discuter et Ajouter aux favoris sont visibles mais désactivées car les parcours correspondants ne sont pas implémentés. L’affiliation reste différée selon la décision précédente. |
| Vérifier le code et le rendu | Vérifiée partiellement | TypeScript Web et ESLint Web passent. La capture locale de l’accueil montre les contrôles et le badge au bon emplacement. Une vérification visuelle finale de la fiche reste à reprendre; la capture précédente affichait un fond noir inattendu et le navigateur a interrompu l’interaction. |

## Demande de cohérence Profil, favoris et filtres instantanés — état courant

| Étape | État | Résultat / validation |
|---|---|---|
| Reprendre l’en-tête et le pied de page de « Mon profil » | Implémentée | L’en-tête reprend la recherche Bafoussam, Troc, Favoris, Messages avec badge, Notifications, Mon espace et Vendre. Le pied de page reprend la marque, Bafoussam/Cameroun et les liens Aide, Contact, Conditions et Confidentialité. |
| Mettre à jour les résultats dès la saisie de recherche | Implémentée, à valider dans le navigateur | Le champ global lance la recherche après une courte temporisation de saisie; Entrée reste prise en charge. L’URL conserve les filtres courants sur la page catalogue et repart vers `/annonces` depuis les autres routes. |
| Mettre à jour les résultats dès une modification de filtre | Implémentée, à valider dans le navigateur | Le panneau filtre soumet automatiquement après les changements sans bouton Appliquer. La sélection de catégorie est maintenant séparée de la sous-catégorie et les catégories actives sont filtrées selon le parent choisi. Les résultats restent recherchés côté serveur et paginés par curseur. |
| Mettre en œuvre le bouton J’aime | À terminer | Le bouton visuel est présent, mais il n’est pas encore relié à la table `favori`; il ne faut pas présenter son état local comme une sauvegarde persistante. Le schéma comporte déjà la clé composée utilisateur/annonce, aucune migration n’est prévue. |
| Vérifier le code et le parcours | En cours | TypeScript Web et ESLint Web sont relancés après les modifications. Une validation navigateur du debounce de recherche et du changement catégorie/sous-catégorie reste nécessaire. |

Skills consultés pour ce périmètre : architecture, nomenclature, évolutivité, design-system, performance et sécurité. Décision conservée : aucun compteur réel ne doit être inventé; le badge Messages visible correspond au nombre d’exemple de la maquette et doit être remplacé par le compteur métier lorsqu’il sera disponible.

État d’avancement complémentaire : le cœur J’aime est maintenant un bouton activable avec état visuel et `aria-pressed`. Cet état est local au rendu et n’est pas encore persisté dans la table `favori`; l’API et les contrats de persistance restent un travail distinct à réaliser avant de présenter la liste de favoris comme durable. Le champ de recherche du header et les filtres déclenchent maintenant des navigations serveur automatiques après une temporisation courte; le formulaire sépare racine et sous-catégorie et conserve la pagination par curseur en la réinitialisant à chaque changement.

Correction à la demande du propriétaire : les choix effectués dans le panneau de filtres ne déclenchent plus une navigation de page. Le composant appelle `GET /api/annonces` après 220 ms d’inactivité, annule la requête précédente lorsqu’un autre filtre est saisi, remplace uniquement les annonces visibles, réinitialise le curseur, garde le défilement et synchronise l’URL avec `history.replaceState`. Un indicateur signale le chargement; en cas d’échec, les résultats précédents restent affichés. TypeScript passe; le lint est à revalider après la dernière gestion d’annulation. Le parcours doit encore être vérifié dans le navigateur.

## Interactions de filtre et galerie de la fiche annonce — état courant

| Étape | État | Résultat / validation |
|---|---|---|
| Fermer le panneau de filtres hors de la zone et avec Échap | Implémentée | Le panneau natif `<details>` se ferme au clic/tap en dehors et à la touche Échap. Les clics à l’intérieur continuent d’utiliser les filtres instantanés. |
| Garder le texte de recherche pendant les réponses asynchrones | Corrigée | La recherche ne remplace plus la saisie locale à chaque mise à jour de `searchParams`; elle se synchronise à l’entrée sur une autre route et après un retour navigateur. Cela empêche une réponse précédente de retirer des lettres tapées récemment. |
| Adapter le panneau et les sélecteurs aux mobiles et tablettes | Implémentée | Jusqu’au breakpoint `lg`, le panneau est rendu dans un `<dialog>` natif (top layer), centré selon les insets de zone sûre, limité à la hauteur dynamique et défilable indépendamment; il se ferme avec le bouton, le tap extérieur ou Échap. Les champs ne peuvent plus élargir les colonnes; les valeurs longues sont tronquées. À partir de `lg`, le panneau reprend son ancrage de popover. |
| Ajouter une validation explicite des filtres | Implémentée | « Valider les filtres » lance immédiatement la requête avec les valeurs courantes et ferme le panneau; les résultats continuent aussi à se mettre à jour automatiquement à chaque changement. |
| Permettre de choisir la photo principale sur la fiche | Implémentée | Les vignettes sont maintenant des boutons accessibles; sélectionner une vignette remplace la grande image. Les URLs temporaires MinIO et l’image principale conservée par défaut sont réutilisées. |
| Ajouter les retours visuels entre les écrans | Implémentée | La fiche annonce a une flèche « Retour aux annonces »; le bouton Annuler/Retour du parcours de publication affiche également une flèche. |
| Mutualiser le retour dans le Design System | Implémentée | `BackButton` est exporté depuis `@topdeal/ui`; il rend un lien quand il reçoit `href` et un bouton quand il reçoit `onClick`. La fiche et le parcours de publication utilisent ce composant. |
| Mutualiser tous les retours existants | Implémentée | La fiche annonce, les étapes de publication, la complétion du profil, la vérification d’adresse et l’aperçu Design System utilisent le composant `BackButton`. |
| Mettre à jour les annonces sans navigation complète | Implémentée | Les filtres, les onglets de catégories, l’effacement des filtres et la recherche globale sur `/annonces` utilisent la même requête `GET /api/annonces`; seuls les résultats et leur pagination sont remplacés, et l’URL est synchronisée via `history.replaceState`. Les autres pages gardent la navigation vers `/annonces`. |
| Vérifier les changements | Validée automatiquement | `pnpm.cmd --filter @topdeal/web exec tsc --noEmit` et `pnpm.cmd --filter @topdeal/web lint` passent. Le comportement filtre, galerie et navigation reste à valider dans le navigateur local. |

## Rendu et responsive de la fiche annonce — en cours

| Étape | État | Résultat / validation |
|---|---|---|
| Corriger les données non mises en cache sur `/annonces/[annonceId]` | Implémentée | La page de route devient synchrone et place le chargement des paramètres et de l’annonce dans un composant serveur suspendu sous un `Suspense` local avec fallback. `cacheComponents` reste activé; les données d’annonce ne sont pas mises en cache. |
| Adapter la fiche et sa galerie aux petits écrans | Implémentée | La photo principale garde un ratio 4:3 sur mobile/tablette et la hauteur de 490 px à partir du breakpoint large; le contenu peut se réduire, les titres/descriptions longs se coupent correctement, les tags et actions se replient/empilent sur mobile. |
| Vérifier les changements | Validée automatiquement | Le typecheck et ESLint Web passent. La navigation vers une annonce réelle et les tailles mobile/tablette restent à confirmer dans le navigateur local. |

## Revue performance PostgreSQL et annonces — état courant

| Étape | État | Résultat / validation |
|---|---|---|
| Cartographier les accès Prisma | Auditée | Les accès actifs se concentrent dans Auth et Annonce. La liste publique est paginée à 24 éléments et « Mes annonces » à 20; les sélections ne chargent que les champs consommés et une photo de vignette. |
| Réduire les requêtes de recherche | Implémentée | La recherche par catégorie filtre maintenant la relation dans la même requête `annonce.findMany`; la requête préalable vers `categorie` a été supprimée. |
| Réduire les signatures répétées MinIO | Implémentée | Les URLs de lecture sont mises en cache en mémoire pendant 270 secondes pour une signature valable 300 secondes, avec déduplication des demandes simultanées et une capacité maximale de 4 096 clés. |
| Aligner les index sur les accès observés | Préparée | Le schéma et une migration ajoutent les index de pagination (publication/propriétaire), de photos ordonnées et les index trigrammes pour les recherches `contains`/`ILIKE`. Les deux index simples remplacés par des index composés sont supprimés pour limiter l’amplification des écritures. La migration crée les index dans la transaction Prisma; planifier hors pointe sur une grosse base. |
| Borner le pool PostgreSQL par processus | Implémentée | `DATABASE_POOL_MAX` configure le pool `pg` (défaut 10, bornes 1–50); le délai d’établissement d’une connexion est limité à 5 secondes. Le budget global dépend toujours du nombre d’instances et de la capacité PostgreSQL/pooler. |
| Valider le code et le schéma | Validée automatiquement | `prisma validate`, `tsc --noEmit`, ESLint Web et `git diff --check` passent. `prisma migrate status` confirme que la base locale est à jour; l’extension et les six index prévus sont présents. Aucune suite de tests n’a été exécutée. |
| Mesurer le comportement sous charge | À faire | `EXPLAIN (ANALYZE, BUFFERS)` sur la recherche représentative locale termine en 0,289 ms mais ne trouve aucune annonce et ne lit que 5 lignes; PostgreSQL choisit correctement un scan séquentiel sur ce petit volume. Ce résultat ne mesure pas une base réelle ni 1 000 connexions. Refaire les plans avec données réalistes et exécuter un test de charge proche de la production. |
| Appliquer la migration et configurer l’infrastructure | Migration locale appliquée | Après la première erreur transactionnelle, état vérifié sans objets partiels; migration corrigée en SQL standard, échec marqué rolled back puis `prisma migrate deploy` réussi sur `topdeal@localhost:5432`. Les index standard peuvent bloquer les écritures pendant leur création sur une grosse base; planifier hors pointe. Les autres environnements doivent exécuter `prisma migrate deploy`. Configurer `DATABASE_POOL_MAX` selon le budget total de connexions et vérifier que l’hébergeur autorise `pg_trgm`. |

Skills consultés : performance, architecture, nomenclature, évolutivité et sécurité. Décision conservée : pas de Redis ni de cache de résultats sans besoin mesuré et stratégie d’invalidation; le cache ajouté ne porte que sur les URLs signées temporaires MinIO. Les index GIN améliorent les filtres textuels `contains`, au prix d’espace disque et d’écritures légèrement plus coûteuses; les recherches de moins de trois caractères doivent être évaluées avec les données réelles. La cible des 1 000 utilisateurs connectés exige un dimensionnement de l’application, du pooler et de PostgreSQL, ainsi qu’une validation de charge.

## Favoris — état courant

| Étape | État | Résultat / validation |
|---|---|---|
| Respecter les règles RG-049 à RG-051 | Implémentée | Ajout et retrait persistants d’une annonce; état indisponible reflété dans « Mes favoris »; aucune liste de souhaits ajoutée. |
| Ajouter les contrats et Use Cases atomiques | Implémentée | Contrats, modèles et implémentations séparés dans `core`, `domain/usecases` et `data/repositories`. |
| Protéger l’accès aux favoris | Implémentée | Lecture et mutations associées à l’identité Firebase vérifiée côté serveur; mutation POST protégée par vérification de l’origine et d’un header de requête same-origin; l’utilisateur vient de la session, jamais du corps reçu. |
| Éviter les requêtes par carte | Implémentée | Les IDs favoris des annonces visibles sont récupérés par une seule requête groupée par page; les résultats privés utilisent `Cache-Control: private, no-store`. |
| Rendre les favoris accessibles depuis les parcours | Implémentée, à valider visuellement | Le cœur fonctionne dans les cartes et la fiche; `/annonces/favoris` donne une liste paginée privée. Les annonces masquées/suspendues ou dont la catégorie est inactive apparaissent comme indisponibles sans exposer leur contenu; elles restent retirables. |
| Vérifier les changements | Vérifications automatiques validées | `pnpm --filter @topdeal/web exec tsc --noEmit`, ESLint Web et `git diff --check` passent. Aucun test automatisé n’a été exécuté; l’ajout, le retrait, le refus anonyme et la pagination restent à confirmer dans le navigateur avec une session réelle. |

Correction d’interface validée automatiquement : à la demande du propriétaire, le cœur reste visible dans son état courant pendant la récupération initiale, sans indicateur. Le curseur pointeur est explicitement appliqué. La grille Favoris reprend les cartes du catalogue, dont le badge « Troc accepté », le prix, le titre, l’état et le quartier. TypeScript Web et ESLint Web passent après l’ajustement; contrôle visuel navigateur encore à faire.

Diagnostic à la suite du 500 signalé : les logs Next montrent `resolveGetAnnonceFavoriteIdsUseCase is not a function` et `resolveSetAnnonceFavoriteUseCase is not a function`. Ces fonctions sont bien exportées par le fichier source `apps/web/di/container.ts`, les repositories/Use Cases sont enregistrés dans Awilix et le typecheck réussit. Le serveur Next actif sert donc une ancienne version compilée du Composition Root; redémarrer `pnpm dev` puis retester `/api/annonces/favoris` et le POST est nécessaire. Pas de modification métier ou de session requise pour ce symptôme.

Correction du pré-rendu `/annonces` : la lecture de `searchParams`, des catégories et des annonces a été déplacée sous une frontière `Suspense` locale au segment, avec fallback de chargement. Ceci répond à l’erreur Next.js Cache Components qui signalait la requête Prisma des catégories hors Suspense; les requêtes et filtres ne changent pas. TypeScript Web, ESLint Web et `git diff --check` passent; reste à confirmer le log de compilation/navigation après HMR dans le navigateur.

Pas de changement de schéma ni de migration : la table `favori`, sa clé primaire composite et son index annonce existaient déjà. Le dossier fonctionnel suivant n’est pas engagé avant validation manuelle du parcours Favoris.

## Mes annonces — tranche de correction et édition complète

| Étape | État | Résultat / validation |
|---|---|---|
| Diagnostiquer l’échec du masquage et de l’édition | Corrigée | `isAllowedAuthMutation` n’autorisait que `POST` alors que ces deux routes utilisent `PATCH`; elles répondaient donc toujours `403`. Les routes concernées autorisent maintenant explicitement `PATCH`; les autres gardent `POST` par défaut. |
| Réutiliser les cartes catalogue dans Mes annonces et Favoris | Implémentée | Une carte produit partagée porte photo, troc, prix, titre, état et quartier. Mes annonces utilise une grille responsive identique au catalogue avec le statut et les actions vendeur. |
| Modifier tous les champs de publication | Implémentée | La modale permet de modifier titre, description, catégorie/sous-catégorie, état, prix, quantité, quartier, troc et photos. Les photos existantes sont conservables individuellement; les nouvelles passent par MinIO et les anciennes retirées sont supprimées après validation de la transaction PostgreSQL. |
| Protéger les modifications | Implémentée | La session et l’ownership sont vérifiés côté serveur. Les catégories et photos conservées sont validées côté serveur; une annonce avec une commande active n’est pas modifiable afin de préserver les conditions de cette commande. Aucun schéma ou migration n’est ajouté. |
| Ajouter recherche, filtres et pagination aux annonces du vendeur | Implémentée | Recherche titre/description, catégorie, état, visibilité, fourchette de prix, quartier et troc sont appliqués dans PostgreSQL; la pagination reste par curseur et l’ordre est « plus récentes ». Les résultats se mettent à jour sans recharger le document. |
| Corriger le contexte de la recherche du header | Implémentée | La recherche reste sur Favoris et Mes annonces et filtre la liste active; elle ne renvoie plus systématiquement au catalogue. Les listes interrogent leurs API privées avec `no-store`. |
| Vérifier cette tranche | Validée automatiquement, à confirmer manuellement | TypeScript Web et `git diff --check` passent. ESLint Web et le lint ciblé de la feature ne remontent aucune erreur; quatre avertissements `@next/next/no-img-element` restent sur les photos du catalogue/galerie et de la modale. Aucun test automatisé n’a été lancé. À valider dans le navigateur : masquer/republier, filtres et pagination vendeur, recherche du header depuis Favoris et Mes annonces, édition de tous les champs et conservation/remplacement/suppression de photos avec MinIO. |

Décision de protection des annonces : l’édition complète retourne `409` lorsqu’une commande associée n’est pas dans un état terminal (`TERMINEE`, `ANNULEE`, `REMBOURSEE`). Cela évite de modifier les informations d’une annonce pendant une commande ou un litige en cours. La recherche filtre et trie côté base, sans charger toutes les annonces du vendeur.

## Recherche, filtres et actions vendeur — validation de la tranche courante

| Étape | État | Résultat / validation |
|---|---|---|
| Aligner les filtres de Mes annonces et Favoris sur le catalogue | Implémentée | `AnnonceBrowseControls` partage les onglets de catégories, les catégories/sous-catégories et le panneau responsive de filtres. Favoris n’a plus de barre de recherche locale : la recherche du header reste l’unique champ. |
| Filtrer les favoris sans charger toute la collection | Implémentée | La recherche, la catégorie, l’état, le prix, le quartier et le troc sont appliqués dans la requête Prisma; les favoris restent paginés par curseur. |
| Accélérer la recherche du vendeur | Implémentée, à confirmer en local | Le header émet immédiatement l’événement sur les pages de listes; une temporisation unique de 100 ms est appliquée avant l’appel API, les requêtes précédentes sont annulées et les filtres restent côté serveur. La liste conserve une page de 20 éléments, sans parcourir les 5 000 annonces côté navigateur. |
| Ouvrir l’édition sans attente réseau | Implémentée, à mesurer avec MinIO local | Les données d’édition et les URLs temporaires des photos sont incluses dans la page vendeur paginée. La modale initialise le formulaire depuis ces données et ne fait plus de GET au clic. Les URLs des photos sont signées à la lecture côté serveur; aucun changement de stockage MinIO ni de schéma n’est fait. |
| Rendre les actions vendeur visibles sur la carte | Implémentée | Modifier et masquer/republier sont des boutons icônes accessibles placés en haut à droite de la photo, en face du badge « Troc accepté ». Le masquage met à jour l’interface immédiatement puis restaure l’état si la requête échoue. `IconButton` est ajouté au Design System. |
| Vérifier le code | Validé automatiquement | `pnpm.cmd --filter @topdeal/web exec tsc --noEmit`, ESLint ciblé sur les fichiers modifiés et `git diff --check` passent. ESLint signale un avertissement `no-img-element` sur la photo déjà présente dans la modale; aucun nouveau blocage. Pas de tests automatisés lancés. À confirmer dans le navigateur : filtres vendeur/favoris, recherche du header, ouverture instantanée de l’édition et actions icônes. |

## Photos du formulaire de création d’annonce — tranche courante

| Étape | État | Résultat / validation |
|---|---|---|
| Ajouter des photos en plusieurs sélections | Implémentée | Le formulaire ajoute les fichiers sélectionnés aux précédents au lieu de les remplacer. Le champ fichier est réinitialisé après chaque sélection pour permettre d’en choisir d’autres ensuite. |
| Limiter à six photos avant envoi | Implémentée | L’interface refuse toute nouvelle sélection qui ferait dépasser six fichiers, conserve les photos déjà ajoutées et affiche le nombre restant. Type, taille vide et limite de 5 Mo sont contrôlés côté client. |
| Prévisualiser et retirer les photos | Implémentée | Chaque fichier a un aperçu local, un nom et un bouton de suppression. Les Object URLs sont libérées lorsqu’une photo est retirée ou que l’étape se démonte. |
| Bloquer les dépassements côté serveur | Implémentée | La route de création rejette les formulaires avec moins de 1 ou plus de 6 fichiers, ainsi que type/taille non conformes, avant lecture des contenus en mémoire; le Use Case conserve sa validation métier et aucune photo invalide n’est envoyée vers MinIO. |
| Vérifier le code | Validé automatiquement | TypeScript Web passe; ESLint ciblé passe sans erreur (un avertissement `no-img-element` sur l’aperçu local); aucun test automatisé exécuté. Reste à confirmer dans le navigateur : sélectionner par lots, refuser un lot dépassant la capacité, retirer une image et publier avec toutes les photos retenues. |

## Modale de modification — retrait des photos

| Étape | État | Résultat / validation |
|---|---|---|
| Remplacer « Conserver » par une croix | Implémentée | Chaque photo existante dispose d’un bouton accessible en croix. Le retrait l’enlève immédiatement de l’aperçu et des identifiants conservés envoyés au serveur. |
| Respecter la limite de six photos | Implémentée | La sélection de nouvelles photos est refusée si elle dépasserait six au total. L’enregistrement demande au moins une photo conservée ou ajoutée. |
| Vérifier le code | Validé automatiquement | TypeScript Web et ESLint ciblé passent sans erreur; ESLint garde un avertissement `no-img-element` sur l’aperçu existant. Aucun test automatisé lancé. Le retrait et l’enregistrement restent à confirmer dans le navigateur. |

Mise à jour de la modale après retour utilisateur : l’ajout de photos affiche désormais immédiatement un aperçu local, un nom et une croix pour chacune; les sélections successives s’ajoutent aux photos déjà choisies. Une sélection est refusée si le total dépasserait six ou si le fichier n’est pas JPEG/PNG/WebP de taille 1 à 5 Mo. Les aperçus utilisent des Object URLs libérées à la suppression et à la fermeture de la modale. Vérification : TypeScript passe, ESLint ciblé passe sans erreur avec deux avertissements `no-img-element` sur les aperçus. Le flux reste à confirmer visuellement dans le navigateur.

## Responsive annonces — tranche courante

| Étape | État | Résultat / validation |
|---|---|---|
| Adapter les grilles Catalogue, Favoris et Mes annonces | Implémentée | Sous 360 px CSS, une carte par rangée; de 360 à 639 px, deux; à partir de 640 px, trois; à partir de 1024 px, quatre. Les cartes réduisent les espacements/typos sur petits écrans et les badges/actions ne se chevauchent plus; les actions vendeur se replient verticalement sous 440 px. La largeur du contenu reste plafonnée pour les grands écrans. |
| Adapter les catégories et filtres | Implémentée | Les catégories défilent horizontalement sans élargir la page; le panneau de filtre passe en dialogue compact jusqu’à 1023 px, avec largeur, hauteur dynamique, zone de défilement et insets sûrs. Il devient un panneau ancré à partir de 1024 px. |
| Adapter les formulaires et modales | Implémentée | Les aperçus photo occupent une colonne sous 360 px, deux sur petits écrans et trois à partir de 640 px. Les champs de la modale passent de 1 à 2 puis 3 colonnes; dimensions de la modale limitées par le viewport et les zones sûres. |
| Adapter la pagination et les actions tactiles | Implémentée | Les libellés de pagination et marges se réduisent sous 360 px; boutons de fermeture et de retrait des photos gardent des surfaces d’action larges. |
| Vérifier le code | Validé automatiquement | TypeScript Web et ESLint ciblé passent sans erreur. Avertissements existants `no-img-element` sur les images des cartes et aperçus. `git diff --check` passe. Pas de tests automatisés ni de contrôle visuel sur appareils réels lancés; à confirmer sur petits téléphones, iPhone/Android, tablettes portrait/paysage et desktop. |

## Refonte Design System — audit et plan à valider

### Audit
- `packages/ui` contient 7 composants (Button, BackButton, IconButton, Card, Input, Select, Switch); le package n’est donc pas vide, mais il couvre seulement les contrôles de base.
- `packages/ui/styles/themes.css` définit une seule palette `:root` (page, surface, accent, erreur); aucun sélecteur/palette `data-theme` n’existe pour bleu/jaune/rouge/vert.
- `packages/ui/index.ts` expose ces composants et tokens. La page `/design-system` ne présente que Button, Card et Input.
- Les pages utilisent déjà des rôles Tailwind sémantiques (`text-text`, `bg-surface`, `border-border`) reliés aux variables du Design System; les couleurs hex en dur sont concentrées surtout dans fiche/galerie/cartes annonce. La limite principale est l’absence de rôles de thème plus complets et de primitives partagées pour certains patterns.
- Exemples de duplication : deux implémentations de barre/panneau de filtres entre Catalogue et `AnnonceBrowseControls`; les filtres partagés ont des inputs/selects natifs stylés au lieu des composants Input/Select existants; description en textarea codée dans création et édition; liens d’action utilisant répétitivement la classe `td-button`.

### Plan valide par le proprietaire
1. Étendre les tokens sémantiques de couleur et les relier aux utilities Tailwind sans changer l’apparence actuelle TopDeal; réserver les rôles nécessaires à `on-accent`, focus, overlay et états succès/avertissement/erreur.
2. Préparer le mécanisme CSS `data-theme` par variables, sans fixer des nuances bleu/jaune/rouge/vert non validées ni ajouter un sélecteur de thème prématuré.
3. Compléter uniquement les primitives justifiées par des usages répétés (notamment Textarea et primitives d’action/lien si l’API existante le permet); appliquer Input/Select au panneau de filtres et partager les variantes de bouton existantes.
4. Remplacer les quelques couleurs arbitraires relevées par les tokens sémantiques; aligner les états `Button`/`Switch` sur l’accent thématique.
5. Éviter la réécriture générale de Tailwind déjà sémantique; migrer ensuite par tranche sur Auth et Annonce, en retirant les duplications vérifiées.
6. Étoffer `/design-system` comme galerie de référence pour tokens et composants réellement disponibles.
7. Valider le typecheck, lint, diff et vérifier visuellement le thème par défaut; aucun changement de comportement métier ou schéma DB.

Etat initial avant accord : audit termine, sans modification UI. Voir la validation et l avancement ajoutes ci-dessous.

### Validation apres accord et avancement
- Tokens semantiques ajoutes : texte sur accent, focus, voile, succes et avertissement. Le theme orange actuel reste la palette active; les nuances bleue, jaune, rouge et verte restent a valider avant implementation.
- Les styles globaux et les composants utilisent les nouveaux roles; Button et Switch suivent l accent pour leurs etats actifs.
- Ajout du composant generique Textarea dans packages/ui; les formulaires de creation et de modification d annonce l utilisent.
- Les filtres Catalogue, Favoris et Mes annonces partagent AnnonceFilterFields : champs, labels, ordre des categories et mise a jour instantanee sont definis une seule fois.
- Les couleurs hex des fiches, galeries et cartes annonce ont ete remplacees par des tokens semantiques.
- La page /design-system presente maintenant les tokens et les composants existants, avec un exemple de Switch interactif.
- Verification : pnpm.cmd --filter @topdeal/web exec tsc --noEmit reussit; pnpm.cmd --filter @topdeal/web lint reussit. git diff --check retourne 0 (avertissements Git sur conversion LF/CRLF seulement). Aucun test automatise ni controle visuel navigateur n a ete lance.
- A faire : valider visuellement la galerie et les formulaires; definir les valeurs exactes des autres palettes avec le proprietaire, puis brancher un choix de theme utilisateur si demande. La migration des composants Auth reste une tranche distincte.
- Aucun changement de regle metier, schema de base ou fonctionnalite d authentification.
## Retours d action et confirmations de suppression — tranche implementee
- La case native « Accepter le troc » de la modale de modification utilise le Switch de packages/ui, avec une description accessible.
- Correction de la portee, selon la decision la plus recente : une confirmation est reservee a une suppression reelle/irreversible ou autre action critique. Retirer une photo d un formulaire (creation ou edition) et retirer un favori (action reversible) ne demandent pas de confirmation; leur resultat est signale par Sonner. Les autres actions non critiques restent sans dialogue.
- Sonner est installe dans @topdeal/ui; ToastViewport monte son Toaster top-center dans le layout Web et useToast expose toast.success/error/info. Le toast Sonner utilise une carte de surface, une bordure et l ombre tokenisee du design system; Sonner gere l entree depuis le haut.
- Recherche, filtres, navigation et changements locaux de champs restent immediats. Les ajouts/retraits de photos dans les formulaires et les changements de favoris affichent un retour Sonner; ils ne demandent aucune confirmation.
- La page /design-system inclut des exemples de notifications de reussite et d echec.
- Les erreurs et statuts de formulaire Auth/Annonce ne sont plus rendus en ligne; les retours de reussite/echec passent par les notifications Sonner.
- La verification de session distingue une session invalide d une indisponibilite technique. Les routes API ferment l acces et renvoient 503 AUTH_SERVICE_UNAVAILABLE en cas d echec reseau/Firebase, au lieu d une erreur 500; les listes proteges sous Suspense redirigent vers la connexion avec un toast.
- Verification apres cette tranche : `pnpm.cmd --filter @topdeal/web exec tsc --noEmit`, `pnpm.cmd --filter @topdeal/web lint` et `git diff --check` passent. Aucun test automatise ni controle visuel navigateur n a ete execute.
- A confirmer manuellement : l affichage du toast carte Sonner, le 503 des favoris pendant une panne Firebase, et l absence d erreur de pre-rendu en ouvrant Mes annonces.

## Audit qualite, architecture et performance — etat initial
- Skills consultes pour cet audit : architecture, nomenclature, evolutivite, performance, securite et design-system; instructions globales et `apps/web/AGENT2.md` prises en compte.
- Perimetre inspecte en lecture seule : structure du monorepo, feature Annonce, routes web associees, requetes Prisma, schema et migration d optimisation existante, stockage MinIO/S3, session Firebase et Design System.
- Etat de depart : TypeScript Web, ESLint Web et `git diff --check` passent. Aucun test automatise lance. Le workspace contient encore les changements non valides des tranches precedentes; ils doivent etre preserves et verifies sans les ecraser.
- Bons points confirmes : pagination serveur par curseur (20 annonces par page), selections Prisma explicites dans les listes, recherches textuelles accompagnees d index GIN trigram dans la migration existante, parallellisation de chargements independants, URLs de lecture S3 mises en cache en memoire avec expiration et concurrence regroupee par cle.
- Point de performance a mesurer : `GetOwnedAnnoncesRepositoryImpl` charge toutes les photos de chaque annonce pour preparer l edition avant ouverture de la modale; `GetOwnedAnnoncesUseCaseImpl` signe les URLs de chaque photo. Au maximum actuel, une page de 20 annonces peut traiter jusqu a 120 references de photo. Evaluer le cout reel et le compromis avec l ouverture instantanee de la modale avant changement.
- Point base de donnees a mesurer : les favoris sont filtres par `utilisateur_id` et tries par `date_ajout, annonce_id`, alors que le schema declare la cle primaire `(utilisateur_id, annonce_id)` et un index inverse par annonce. Verifier le plan `EXPLAIN` avant de proposer un index compose et toute migration; aucune migration ni commande Prisma destructive n est autorisee implicitement.
- Point de maintenabilite a examiner par tranche : les pages favoris/vendeur traitent parsing/validation des query params, pagination et composition d ecran dans le meme fichier. Comparer cette responsabilite aux regles Next.js et aux consommateurs avant extraction; pas de deplacement mecanique ni d abstraction globale.
- Plan propose, pas encore execute : (1) mesurer les requetes et URLs de photos avec les donnees locales; (2) corriger seulement les goulots confirmes, migration eventuelle presentee separement; (3) refactoriser une responsabilite a la fois dans la feature concernee en conservant le comportement; (4) revalider TypeScript, ESLint, diff et parcours fonctionnels pertinents, puis noter chaque validation ici.
- Aucun fichier applicatif, schema ou migration n a ete modifie pendant cet audit. La premiere tranche lecture seule a ete validee par le proprietaire puis executee; les refontes restent a valider separement.
- Mesures lecture seule terminees sur PostgreSQL local : 6 annonces (6 publiees), 2 favoris et 13 photos au total. `EXPLAIN ANALYZE` donne 0,131 ms pour la liste publique, 0,160 ms pour une recherche textuelle, 0,218 ms pour la liste proprietaire (incluant le choix du compte de mesure) et 0,125 ms pour les favoris. Avec ce faible volume, PostgreSQL choisit des scans sequentiels pour annonces et un scan via la cle primaire puis un tri pour favoris; ces chiffres ne permettent pas d extrapoler a 5 000 annonces/1 000 sessions.
- Mesure locale de `getSignedUrl` (AWS SDK, URL S3 pre-signee, endpoint et credentials factices; aucune requete reseau) : 30 lots de 13 signatures concurrentes, mediane 7,15 ms, p95 11,42 ms, maximum 16,42 ms; pour le plafond theorique de 120 signatures, 20 lots, mediane 94,91 ms, p95 132,86 ms, maximum 137,20 ms. Ce microbenchmark mesure uniquement la signature cryptographique sur cette machine, pas la latence complete de rendu/serialisation ni MinIO.
- Conclusion intermediaire : le volume local actuel est trop petit pour justifier un index ou une migration. La signature est peu couteuse pour les 13 photos presentes, mais le plafond de 120 justifie de mesurer un parcours vendeur avec donnees representatives avant de decider si les URLs d edition doivent etre chargees a la demande. Les caches S3 existants expirent apres 270 secondes et regroupent les signatures concurrentes par cle dans un processus.
- Pour une mesure de charge representative, il faudra un jeu de donnees de test suffisamment volumineux et non destructif; aucune donnee synthétique n a ete inseree. Toute generation de donnees dans la base locale devra etre validee avant execution.
- Configuration de capacite inspectee : `createDatabaseClient` utilise un pool PostgreSQL de 10 connexions par processus par defaut; `apps/web/di/container.ts` accepte `DATABASE_POOL_MAX` entre 1 et 50. Ne pas augmenter ce nombre sans compter les processus/instances et verifier les limites PostgreSQL.
- Le fournisseur Firebase Admin appelle `verifySessionCookie(cookie, true)` pour verifier la revocation. Ce controle fait partie du chemin d authentification protege; mesurer son cout et preserver la securite avant tout changement.
- Prochaine validation requise : la base `topdeal` ne contient que 6 annonces, donc elle ne peut pas representer 5 000 annonces ou une charge concurrente. Avant tout ajout de fixtures/jeu de charge, obtenir l accord sur l usage d une base jetable distincte; ne pas injecter de donnees dans la base locale actuelle.
- Correction UI executee apres le retour du proprietaire : retrait de photo dans la modale d edition et le formulaire de creation, ainsi que retrait d un favori, ne declenchent plus de ConfirmationDialog; chaque action affiche le toast Sonner de resultat. `useConfirmation`/`ConfirmationDialog` restent disponibles pour une future suppression reelle ou action critique. TypeScript Web, ESLint Web et `git diff --check` repasses avec succes apres cette correction; controle navigateur non execute.

## Favoris indisponibles et isolation des comptes — tranche implementee
- Une annonce masquee/suspendue, avec categorie inactive ou non disponible reste visible dans Favoris avec ses informations et sa photo; une mention `Annonce indisponible` apparait sur la carte. La carte n ouvre pas une fiche publique qui repondrait 404 tant que l annonce est indisponible. L utilisateur peut toujours retirer ce favori.
- Isolation controlee : les pages Favoris et Mes annonces verifient la session Firebase cote serveur; leurs Route Handlers utilisent `getVerifiedUserForApi()` et transmettent uniquement le `userId` derive du cookie session verifie. Les repositories filtrent respectivement par `favori.utilisateur_id` et `annonce.utilisateur_id`; la mutation favori utilise egalement l identite serveur, jamais un userId recu du client. Les reponses de ces routes sont `private, no-store`; les pages chargeant les donnees privees appellent `connection()` pour eviter un rendu partage/cache.
- Les connexions reussies (email/mot de passe, Google avec profil, verification email terminee) et finalisation de profil d inscription redirigent explicitement vers `/annonces`; la racine redirige deja vers cette route.
- Aucune modification de schema ni migration. La lecture des details d annonces masquees reste protegee : la fiche publique n est pas rendue depuis Favoris.
- Verification apres cette tranche : `pnpm.cmd --filter @topdeal/web exec tsc --noEmit`, `pnpm.cmd --filter @topdeal/web lint` et `git diff --check` passent. Tests automatises et verification multi-comptes dans navigateur non lances; le test manuel doit utiliser deux comptes pour confirmer favoris/mes annonces isoles et redirection vers `/annonces` apres connexion.

## Navigation des categories — ajustement visuel
- Hypothese sur le retour du proprietaire : l artefact de type barre/curseur en fin de ligne est la barre native de defilement horizontal. Elle est maintenant masquee sur la ligne de categories du catalogue et des controles partages, tout en conservant le defilement horizontal au tactile/trackpad. Aucun changement au tri ni aux filtres.
- Verification a executer apres cet ajustement : typecheck Web, ESLint Web et `git diff --check`; controle visuel navigateur a confirmer.

## Tri des annonces — tranche implementee
- Le controle decoratif « Plus récentes » est remplacé par un select du Design System avec quatre choix : Plus récentes, Plus anciennes, Prix croissant et Prix décroissant.
- Le tri est appliqué en base par Prisma avant la pagination, sur le catalogue, Favoris et Mes annonces. Les changements de recherche/filtre réinitialisent la pagination et conservent le tri actif; les liens précédent/suivant conservent aussi le tri.
- Règle d’ordre : catalogue et Mes annonces utilisent la date de publication pour récent/ancien; Favoris utilisent la date d’ajout au favori. Les tris prix utilisent le prix de l’annonce. Un identifiant stable départage les valeurs égales.
- Le paramètre `sort` est validé aux routes API, avec « recent » comme valeur par défaut. Aucun schéma, index ou migration Prisma n’a été modifié.
- Vérification exécutée : `pnpm.cmd --filter @topdeal/web exec tsc --noEmit`, `pnpm.cmd --filter @topdeal/web lint` et `git diff --check` réussissent. Aucun test automatisé ni contrôle visuel navigateur n’a été lancé.
- À confirmer manuellement : sélectionner les quatre tris dans Catalogue, Favoris et Mes annonces; vérifier le maintien du choix lors des filtres et de la pagination, et l’affichage du select sur petit écran.

## Validation du formulaire de création d’annonce — correctif
- Le contrôle « Formulaire incomplet » dépendait de `form.checkValidity()` sur le formulaire multi-étapes complet. La validation vérifiait l’état natif des éléments DOM plutôt que les données de l’étape active, sans indiquer précisément le champ bloquant.
- La validation utilise maintenant le brouillon de l’étape active : champs produit/photos à l’étape 1; prix, quantité, quartier et détail du troc à l’étape 2. Le premier champ manquant/invalide reçoit le focus, et les contraintes métier existantes sont préservées.
- Les listes catégorie et sous-catégorie ont des noms explicites pour pouvoir recevoir le focus approprié.
- Vérification exécutée après le correctif : typecheck Web, ESLint Web et `git diff --check` passent. Le parcours dans le navigateur reste à confirmer manuellement.

## Publication d’annonce — correctif de pré-rendu et diagnostic de validation
- `/annonces/nouvelle` lit les catégories en base pendant son rendu. La page utilise maintenant `connection()` dans un composant serveur placé sous `Suspense`, avec un fallback de chargement, afin d’exécuter cette lecture à la requête et supprimer l’erreur Next.js de données non mises en cache.
- Le toast générique « Formulaire incomplet » a été remplacé par des retours précis par champ pour les étapes 1 et 2. Le champ concerné reçoit le focus; les contraintes de validation ne sont pas assouplies. Cela permettra aussi d’identifier tout champ que le propriétaire considère rempli si un nouveau blocage survient.
- Vérification en cours : typecheck Web déjà passé. ESLint Web et `git diff --check` à terminer. Validation du rendu et du parcours dans le navigateur à confirmer.
- Vérification terminée : `pnpm.cmd --filter @topdeal/web exec tsc --noEmit`, `pnpm.cmd --filter @topdeal/web lint` et `git diff --check` passent (Git n’affiche que ses avertissements habituels LF/CRLF). Le parcours navigateur reste à confirmer.

## Formulaire annonce — séparation stricte des étapes
- Retour du propriétaire : le toast « Prix à corriger » apparaissait alors qu’il quittait l’étape 1. Correction supplémentaire dans `CreateAnnonceScreen` : `Continuer` appelle exclusivement `validateFirstStep`; la soumission finale appelle exclusivement `validateSecondStep`. Les validations ne dépendent plus de l’état courant pour décider quels champs contrôler.
- Le champ fichier photos porte maintenant le nom `photos`, ce qui permet également de lui donner le focus en cas de validation.
- Le prix ne peut donc plus bloquer le passage de l’étape 1 à l’étape 2 par cette validation. Vérifier par le parcours réel après HMR : remplir l’étape 1 et cliquer Continuer, puis tester les erreurs de prix uniquement sur Publier.

## Formulaire annonce — cause du saut vers le prix identifiee
- Le retour « Continuer » plaçait le focus sur Prix de base parce que les boutons Continuer et Publier partageaient la même position et le même type React. Le clic validait l’étape 1, puis React pouvait réutiliser le bouton et le convertir en `submit` avant la fin de l’action native du clic; le navigateur soumettait alors le formulaire et validait l’étape 2.
- Correction : identités React distinctes (`key`), `preventDefault()` sur Continuer et garde du handler `submit` qui refuse toute soumission hors de l’étape 2. Continuer valide exclusivement l’étape 1.
- Vérification : typecheck Web, ESLint Web et `git diff --check` passent. Parcours navigateur à confirmer après HMR.

## Préférence de thème utilisateur — tranche implementee
- Le header des pages marketplace expose le bouton « Thème » et son panneau de choix : Orange (défaut), Bleu, Jaune, Rouge ou Vert.
- Les palettes sont définies par les tokens sémantiques existants du Design System (`packages/ui/styles/themes.css`). Elles adaptent accent, texte sur accent, focus, surfaces adoucies et bordures; les rôles d’état (erreur, succès, avertissement) restent cohérents.
- `ThemeProvider` dans `packages/ui` applique le choix au document racine, le conserve dans `localStorage` sous `topdeal-theme` et synchronise les onglets. La préférence est actuellement locale à ce navigateur/appareil, sans stockage serveur ni rattachement au compte.
- La galerie `/design-system` décrit les palettes et le stockage local.
- Vérification : typecheck Web, ESLint Web et `git diff --check` passent. Aucun test automatisé ni contrôle visuel navigateur n’a été lancé; le contrôle responsive du menu et l’absence de flash lors du rechargement restent à confirmer manuellement.

## Préférence de thème — bouton temporairement retiré
- À la demande du propriétaire, le bouton « Thème » et son import ont été retirés du header uniquement. Les palettes, tokens, ThemeProvider, sélection mémorisée et documentation Design System sont conservés pour réactivation ultérieure.
- Reprise fonctionnelle demandée : identifier la prochaine tranche du produit à partir de la spécification et des fonctions déjà présentes.

## Affiliation — cadrage de la prochaine fonctionnalité
- Le propriétaire demande de prioriser le lien d’affiliation et l’action « Revendre »; la messagerie est différée en raison de ses exigences de sécurité et de rapidité.
- Les règles validées sont dans `docs/SPECIFICATION_FONCTIONNELLE.md` section 11 et `docs/REGLES_METIERS.md` RG-099 à RG-110 : le propriétaire active/désactive l’affiliation et fixe une rémunération unitaire; le lien affiche un prix unique base + rémunération; auto-affiliation et affiliation sur troc interdites; la rémunération ne devient acquise qu’après commande payée et remise validée; annulation/remboursement l’annule.
- `packages/database/prisma/schema.prisma` contient déjà `affiliation`, `lien_affiliation` et `attribution_affiliation`; le schéma documente aussi la commande et le versement affilié. Aucun nouveau schéma n’est présumé nécessaire.
- Plan proposé : réglage propriétaire de l’affiliation dans création/édition; bouton « Revendre » pour un autre compte sur une annonce active; création/récupération serveur d’un code unique par apporteur et annonce; URL partageable qui conserve le code et affiche le prix final prévu par la règle. L’attribution et le versement ne seront déclarés qu’au travers du futur parcours commande/remise, jamais au simple clic ou partage.
- En local, construire le lien avec l’origine courante (`window.location.origin`) permet de tester sur le même ordinateur avec deux comptes/profils navigateur. `localhost` n’est pas accessible depuis le téléphone d’un tiers; un test sur réseau local requiert l’adresse LAN du PC et un endpoint MinIO accessible sous cette adresse. Pour partage public, utiliser un domaine de staging/déploiement. Le stockage du code de lien dans la base locale permet de tester son unicité et sa persistance sans domaine public.
- État d’exécution après accord : le réglage vendeur est ajouté aux formulaires de création/modification de la feature annonce; le troc désactive cette option. Le serveur enregistre l’affiliation dans la transaction de création/modification et refuse les montants invalides.
- Relecture de `publication annonce phase 2.html` : les options suivent maintenant l’ordre de la maquette (affiliation, puis troc) dans une même carte. L’affiliation utilise une rémunération entière minimale de 1 FCFA (valeur initiale 5 000 FCFA) et affiche en direct le prix base + rémunération; le bloc troc reprend les modalités d’échange et de soulte. Le formatter de prix est partagé entre création et édition.
- La génération/validation des liens, le calcul du prix affilié et le bouton « Revendre » vivent dans `packages/features/affiliation` (`@topdeal/feature-affiliation`), avec contrats Core, Use Cases Domain, repository Data, présentation et enregistrement Awilix dans le Composition Root Web.
- Le bouton « Revendre » demande au serveur de réutiliser/créer un code unique pour un compte autre que le vendeur. Les contrôles serveur exigent une annonce publiée, disponible, affiliable et sans troc. L’URL est produite depuis l’origine du navigateur, donc locale au navigateur qui la crée.
- Sur la fiche produit, le bouton de retour est une destination explicite vers `/annonces` (catalogue public), jamais une action `history.back()`. `/annonces/mes-annonces` et son API vérifient la session et filtrent les données avec l’identifiant TopDeal de la session courante; le code d’affiliation ne contient pas d’identifiant de compte.
- L’ouverture d’un code actif affiche un seul prix final (prix de base + rémunération); un lien invalide/inactif revient au prix habituel avec une indication. Le code n’enregistre aucune attribution de commande et aucun revenu n’est crédité au clic ou au partage.
- Limite fonctionnelle confirmée : le parcours commande/remise n’est pas implémenté ici. L’enregistrement d’une attribution et le versement restent à faire dans cette future fonctionnalité, avec le contrôle d’auto-affiliation au moment de la commande.
- Vérifications de cette tranche : TypeScript Web et ESLint Web passent après intégration; `git diff --check` passe (avertissements de conversion LF/CRLF habituels). Aucun test automatisé ni test navigateur n’a été lancé. À confirmer manuellement : créer une annonce affiliable, créer le lien depuis un autre compte, ouvrir le lien dans le même navigateur local et vérifier le prix final; désactiver l’affiliation/le lien et vérifier le retour au prix courant.
- Retour après relecture de la maquette : options regroupées et remises dans l’ordre affiliation puis troc; prix final calculé dans le formulaire de création et d’édition; rémunération fixée à un montant entier minimum de 1 FCFA avec valeur initiale 5 000 FCFA. Le retour de la fiche utilise la destination publique `/annonces` et son libellé est désormais « Retour au catalogue ».
- Vérification après cet ajustement : `pnpm.cmd --filter @topdeal/web exec tsc --noEmit`, `pnpm.cmd --filter @topdeal/web lint` et `git diff --check` passent. L’accès au navigateur local n’était pas disponible pour un contrôle visuel. Le bouton de retour applicatif ne lit pas l’historique; la flèche Retour du navigateur reste contrôlée par le navigateur et peut reprendre la page d’où le lien a été ouvert. Les pages et API Mes annonces restent protégées par la session et filtrées par l’utilisateur connecté.

## Affichage invité — header et fiche affiliée

- Demande validée : masquer uniquement le bouton « Revendre » sur une fiche ouverte avec un paramètre `affiliation`; garder le retour vers le catalogue public inchangé. Le bouton reste masqué même si le code fourni est invalide.
- Le header de la marketplace différencie l’état de session : un invité voit « Connexion » et « Inscription » et ne voit pas les sections privées; un utilisateur avec cookie de session voit les accès privés.
- Le cookie sert uniquement à choisir les liens affichés. Les pages et API privées continuent de vérifier la session Firebase côté serveur et filtrent par l’utilisateur authentifié; l’affichage du header ne constitue pas une autorisation.
- Vérifications : typecheck Web, ESLint Web et `git diff --check` passent. Contrôle navigateur non effectué.
- Correction du flash au rechargement : le fallback du header n’affiche plus Connexion/Inscription pendant la lecture de la session; il réserve leur espace, puis le header approprié apparaît. Typecheck Web, ESLint Web et diff-check passent pour cette correction.

- Ajustement demandé ensuite : le lien Troc est retiré du header public commun; le filtre Troc du catalogue reste dans les contrôles de recherche.
- Validation de ce retrait : typecheck Web, ESLint Web et diff-check passent; aucun contrôle navigateur n’a été effectué.

- Modale du lien de revente rendue plus compacte : largeur maximale réduite à max-w-sm, espacement et padding resserrés, titre légèrement réduit.

- Cause trouvée pour la largeur inchangée : Tailwind ne scannait pas packages/features/affiliation; ses classes de largeur et d’espacement n’étaient donc pas produites. Le package est maintenant inclus dans les sources CSS de Web, et la modale compacte définie précédemment sera appliquée.

- Favoris : ajout d’un espacement supérieur mt-7 entre les contrôles de catégories/filtres et la grille des annonces (ainsi que l’état vide), aligné sur le catalogue.

## Audit performance et isolation — première optimisation

- La liste « Mes annonces » chargeait toutes les photos, la description et les données du formulaire d’édition pour chaque carte, puis signait toutes les URLs avant d’afficher la page. Une page de 20 annonces pouvait ainsi traiter jusqu’à 120 photos alors que les cartes n’en affichent qu’une.
- Optimisation réalisée : la requête de liste ne sélectionne maintenant que les champs de carte et la première photo; le Use Case ne signe que ces vignettes. Les détails et URLs complets d’édition sont chargés via le GET dédié seulement au besoin. Le préchargement démarre au focus/survol du bouton Modifier; une requête en cours est mutualisée et le résultat est gardé en mémoire pour éviter un second appel à l’ouverture.
- Isolation conservée : le GET d’édition vérifie la session, et le repository filtre simultanément par identifiant d’annonce et identifiant propriétaire issus de la session. Aucun identifiant utilisateur du client n’est accepté. Aucune migration ni donnée n’a été modifiée.
- Vérifications exécutées : TypeScript Web, ESLint Web et git diff --check passent. Contrôle navigateur et test multi-comptes non exécutés.
- À traiter ensuite : vérifier la concurrence sur la création des liens d’affiliation (le schéma n’a pas de contrainte composite empêchant plusieurs liens actifs pour la même annonce et le même apporteur); toute contrainte/migration nécessitera une validation explicite. Les plans de requêtes et tests de charge restent à mesurer avec un jeu représentatif, sans ajouter de données à la base locale actuelle.

## Unicité des liens d’affiliation — migration appliquée en local

- Autorisation explicite reçue pour appliquer la migration à la base locale `topdeal`.
- Le statut Prisma indiquait que seule `20261118162000_unique_active_affiliate_link` était en attente. Le contrôle SQL pré-migration n’a trouvé aucun groupe en doublon actif.
- Migration appliquée avec `prisma migrate deploy`; Prisma confirme ensuite que le schéma local est à jour. L’index partiel garantit un lien actif unique par couple affiliation/apporteur, tout en conservant les liens inactifs historiques.
- Le repository insère avec `skipDuplicates`, puis relit le code actif gagnant afin que les créations concurrentes convergent vers le même lien.
- Aucun test de concurrence ou contrôle navigateur n’a été exécuté. Les autres environnements doivent appliquer leurs migrations via `prisma migrate deploy` après leur propre contrôle pré-migration.

## Espacement de « Mes annonces »

- Ajout de la marge supérieure `mt-7` entre les contrôles/catégories et la grille, identique à la page Favoris; l’état vide garde le même espacement.
- Modifications limitées à la présentation d’Annonce. `git diff --check` passe; rendu responsive à confirmer dans le navigateur.
