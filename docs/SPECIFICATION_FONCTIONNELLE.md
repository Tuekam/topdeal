# MARKETPLACE DE VENTE SÉCURISÉE - BAFOUSSAM
## SPÉCIFICATION FONCTIONNELLE
**Marketplace de vente sécurisée entre particuliers — Bafoussam, Cameroun**  
*Nov 11, 2026 · @tuekam*

| Élément | Valeur |
| :--- | :--- |
| **Version** | 1.2 — Consolidation fonctionnelle détaillée |
| **Date** | 11 novembre 2026 |
| **Périmètre initial** | Vente, troc et affiliation entre particuliers à Bafoussam |
| **Statut** | Document de travail — base de référence pour la conception |
| **Langue de lancement** | Français |

> *Les décisions explicitement prises dans les échanges récents prévalent sur les formulations antérieures lorsqu'elles se contredisent.*

### Historique et statut du document
Ce document rassemble l'analyse fonctionnelle initiale et les décisions prises pendant les échanges de cadrage, y compris les règles sur l'affiliation et le troc retenues le 6 novembre 2026. Il décrit les objectifs, les utilisateurs, les fonctionnalités, les règles métier, les parcours, les états principaux, les exceptions et les points qui nécessitent encore une décision.

| Statut | Signification |
| :--- | :--- |
| **VALIDÉ** | Décision clairement exprimée et retenue dans le cadrage. |
| **PROPOSITION À CONFIRMER** | Solution recommandée, mais qui n'a pas encore reçu une validation explicite. |
| **À DÉFINIR / À VÉRIFIER** | Point dépendant d'un choix métier, d'un prestataire, d'un avis juridique ou d'une précision ultérieure. |

> *Le présent document est une spécification fonctionnelle. Il ne constitue ni une architecture technique détaillée, ni un cahier des charges juridique, ni une garantie que le cadre réglementaire autorise toutes les opérations financières envisagées (voir la section 23).*

### Principaux changements depuis la v1.1
* Le troc est intégré au lancement : un article contre un article, avec soulte éventuelle (nouvelle section 12).
* L'affiliation est précisée : rémunération unique par produit, prix du lien non négociable, rémunération par exemplaire (section 11).
* Les favoris et la vérification d'identité manuelle avec badge bleu font partie du lancement.
* Les paiements sont confirmés et les transferts effectués manuellement par l'administrateur, depuis des comptes MTN Mobile Money et Orange Money dédiés à la plateforme. Aucun agrégateur ni API de paiement au lancement.
* Il n'y a plus de portefeuille virtuel : la section « Soldes et retraits » devient « Versements et frais de transfert », avec un versement par commande et par bénéficiaire.
* Les frais de transfert sont supportés par les utilisateurs bénéficiaires.
* Aucun délai de paiement n'est appliqué à une commande.
* Le tableau des lots est supprimé. Les éléments non retenus sont listés dans la section 22.
* Les fonds en attente de remise sont désignés par l'expression « fonds gelés », jamais par « séquestre ».

---

## Sommaire
1. Présentation et objectifs
2. Périmètre fonctionnel
3. Acteurs, comptes et permissions
4. Navigation et expérience générale
5. Annonces, produits et stock
6. Recherche, filtres et favoris
7. Messagerie et négociation
8. Demandes de paiement, commandes et réservation
9. Paiements Mobile Money
10. Remise du produit et code de confirmation
11. Affiliation
12. Troc
13. Versements et frais de transfert
14. Annulations et remboursements
15. Litiges et support
16. Évaluations et avis
17. Notifications
18. Back-office et administration
19. Journal financier, sécurité et traçabilité
20. Parcours fonctionnels de bout en bout
21. Règles de gestion transversales et cas d'erreur
22. Éléments exclus
23. Points à confirmer avant développement / lancement
24. Conditions minimales de lancement
25. Glossaire

---

## 1. Présentation et objectifs

La plateforme TopDeal a pour objectif de faciliter et de sécuriser les achats, les ventes et les échanges entre particuliers à Bafoussam, au Cameroun. Elle apporte un cadre plus structuré aux transactions qui se déroulent habituellement par réseaux sociaux ou messageries : annonces identifiables, discussion entre les parties, accord préalable sur les conditions, paiement traçable, remise du produit et suivi des fonds.

### 1.1 Objectifs métier
* Permettre à un utilisateur de publier et gérer des annonces de produits neufs ou d'occasion.
* Permettre aux acheteurs de rechercher des produits et de contacter les vendeurs.
* Permettre aux parties de négocier et de convenir du prix, du lieu et de l'heure de remise avant tout paiement.
* Encadrer le paiement Mobile Money et suivre son statut réel.
* Confirmer la remise du produit au moyen d'un code communiqué par l'acheteur.
* Garder les fonds gelés jusqu'à la confirmation de la remise ou à la résolution d'un incident.
* Permettre l'échange d'un article contre un autre (troc), avec une soulte éventuelle.
* Permettre à un utilisateur de recommander un produit par un lien et de recevoir une rémunération si la vente aboutit.
* Permettre aux bénéficiaires de recevoir leurs versements par Mobile Money.
* Permettre à l'administration de traiter les vérifications, signalements, paiements, versements, remboursements et litiges.

### 1.2 Principes structurants
* Un seul compte utilisateur peut acheter et vendre.
* Les utilisateurs doivent avoir au moins 18 ans.
* La plateforme démarre à Bafoussam et en français.
* La remise est effectuée en main propre au lancement.
* La commission de la plateforme est de 0 % au lancement.
* Les accords commerciaux précèdent le paiement : le prix, le lieu et l'horaire doivent être convenus.
* Une commande non payée ne réserve pas automatiquement le stock.
* Le stock est attribué selon le paiement confirmé et correctement associé à la commande.
* Au lancement, l'administrateur confirme les paiements et effectue les transferts manuellement, depuis des comptes MTN Mobile Money et Orange Money dédiés à la plateforme. Ces comptes ne servent qu'aux transactions de la plateforme.
* Les fonds payés par l'acheteur restent gelés tant que la remise n'est pas validée. Ils ne sont versés qu'après validation de la remise et contrôles applicables.
* Les frais de transfert sont supportés par les utilisateurs bénéficiaires.

---

## 2. Périmètre fonctionnel

Le périmètre n'est plus découpé en lots. Ce document décrit l'ensemble des fonctionnalités retenues pour la plateforme. Les éléments non retenus sont listés dans la section 22.

Le périmètre comprend : comptes et profils, avec vérification d'identité manuelle et badge bleu ; annonces, catégories, recherche et favoris ; messagerie et négociation ; demandes de paiement et commandes ; paiement Mobile Money confirmé manuellement par l'administrateur ; code de remise du produit ; troc, avec soulte éventuelle ; affiliation ; versements aux bénéficiaires et remboursements totaux, exécutés manuellement par l'administrateur ; support et litiges traités manuellement ; notifications ; back-office, journal d'audit, journal financier et rapprochement.

La demande de vérification d'identité et l'attribution manuelle du badge bleu sont prévues dès le lancement. Le détail des pièces et du traitement reste à préciser (section 3.3).

---

## 3. Acteurs, comptes et permissions

| Acteur | Responsabilités principales |
| :--- | :--- |
| **Utilisateur (acheteur/vendeur)** | Créer son compte ; publier et gérer des annonces ; rechercher ; discuter ; négocier ; acheter ; vendre ; échanger un article (troc) ; payer ; remettre ou récupérer un produit ; recevoir ses versements ; demander la vérification de son identité ; contacter le support. |
| **Apporteur d'affaires** | Partager un lien affilié et être identifié sur une commande issue de ce lien. Il ne gère ni le stock ni la remise du produit. |
| **Administrateur** | Gérer les utilisateurs, annonces, catégories, demandes de vérification, signalements, commandes, trocs, paiements, versements, remboursements, litiges et journaux. Confirmer les paiements et effectuer les transferts manuellement. |
| **Opérateurs Mobile Money** | Réseaux MTN Mobile Money et Orange Money. Les comptes de la plateforme utilisés pour recevoir les paiements et effectuer les transferts leur sont dédiés. |

### 3.1 Création de compte et profil
* Les méthodes retenues sont Google en priorité, puis e-mail et mot de passe. L'authentification par téléphone et mot de passe n'est pas retenue.
* Le profil contient au minimum le prénom, le nom et le numéro de téléphone.
* Le numéro de téléphone est unique par compte.
* Une adresse e-mail vérifiée ne peut appartenir qu'à un seul compte TopDeal, toutes méthodes d'authentification confondues.
* Une identité Google ne peut être liée à un compte existant qu'après authentification à ce compte et confirmation explicite de la liaison ; une adresse e-mail identique ne suffit pas.
* L'adresse e-mail doit être vérifiée avant tout accès au compte. Son statut est contrôlé côté serveur auprès d'une source fiable.
* Un compte permet à la même personne d'acheter et de vendre ; aucun compte vendeur distinct n'est requis.
* L'âge minimum d'utilisation est fixé à 18 ans ; la date de naissance est demandée à l'inscription.
* Un nouvel utilisateur Google doit compléter les champs obligatoires du profil avant tout accès au compte.
* Firebase Authentication est la solution technique actuelle ; son SDK reste derrière une abstraction et ne modifie pas les règles métier.

### 3.2 Modification, récupération et suspension
L'utilisateur peut modifier ses informations de profil. Les changements touchant aux coordonnées de connexion ou de versement doivent faire l'objet de contrôles adaptés. En cas de perte d'accès au téléphone ou à l'e-mail, l'utilisateur doit pouvoir solliciter le support. La récupération ne doit pas permettre une prise de contrôle du compte sur la seule base d'une information facilement accessible.

L'administrateur peut suspendre ou réactiver un compte. La suspension empêche l'utilisation normale selon une politique à préciser, mais ne supprime jamais l'historique des commandes, paiements, remboursements, versements et écritures financières.
La suppression physique du compte n'est pas retenue. Les durées de conservation et une éventuelle anonymisation devront être définies.

3.3 Vérification d'identité et badge bleu

Un utilisateur peut soumettre une demande de vérification d'identité. L'administrateur examine les informations et accepte ou refuse la demande. En cas d'approbation, le compte reçoit un badge bleu « Vérifié ». Le badge se déduit uniquement du résultat de la vérification : une demande est en attente, vérifiée ou refusée, et un refus est accompagné d'un motif.
PROPOSITION À CONFIRMER : les pièces demandées sont le recto et le verso d'une pièce d'identité et un selfie. Les modalités de stockage, l'accès aux pièces et leur durée de conservation restent à définir. Ces pièces sont privées : seules les personnes habilitées de l'administration y ont accès.

3.4 Permissions administratives

Même si une seule personne administre initialement la plateforme, les permissions doivent être distinguées fonctionnellement : modération des annonces, vérification d'identité, confirmation des paiements, exécution des versements, approbation des remboursements, décision sur les litiges et consultation financière. Toute opération sensible doit être traçable.

4. Navigation et expérience générale

La navigation doit rester simple et centrée sur la vente et l'échange. La structure retenue comprend :

Espace	Contenu
Accueil	Fil d'annonces, recherche, catégories et filtres.
Vendre	Création, modification, masquage et suivi des annonces.
Troc	Annonces acceptant le troc, propositions d'échange et suivi des trocs.
Favoris	Annonces enregistrées par l'utilisateur.
Messages	Conversations entre acheteurs et vendeurs, négociations et échanges liés aux annonces.
Profil	Informations personnelles, vérification d'identité, annonces, commandes, trocs, versements reçus, liens affiliés et support.
Back-office	Interface distincte réservée à l'administration.

Les annonces, conversations, commandes et opérations financières doivent être clairement séparées dans l'interface. Aucune interface ni notification ne doit annoncer un paiement, un remboursement ou un versement comme terminé tant que le statut n'est pas confirmé. Les fonds en attente de remise sont présentés comme des « fonds gelés ».

5. Annonces, produits et stock


5.1 Modèle d'annonce

Une annonce représente un seul type de produit. Elle n'est pas un panier ni un regroupement de produits différents. Plusieurs exemplaires strictement identiques peuvent être regroupés dans une annonce au moyen d'une quantité.

Champ	Description / règle
Titre	Nom compréhensible du produit.
Description	Informations utiles sur l'état, l'utilisation, les défauts éventuels et les caractéristiques.
Catégorie / sous-catégorie	Classement du produit dans l'arborescence administrée.
État	Choix obligatoire : Neuf ou Occasion.
Prix	Prix de base fixé par le propriétaire, en FCFA.
Quantité	Nombre d'exemplaires identiques réellement disponibles ; doit être positif à la publication.
Troc accepté	Case indiquant que le vendeur accepte d'échanger ce produit contre un autre (section 12).
Photos	Images du produit conservées par la plateforme.
Localisation	Quartier ou secteur renseigné par le vendeur ; ville Bafoussam au lancement.
Marque / modèle / caractéristiques	Champs adaptés à la catégorie lorsque cela apporte une réelle utilité.

PROPOSITION À CONFIRMER : exiger au moins une photo exploitable, sans imposer de champs techniques inutiles. Le nombre exact de photos (minimum et maximum) reste à confirmer ; la version initiale envisageait de deux à six photos.

5.2 Cycle de vie d'une annonce


Dimension	États
Visibilité	Publiée ; Masquée par le vendeur ; Suspendue par l'administration.
Disponibilité commerciale	Disponible ; Indisponible ; Épuisée lorsque la quantité atteint zéro.

La visibilité et la disponibilité sont deux notions distinctes. Une annonce peut être publiée mais indisponible. Une annonce masquée n'est pas visible dans les résultats publics, sans que cela efface les commandes ou preuves déjà existantes.
VALIDÉ : une annonce n'expire pas automatiquement.

5.3 Modification de l'annonce

Le vendeur peut modifier le prix et la quantité. Une modification ne doit pas altérer les conditions déjà enregistrées dans une commande engagée. Le système doit empêcher une modification incohérente avec des paiements en cours ou des unités déjà attribuées. Les règles exactes de verrouillage des champs pendant une transaction sont à préciser.

5.4 Gestion du stock

• Le stock correspond à la quantité réelle d'exemplaires identiques que le vendeur peut remettre.
• Une demande de paiement ou une commande non payée ne réserve pas le stock.
• Le produit reste disponible aux autres acheteurs tant qu'aucun paiement n'a été confirmé et affecté à une unité.
• Le stock doit être décrémenté de manière atomique lors de l'affectation d'un paiement confirmé, afin d'éviter la vente de la même unité à plusieurs acheteurs.
• Lorsque le stock atteint zéro, l'annonce devient indisponible ou épuisée.
• Les commandes non payées devenues impossibles à satisfaire doivent être annulées et leurs acheteurs informés.
• Un paiement dont le statut est PENDING ou UNKNOWN ne doit pas être traité comme un échec : son statut doit être vérifié avant toute décision.

6. Recherche, filtres et favoris

L'acheteur doit pouvoir parcourir les annonces et retrouver un produit sans connaître son vendeur.

6.1 Recherche et filtres

• Recherche textuelle sur le titre et, lorsque pertinent, la description.
• Filtrage par catégorie et sous-catégorie.
• Filtrage par état : neuf ou occasion.
• Filtrage par fourchette de prix.
• Filtrage par secteur/quartier lorsque la donnée est renseignée.
• Filtrage des annonces acceptant le troc.
• Tri et ordre d'affichage à préciser lors de la conception de l'expérience.

6.2 Favoris

VALIDÉ : les favoris font partie du lancement. L'utilisateur peut ajouter ou retirer une annonce de ses favoris et retrouver sa liste depuis son profil. Si une annonce devient indisponible, masquée ou supprimée de l'affichage public, son état doit être reflété dans la liste des favoris.

7. Messagerie et négociation


7.1 Ouverture d'une conversation

L'acheteur peut démarrer une conversation à partir d'une annonce. Une conversation est liée à un vendeur et à un acheteur et doit permettre de comprendre à quel produit se rapporte chaque échange. Le fonctionnement visé est une conversation consolidée entre un acheteur et un vendeur, avec identification de l'annonce concernée sur chaque message ou proposition. Plusieurs conversations peuvent exister autour d'une même annonce.

7.2 Fonctions de messagerie au lancement

• Messages textuels uniquement.
• Indication de lecture des messages.
• Pas de modification ni de suppression des messages au lancement.
• Possibilité de signaler une conversation. Un signalement ne bloque pas automatiquement la conversation.
• Les administrateurs peuvent consulter le contenu d'une conversation dans le cadre du support ou du traitement d'un litige, selon une politique de confidentialité à définir.

7.3 Négociation et accord préalable

Les parties discutent du prix et des modalités de remise. Une proposition indique le prix proposé, le lieu et l'heure de remise ; elle est en attente, acceptée, refusée ou annulée. Avant le paiement, les parties doivent s'être mises d'accord sur :
• le prix final accepté ;
• le lieu de rencontre ou d'échange ;
• la date et l'heure de remise ;
• la disponibilité effective du produit.
Le vendeur confirme la disponibilité et les conditions convenues. La commande créée doit conserver les conditions exactes acceptées afin qu'une modification ultérieure de l'annonce ne change pas l'accord déjà conclu.
Le prix affiché via un lien d'affiliation n'est pas négociable (section 11). Le lieu et l'heure de remise restent négociables.
Principe validé : on se met d'accord d'abord, on paie ensuite.

8. Demandes de paiement, commandes et réservation


8.1 Distinction des objets métier


Objet	Rôle
Demande de paiement	Proposition du vendeur indiquant le montant demandé à l'acheteur après discussion.
Commande	Enregistrement de l'accord commercial entre acheteur et vendeur, comprenant produit, quantité, prix et modalités de remise.
Paiement	Opération financière réelle initiée par l'acheteur et confirmée par l'administrateur.
Versement	Transfert effectué par l'administrateur à un bénéficiaire (vendeur ou apporteur) après validation de la remise.


8.2 Demande de paiement

Le vendeur peut envoyer une demande de paiement après négociation. Le montant peut différer du prix affiché sur l'annonce si les parties ont convenu d'un autre prix. L'acheteur peut accepter ou refuser la demande. Le vendeur peut annuler la demande avant son acceptation.
VALIDÉ : aucune expiration automatique de la demande de paiement. La demande reste en attente tant qu'elle n'est pas traitée par les parties. Une demande de paiement ne réserve pas le stock.

8.3 Création et confirmation de la commande

La commande n'est créée pour paiement qu'après confirmation de la disponibilité par le vendeur et accord des deux parties sur le prix, le lieu et l'horaire de remise. L'acheteur ne doit pas être invité à payer avant que ces éléments soient convenus.
1. L'acheteur manifeste son intérêt et contacte le vendeur.
2. Les parties discutent du prix, du lieu et de l'horaire.
3. Le vendeur confirme que le produit est toujours disponible et accepte les conditions.
4. La plateforme enregistre la commande avec le prix, la quantité et les conditions convenus.
5. L'acheteur peut alors procéder au paiement.

8.4 Commande non payée et priorité de stock

VALIDÉ : une commande créée mais non payée ne réserve pas le stock. Le principe est « premier paiement confirmé, première unité attribuée ». La date de création de la commande ou de la demande ne donne pas de priorité sur le stock.
Exemple : un acheteur A dispose d'une commande et prévoit de payer dans quatre jours. Un acheteur B peut négocier et payer immédiatement. Si le paiement de B est confirmé et affecté au dernier exemplaire avant celui de A, l'unité revient à B. Si le paiement de A est déjà en cours et que son statut est inconnu, le système doit interroger les enregistrements de paiement avant de conclure à un échec. Si le paiement de A est confirmé tardivement après attribution du dernier exemplaire à B, il s'agit d'une anomalie à traiter : alerte administrative et résolution financière, notamment remboursement si la commande ne peut pas être honorée. Le système ne doit jamais créer de survente.

8.5 Délai de paiement de la commande

PROPOSITION À CONFIRMER : aucun délai de paiement n'est appliqué à une commande. Sans réservation ni expiration, un délai n'a plus de raison d'être.

8.6 Annulation avant paiement

Avant paiement, l'acheteur ou le vendeur peut demander l'annulation de la commande. L'annulation est immédiate et ne nécessite pas d'intervention administrative. Elle ne constitue pas un remboursement puisqu'aucun paiement n'a été effectué.

8.7 États fonctionnels


Objet	États ou transitions
Demande de paiement	En attente ; acceptée ; refusée ; annulée. Pas d'expiration automatique validée.
Commande	Créée ; en attente de paiement ; payée ; code validé ; terminée ; annulée ; remboursée ; en litige.
Commande paiement incertain	Reste en attente de paiement tant que l'administrateur n'a pas confirmé le succès ou l'échec du paiement.


9. Paiements Mobile Money


9.1 Moyens et fonctionnement au lancement

VALIDÉ : les moyens de paiement sont MTN Mobile Money et Orange Money. Au lancement, il n'y a ni agrégateur ni API de paiement. Les paiements sont reçus sur des comptes MTN Mobile Money et Orange Money dédiés à la plateforme, qui ne servent qu'aux transactions de la plateforme. L'administrateur confirme chaque paiement manuellement à partir de l'historique du compte.
Un agrégateur de paiement pourra être ajouté plus tard. Les règles métier de ce document ne changeraient pas : seule la manière de confirmer les paiements et d'exécuter les transferts changerait.

9.2 Parcours de paiement manuel

PROPOSITION À CONFIRMER :
1. La plateforme affiche le montant exact, le numéro du compte de la plateforme (MTN ou Orange, au choix de l'acheteur) et une référence unique liée à la commande.
2. L'acheteur effectue le transfert depuis son téléphone.
3. L'acheteur indique avoir payé et saisit la référence de la transaction reçue de l'opérateur.
4. L'administrateur rapproche cette référence de l'historique du compte et confirme le paiement.
5. La plateforme n'indique le paiement comme confirmé qu'après cette confirmation.
La plateforme ne demande ni ne conserve jamais le code PIN Mobile Money de l'utilisateur.

9.3 Principes de traitement

• Chaque paiement est associé à une commande, à un montant exact, à une devise et à une référence unique.
• Le paiement n'est considéré comme réussi qu'après confirmation de l'administrateur.
• Un statut PENDING ou UNKNOWN ne signifie ni succès ni échec.
• Une même référence de transaction ne peut confirmer qu'un seul paiement.
• Le traitement d'une même confirmation plusieurs fois ne doit jamais produire plusieurs débits métier, affectations de stock ou crédits.
• Un paiement confirmé comme réussi ne doit pas être remplacé ultérieurement par un statut d'échec sans procédure de correction tracée.
• Un remboursement est une opération distincte du paiement initial.

9.4 États de paiement


État	Signification et comportement
INITIATED	La demande de paiement a été créée et les instructions de paiement sont affichées.
PENDING	L'acheteur a signalé son paiement ; l'administrateur n'a pas encore donné de résultat final.
SUCCEEDED	L'administrateur a confirmé la réception ; les effets métier peuvent être appliqués une seule fois.
FAILED	L'administrateur a constaté l'échec.
CANCELLED	La tentative a été annulée.
EXPIRED	La règle validée a mis fin à la tentative.
UNKNOWN	Le résultat ne peut pas être déterminé à cet instant ; une vérification est nécessaire.


10. Remise du produit et code de confirmation

VALIDÉ : le code de remise sert uniquement à un paiement. Il n'existe pas de code pour une opération sans paiement.

10.1 Déroulement normal

1. Après confirmation du paiement par l'administrateur, la plateforme génère un code unique associé à la commande.
2. Le code est visible uniquement par l'acheteur ; le vendeur ne doit pas pouvoir le consulter.
3. L'acheteur et le vendeur se rencontrent au lieu et à l'heure convenus.
4. L'acheteur inspecte le produit avant de confirmer qu'il le récupère.
5. Si l'acheteur accepte le produit, il communique le code au vendeur.
6. Le vendeur saisit le code dans l'application.
7. Le serveur vérifie que le code correspond à la commande, qu'il est valide, non utilisé et que la commande est éligible.
8. Après validation, la remise est enregistrée et la commande passe à l'état « code validé ». Les versements dus au vendeur et, le cas échéant, à l'apporteur d'affaires sont créés en même temps. L'administrateur les exécute après vérification qu'aucun litige n'est ouvert (section 13).

10.2 Protection du code

Le code est à usage unique et ne doit pas être visible côté vendeur avant sa communication par l'acheteur. Il n'est pas conservé en clair. Trois tentatives incorrectes sont prévues ; après trois erreurs, la validation est bloquée et le vendeur doit contacter l'administration. Les fonds restent gelés tant que la situation n'est pas résolue. Un code est actif, utilisé ou bloqué.

10.3 Acheteur ne communiquant pas le code

PROPOSITION À CONFIRMER : le vendeur pourrait disposer d'une action « Signaler la remise effectuée ». L'acheteur aurait ensuite 48 heures pour contester. En l'absence de réponse, le dossier serait transmis à l'administration ; le silence ne déclencherait automatiquement ni versement des fonds ni remboursement.

10.4 Validité du code

À DÉFINIR : durée de validité du code, renouvellement, perte du code, erreur de saisie répétée et procédure de remise vérifiée manuellement.

11. Affiliation

Le système d'affiliation permet à un utilisateur de recommander le produit d'un propriétaire et de percevoir une rémunération si l'acheteur passe effectivement commande à travers le lien affilié. L'apporteur n'est ni propriétaire du produit ni gestionnaire du stock.

11.1 Activation par le propriétaire

VALIDÉ :
• Le propriétaire peut activer ou désactiver l'affiliation sur une annonce.
• Lors de l'activation, il définit une rémunération fixe unique pour ce produit, exprimée en FCFA par exemplaire vendu.
• Cette rémunération est identique pour tous les apporteurs d'affaires de ce produit.
• Le prix de base du propriétaire reste inchangé dans l'annonce originale.

11.2 Lien et prix présenté à l'acheteur

Chaque lien permet d'identifier l'apporteur. Lorsque le client ouvre le lien affilié, le prix affiché est le prix de base du propriétaire augmenté de la rémunération de l'affilié. Le prix final est présenté comme un prix unique ; la répartition interne n'est pas exposée au client. Ce prix est fixe et n'est pas négociable via le lien.

Composante	Exemple
Prix fixé par le propriétaire	50 000 FCFA
Rémunération de l'apporteur	5 000 FCFA
Prix final affiché au client	55 000 FCFA


11.3 Commande et attribution

L'acheteur peut contacter directement le propriétaire depuis la page ouverte via le lien. Le prix reste celui du lien ; le lieu et l'heure de remise se conviennent avec le propriétaire.
• Le propriétaire confirme la disponibilité et les conditions de remise avant paiement.
• La commande conserve l'identifiant de l'apporteur, le prix de base et la rémunération applicables au moment de l'engagement.
• L'attribution est effectuée uniquement si l'acheteur passe effectivement commande via le lien affilié. Une commande a au plus un apporteur.
• Si l'acheteur revient plus tard directement sur la plateforme et commande sans utiliser le lien, aucune rémunération d'affiliation n'est attribuée.
• La rémunération est due par exemplaire : pour une commande de plusieurs exemplaires, elle est multipliée par la quantité.
• L'apporteur ne gère ni la commande, ni le stock, ni la livraison ou remise.

11.4 Auto-affiliation et annulation

VALIDÉ : l'auto-affiliation est interdite. Un utilisateur ne peut pas être l'apporteur d'un produit dont il est propriétaire, ni percevoir une rémunération sur sa propre commande.
VALIDÉ : si la vente est annulée ou remboursée, l'apporteur ne reçoit rien. Un remboursement est toujours total, il annule donc toujours la rémunération.

11.5 Répartition financière

Après paiement confirmé et validation de la remise par le code, les fonds sont répartis entre le propriétaire et l'apporteur en même temps : le propriétaire reçoit son prix de base et l'apporteur reçoit la rémunération définie. Deux versements distincts sont créés (section 13). La commission de la plateforme reste à 0 % au lancement. Les frais de transfert sont supportés par chaque bénéficiaire.
La rémunération est en attente jusqu'à la validation de la remise, puis acquise, puis versée. Elle est annulée si la vente est annulée ou remboursée.

11.6 Modification et désactivation

Si le propriétaire modifie son prix de base ou la rémunération, les liens existants affichent les nouvelles conditions pour les nouvelles commandes. Les commandes déjà engagées conservent les conditions initiales. La désactivation empêche les nouvelles commandes affiliées mais ne modifie pas les commandes déjà engagées.

12. Troc

Le troc permet à deux utilisateurs d'échanger un article contre un autre, avec une soulte éventuelle. Il fait partie du périmètre du lancement.

12.1 Principes

VALIDÉ : le troc suit le même parcours que la vente. On se met d'accord d'abord (les deux produits, le lieu, l'horaire et l'éventuelle soulte), puis on échange.
• Le troc porte sur un article contre un article seulement. Cette règle est retenue par défaut (PROPOSITION À CONFIRMER).
• Un article est proposé au troc lorsque son annonce porte la mention « Troc accepté » (section 5.1).
• La liste de souhaits n'est pas retenue pour le lancement.
• Les deux parties sont désignées partie A et partie B. Chacune est propriétaire d'un des deux articles.

12.2 Troc sans soulte

VALIDÉ : sans soulte, il n'y a ni paiement ni code de remise. Chaque partie confirme avoir reçu l'article de l'autre.

12.3 Troc avec soulte

VALIDÉ : la soulte est payée comme une vente, avec un code de remise pour ce paiement seulement.
1. Les parties conviennent des deux articles, de la soulte, de la partie qui la paie, du lieu et de l'horaire.
2. La plateforme enregistre l'accord et crée la commande correspondant à la soulte, avec sa demande de paiement.
3. La partie qui doit la soulte la paie selon le parcours de la section 9. L'administrateur confirme le paiement.
4. La plateforme génère le code de remise lié à ce paiement, visible uniquement par la partie qui a payé.
5. Au moment de l'échange, la partie qui a payé communique le code à l'autre partie, qui le saisit.
6. Après validation du code, la soulte est versée à la partie qui la reçoit (section 13).

12.4 Fin du troc et désaccord

VALIDÉ : un troc ne se termine que lorsque les deux parties ont confirmé la réception de l'article de l'autre. S'il manque une confirmation, l'administrateur tranche. Le silence d'une partie ne vaut pas confirmation (section 21.3). Un litige peut être ouvert sur un troc, qu'il y ait ou non une soulte (section 15).

12.5 États d'un troc


État	Signification
Proposé	Une partie a proposé l'échange ; l'autre n'a pas répondu.
Accepté	Les deux parties sont d'accord sur les articles, le lieu, l'horaire et la soulte éventuelle.
Soulte en attente	La soulte n'est pas encore payée ou confirmée par l'administrateur.
En cours	L'échange peut avoir lieu.
Confirmé	Les deux parties ont confirmé la réception. Le troc est terminé.
En litige	Le troc fait l'objet d'un litige ou d'une décision de l'administrateur.
Annulé	Le troc a été annulé avant l'échange.


13. Versements et frais de transfert

Cette section remplace la section « Soldes et retraits » de la v1.1. Il n'y a pas de portefeuille virtuel : chaque commande produit un versement par bénéficiaire. Les fonds payés par l'acheteur restent gelés jusqu'à la validation de la remise.

13.1 Principes

VALIDÉ : pas de portefeuille ni de retrait demandé par l'utilisateur. L'utilisateur consulte la liste de ses versements et leur statut.
• Un versement est créé par commande et par bénéficiaire : le vendeur et, le cas échéant, l'apporteur d'affaires. Pour un troc avec soulte, le bénéficiaire est la partie qui reçoit la soulte.
• Les versements sont créés lorsque le code de remise est validé. Les montants viennent de la commande : prix du produit pour le vendeur, rémunération pour l'apporteur, soulte pour le troc.
• VALIDÉ : l'administrateur exécute chaque transfert manuellement, depuis le compte MTN Mobile Money ou Orange Money dédié à la plateforme, vers le numéro Mobile Money du bénéficiaire. Il n'y a pas d'API de transfert.
• Le bénéficiaire renseigne le numéro Mobile Money de destination et le nom du titulaire.
• VALIDÉ : les frais de transfert sont supportés par les utilisateurs bénéficiaires. Le montant exact et son affichage restent à confirmer.
• Aucun montant minimum n'est retenu.
• La commission de la plateforme est de 0 % au lancement.
• Un litige ouvert avant l'exécution bloque les versements concernés. Le système empêche qu'un même versement soit transféré deux fois.
PROPOSITION À CONFIRMER : après validation du code, l'administrateur vérifie systématiquement l'absence de litige avant d'exécuter le transfert. Le versement n'est pas exécuté automatiquement.

13.2 Traitement et incidents

Un versement n'est considéré comme payé qu'après exécution du transfert par l'administrateur et enregistrement de la référence de transfert. Si le résultat est incertain, l'administrateur vérifie le transfert dans l'historique du compte avant toute nouvelle tentative. Une correction ne doit jamais être effectuée par modification directe d'un montant : elle doit passer par une écriture financière traçable.

13.3 États d'un versement


État	Signification
NOT_READY	La remise n'est pas validée ; les fonds restent gelés.
AWAITING_ADMIN_DECISION	Le code est validé ; l'administrateur vérifie qu'aucun litige ne bloque le versement.
APPROVED	L'administrateur a autorisé le transfert.
SUBMITTED	Le transfert a été effectué depuis le compte de la plateforme ; sa confirmation finale n'est pas encore enregistrée.
SUCCEEDED	Le transfert est confirmé et sa référence est enregistrée.
FAILED	L'échec du transfert est constaté.
UNKNOWN	Le résultat ne peut pas être déterminé ; une vérification est nécessaire avant toute nouvelle tentative.


14. Annulations et remboursements


14.1 Annulation


Moment	Règle
Avant paiement	L'acheteur ou le vendeur peut demander l'annulation ; traitement immédiat.
Après paiement	L'annulation nécessite une revue administrative ; les fonds restent gelés tant que la décision n'est pas prise.
Après validation du code	Pas d'annulation automatique ; le dossier relève du support ou d'un litige.

L'annulation et le remboursement sont deux opérations distinctes. Une commande annulée après paiement peut nécessiter un remboursement, mais le remboursement doit être autorisé et exécuté séparément. Lorsqu'une commande est annulée avant la remise, l'unité attribuée redevient disponible.

14.2 Remboursements

• VALIDÉ : seuls les remboursements totaux sont prévus ; pas de remboursement partiel.
• VALIDÉ : l'administrateur doit approuver le remboursement. L'administrateur exécute le remboursement manuellement, par un transfert depuis le compte de la plateforme vers le numéro Mobile Money de l'acheteur.
• Le remboursement n'est marqué comme terminé qu'après exécution du transfert et enregistrement de sa référence.
• PROPOSITION À CONFIRMER : les frais de transfert sont supportés par l'utilisateur qui reçoit le remboursement, comme pour les versements.
• Un remboursement échoué ou incertain reste une somme due à l'acheteur et doit être suivi jusqu'à résolution. Un remboursement annule la rémunération d'affiliation de la commande (section 11.4).

14.3 États d'un remboursement


État	Signification
REQUESTED	Le remboursement a été demandé ou proposé.
UNDER_REVIEW	L'administrateur examine le dossier.
APPROVED	L'administrateur a approuvé le remboursement total.
REJECTED	L'administrateur a refusé le remboursement.
EXECUTED	Le transfert est effectué et sa référence est enregistrée.


15. Litiges et support

Les deux parties peuvent contacter le support ou ouvrir un litige lorsqu'un problème survient : produit non conforme, produit non remis, désaccord sur la remise, code non communiqué, paiement, versement ou remboursement incertain, troc incomplet.

15.1 Traitement au lancement

VALIDÉ : le traitement des litiges est manuel par l'administration.
• L'ouverture d'un litige avant l'exécution des versements bloque les versements concernés.
• L'administrateur examine les informations, la commande, le paiement, les échanges pertinents et les éléments fournis.
• Selon le dossier, l'administrateur peut maintenir les fonds gelés, autoriser un remboursement total ou exécuter les versements.
• Pour un troc, l'administrateur peut confirmer l'échange, l'annuler ou, s'il y a une soulte, décider du sort des fonds.
VALIDÉ : aucun transfert ni remboursement ne doit être déclenché uniquement parce qu'une partie ne répond pas.

15.2 Dossier de litige

Le dossier doit permettre d'identifier la commande ou le troc, les parties, les montants, les dates, les événements de paiement, le statut du code, les échanges pertinents et la décision administrative. Les délais de réponse du support et les preuves acceptées restent à définir.

Objet	États
Litige	Ouvert ; en examen ; tranché ; clos.
Ticket de support	Ouvert ; en cours ; résolu ; fermé.


16. Évaluations et avis

Les évaluations et avis ne font pas partie du lancement. Lorsqu'ils seront étudiés, ils ne devront être possibles que dans le contexte d'une transaction réelle et terminée, afin d'éviter les avis artificiels.
À DÉFINIR : note numérique ou commentaire, délai de publication, possibilité de réponse, modération et traitement des avis abusifs. Ces détails ne sont pas présentés comme validés.

17. Notifications

La plateforme doit notifier les utilisateurs des événements qui nécessitent une action ou les informent de l'évolution d'une opération.

Événement	Destinataire(s)
Nouveau message	Utilisateur destinataire.
Demande de paiement reçue	Acheteur.
Demande acceptée, refusée ou annulée	Parties concernées.
Proposition de troc reçue, acceptée, refusée ou annulée	Parties du troc.
Commande confirmée / conditions enregistrées	Acheteur et vendeur.
Paiement signalé, en attente, confirmé ou échoué	Acheteur et vendeur selon pertinence.
Produit payé / code disponible	Acheteur ; le vendeur ne reçoit pas le code.
Code validé / remise enregistrée	Acheteur et vendeur.
Troc confirmé par une partie ou terminé	Parties du troc.
Commande annulée	Parties concernées.
Versement créé, effectué ou échoué	Bénéficiaire.
Remboursement décidé ou exécuté	Acheteur.
Rémunération d'affiliation acquise ou annulée	Apporteur d'affaires.
Demande de vérification examinée	Utilisateur demandeur.
Signalement ou litige mis à jour	Parties concernées selon confidentialité.

Les notifications ne doivent pas divulguer le code de remise au vendeur, ni exposer des données personnelles ou financières inutiles. Les notifications sont internes à l'application au lancement. Le SMS n'est pas retenu ; l'e-mail et la notification push restent à définir, avec leurs coûts.

18. Back-office et administration


18.1 Modules d'administration

• Tableau de bord des activités et anomalies.
• Gestion et suspension des comptes.
• Examen des demandes de vérification d'identité.
• Gestion des catégories et sous-catégories.
• Modération des annonces et traitement des signalements.
• Consultation encadrée des conversations en cas de support ou litige.
• Suivi des commandes, des trocs et de leurs états.
• Confirmation des paiements par rapprochement avec l'historique des comptes MTN Mobile Money et Orange Money de la plateforme.
• Exécution et suivi des versements et des remboursements, avec enregistrement des références de transfert.
• Traitement des litiges et décisions de libération ou de maintien des fonds gelés.
• Suivi des liens d'affiliation et des rémunérations.
• Consultation du journal d'audit et du rapprochement financier.

18.2 Actions sensibles

Toute action administrative ayant un effet sur un compte, une commande, un troc, un paiement, un remboursement ou un versement doit être journalisée avec l'identité de l'administrateur, la date, l'objet, l'action et le motif.
L'administrateur ne doit pas modifier directement un montant. Toute correction doit être matérialisée par une écriture comptable ou opération financière corrective, liée à une justification.

19. Journal financier, sécurité et traçabilité


19.1 Traçabilité financière

Chaque paiement, remboursement, versement, répartition d'affiliation et correction doit être représenté par des écritures traçables dans un journal financier. Une écriture n'est jamais modifiée : une erreur se corrige par une écriture supplémentaire. Le système doit conserver les références de transaction des opérateurs et permettre de rapprocher les opérations internes des mouvements constatés sur les comptes de la plateforme.

19.2 Idempotence et cohérence

• Une même confirmation de paiement ne doit produire ses effets qu'une seule fois.
• Un paiement confirmé ne peut pas être affecté à plusieurs commandes.
• Une unité de stock ne peut être attribuée qu'à une seule commande.
• Un versement ne peut pas être payé deux fois.
• Les changements de statut doivent être contrôlés selon les transitions autorisées.
• Les opérations incertaines doivent rester en vérification plutôt que d'être transformées arbitrairement en succès ou échec.

19.3 Confidentialité et accès

Les données personnelles, pièces d'identité, coordonnées Mobile Money, conversations et informations financières doivent être accessibles uniquement aux personnes et fonctions qui en ont besoin. L'accès aux comptes MTN Mobile Money et Orange Money de la plateforme est réservé aux administrateurs habilités ; ces comptes ne servent qu'aux transactions de la plateforme et ne sont jamais mélangés avec des fonds personnels. Les durées de conservation, modalités de suppression/anonymisation, politique de confidentialité et conditions d'accès administrateur sont à définir.

19.4 Rapprochement

L'administrateur effectue un contrôle périodique entre les enregistrements de la plateforme et l'historique des comptes MTN Mobile Money et Orange Money dédiés : paiements reçus, remboursements et versements exécutés. La périodicité reste à définir. Les écarts doivent être identifiés, documentés et résolus sans effacer l'historique.

20. Parcours fonctionnels de bout en bout


20.1 Parcours : publication d'une annonce

1. Le vendeur se connecte et ouvre l'espace Vendre.
2. Il saisit le titre, la description, la catégorie, le prix, l'état, la quantité, la localisation et, s'il l'accepte, la mention « Troc accepté ».
3. Il ajoute les photos requises.
4. Il publie l'annonce.
5. La plateforme valide les champs et rend l'annonce visible si elle respecte les règles de modération.

20.2 Parcours : vente classique

1. L'acheteur découvre l'annonce et ouvre une conversation avec le vendeur.
2. Les parties discutent du produit et négocient éventuellement le prix.
3. Elles conviennent du prix final, du lieu et de l'heure de remise.
4. Le vendeur confirme la disponibilité et les modalités.
5. La plateforme enregistre la commande et les conditions convenues.
6. L'acheteur effectue le paiement Mobile Money vers le compte de la plateforme et signale son paiement.
7. L'administrateur confirme le paiement à partir de l'historique du compte.
8. Lorsque le paiement est confirmé et qu'une unité est affectée, la commande passe à l'étape de remise et le code est généré.
9. L'acheteur inspecte et récupère le produit, puis communique le code au vendeur.
10. Le vendeur saisit le code ; la plateforme le valide.
11. Le versement du vendeur est créé ; l'administrateur l'exécute après vérification qu'aucun litige ne bloque.

20.3 Parcours : affiliation

1. Le propriétaire active l'affiliation et définit la rémunération fixe du produit.
2. Un apporteur récupère le lien affilié et le partage.
3. L'acheteur ouvre le lien ; le prix affiché inclut la rémunération et n'est pas négociable.
4. L'acheteur contacte le propriétaire, qui confirme la disponibilité, le lieu et l'heure de remise.
5. La commande conserve l'identifiant de l'apporteur et les montants applicables.
6. L'acheteur paie le prix final ; l'administrateur confirme le paiement.
7. Après validation du code, deux versements sont créés en même temps : le prix de base pour le propriétaire et la rémunération pour l'apporteur.

20.4 Parcours : troc sans soulte

1. Un utilisateur propose d'échanger son article contre l'article d'une annonce marquée « Troc accepté ».
2. Les parties conviennent des deux articles, du lieu et de l'horaire.
3. Elles se retrouvent et échangent les articles.
4. Chaque partie confirme avoir reçu l'article de l'autre.
5. Le troc est terminé lorsque les deux confirmations sont enregistrées. S'il en manque une, l'administrateur tranche.

20.5 Parcours : troc avec soulte

1. Les parties conviennent des deux articles, de la soulte, de la partie qui la paie, du lieu et de l'horaire.
2. La partie qui doit la soulte la paie ; l'administrateur confirme le paiement.
3. Le code de remise est généré pour ce paiement et vu uniquement par la partie qui a payé.
4. À l'échange, elle communique le code à l'autre partie, qui le saisit.
5. La soulte est versée à la partie qui la reçoit, après vérification par l'administrateur.
6. Chaque partie confirme avoir reçu l'article de l'autre ; le troc est terminé lorsque les deux ont confirmé.

20.6 Parcours : versement

1. Le bénéficiaire a renseigné son numéro Mobile Money et le nom du titulaire.
2. La validation du code crée le versement, qui passe en attente de décision de l'administrateur.
3. L'administrateur vérifie qu'aucun litige n'est ouvert et approuve le versement.
4. Il effectue le transfert depuis le compte MTN ou Orange de la plateforme et enregistre la référence.
5. Le versement est payé une fois le transfert confirmé. Les frais de transfert sont supportés par le bénéficiaire.
6. En cas de statut incertain, aucune nouvelle tentative n'est effectuée avant vérification.

20.7 Parcours : litige après paiement

1. Une partie ouvre un litige ou contacte le support.
2. La commande ou le troc et les fonds concernés sont signalés comme faisant l'objet d'un examen ; les versements concernés sont bloqués.
3. L'administration examine les informations et preuves.
4. Elle décide de maintenir les fonds gelés, de verser le montant au vendeur ou d'autoriser un remboursement total.
5. Le remboursement éventuel est exécuté manuellement et suivi jusqu'à l'enregistrement de sa référence de transfert.
