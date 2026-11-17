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
