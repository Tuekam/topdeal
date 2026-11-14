# TOPDEAL
## RÉFÉRENTIEL COMPLET DES RÈGLES MÉTIER
**Marketplace de vente, de troc et d’affiliation entre particuliers — Bafoussam, Cameroun**

| Champ | Détail |
| :--- | :--- |
| **Version du référentiel** | 1.0 — consolidée à partir de la spécification v1.3 |
| **Référence fonctionnelle** | TopDeal — Spécification fonctionnelle complète et finale v1.3 |
| **Modèles associés** | Diagramme de classes complet et énumérations transmis |
| **Périmètre** | Vente, paiement, remise, affiliation, troc, versements, remboursements, litiges et administration |
| **Statut** | Règles validées + points à définir clairement identifiés |

> *Document de référence pour les diagrammes UML, les cas d’utilisation, les diagrammes de séquence et l’implémentation métier.*

---

## 1. Objet et conventions du document

Ce document formalise les règles métier de TopDeal. Il traduit les décisions de la spécification fonctionnelle v1.3 en règles identifiables, vérifiables et utilisables lors de la conception UML et du développement.

* **VALIDÉ** : correspond aux décisions consignées dans la spécification de référence et les décisions complémentaires transmises.
* **À DÉFINIR** : signale un arbitrage encore ouvert.
* **À VÉRIFIER** : nécessite une validation technique, opérationnelle ou juridique.

### 1.1 Principes structurants
* TopDeal démarre à Bafoussam, en français, pour les personnes âgées de 18 ans et plus.
* Un compte utilisateur permet à la même personne d’acheter et de vendre.
* Le lancement comprend la vente, le troc un article contre un article, l’affiliation, les favoris et la vérification d’identité manuelle.
* La remise des produits se fait en main propre.
* Les paiements, versements et remboursements sont contrôlés ou exécutés manuellement par l’administration au lancement.
* La commission de la plateforme est de 0 % au lancement.
* Il n’existe pas de portefeuille virtuel ni de retrait initié par l’utilisateur.
* Les fonds en attente de résolution sont désignés comme « fonds gelés » ; TopDeal ne doit pas se présenter comme un service de séquestre réglementé.

---

## 2. Règles relatives aux comptes et aux utilisateurs

* **RG-001 — Compte unique `[VALIDÉ]`** : Un utilisateur possède un compte unique lui permettant d’agir comme acheteur et comme vendeur.
* **RG-002 — Âge minimal `[VALIDÉ]`** : Seules les personnes âgées de 18 ans ou plus peuvent créer et utiliser un compte TopDeal.
* **RG-003 — Téléphone unique `[VALIDÉ]`** : Le numéro de téléphone doit être unique pour chaque compte.
* **RG-004 — Adresse e-mail `[VALIDÉ]`** : L’unicité de l’adresse e-mail dépend du mode d’inscription et reste à confirmer.
* **RG-005 — Profil minimal `[VALIDÉ]`** : Le profil comprend au minimum le prénom, le nom et le numéro de téléphone.
* **RG-006 — Date de naissance `[VALIDÉ]`** : La date de naissance est demandée afin de contrôler l’âge minimal.
* **RG-007 — Suspension `[VALIDÉ]`** : L’administration peut suspendre ou réactiver un compte selon ses habilitations.
* **RG-008 — Historique conservé `[VALIDÉ]`** : La suspension d’un compte ne supprime pas son historique financier ou transactionnel.
* **RG-009 — Suppression physique `[VALIDÉ]`** : La suppression physique d’un compte par l’utilisateur est exclue du lancement.
* **RG-010 — Récupération de compte `[À DÉFINIR]`** : La récupération d’accès doit comporter des contrôles adaptés et ne doit pas reposer uniquement sur une information facilement accessible.
* **RG-011 — Modification sensible `[À DÉFINIR]`** : La modification des coordonnées de connexion ou de versement doit déclencher des contrôles adaptés.
* **RG-012 — Vérification d’identité `[VALIDÉ]`** : Un utilisateur peut soumettre une demande de vérification d’identité ; l’administration l’accepte ou la refuse.
* **RG-013 — Motif de refus `[VALIDÉ]`** : Toute demande refusée comporte un motif communiqué au demandeur.
* **RG-014 — Accès aux justificatifs `[VALIDÉ]`** : Les pièces d’identité sont privées et accessibles uniquement aux administrateurs habilités.
* **RG-015 — Badge bleu `[VALIDÉ]`** : Le badge bleu est associé à une vérification d’identité acceptée.

---

## 3. Règles relatives aux rôles et aux permissions

* **RG-016 — Rôles administratifs `[VALIDÉ]`** : Les rôles administratifs sont séparés (notamment super-administrateur, modérateur et financier) et les actions sont limitées aux permissions accordées.
* **RG-017 — Permissions sensibles `[VALIDÉ]`** : La modération, la vérification d’identité, la confirmation des paiements, les versements, les remboursements et les litiges font l’objet de permissions distinctes.
* **RG-018 — Journalisation administrative `[VALIDÉ]`** : Toute action administrative sensible doit enregistrer l’auteur, la date, l’objet, l’action réalisée et le motif.
* **RG-019 — Accès au contenu privé `[VALIDÉ]`** : L’accès administratif aux conversations et données personnelles/financières doit être limité au besoin de support, de litige ou de contrôle autorisé.

---

## 4. Règles relatives aux annonces, catégories et photos

* **RG-020 — Un produit par annonce `[VALIDÉ]`** : Une annonce représente un seul type de produit ; la quantité représente plusieurs exemplaires identiques.
* **RG-021 — Titre et description `[VALIDÉ]`** : Une annonce comporte un titre compréhensible et une description utile précisant notamment l’état, l’utilisation, les défauts et les caractéristiques.
* **RG-022 — État du produit `[VALIDÉ]`** : L’état du produit est obligatoire et prend l’une des valeurs `NEUF` ou `OCCASION`.
* **RG-023 — Prix de base `[VALIDÉ]`** : Le propriétaire fixe le prix de base de l’annonce en FCFA.
* **RG-024 — Quantité positive `[VALIDÉ]`** : La quantité publiée doit être un entier strictement positif.
* **RG-025 — Catégorisation `[VALIDÉ]`** : Chaque annonce est rattachée à une catégorie et, si applicable, à une sous-catégorie administrée.
* **RG-026 — Localisation `[VALIDÉ]`** : La localisation de l’annonce précise un quartier ou secteur de Bafoussam au lancement.
* **RG-027 — Acceptation du troc `[VALIDÉ]`** : Le vendeur indique si l’annonce accepte les propositions de troc.
* **RG-028 — Photos de l’annonce `[VALIDÉ]`** : Les photos représentent le produit annoncé et sont conservées par la plateforme.
* **RG-029 — Limites des photos `[À DÉFINIR]`** : Le nombre maximal/minimal, les formats, les tailles et les critères de qualité des photos restent à définir.
* **RG-030 — Champs propres aux catégories `[VALIDÉ]`** : Les champs marque/modèle ou autres caractéristiques peuvent dépendre de la catégorie lorsque cela est pertinent.
* **RG-031 — Pas d’expiration automatique `[VALIDÉ]`** : Une annonce ne devient pas expirée automatiquement.
* **RG-032 — Modification d’annonce `[VALIDÉ]`** : Le vendeur peut modifier le prix et la quantité ; une modification ne change jamais les conditions d’une commande déjà engagée.
* **RG-033 — Champs verrouillés `[À DÉFINIR]`** : Les champs qui doivent être verrouillés pendant une transaction restent à préciser.
* **RG-034 — Modération `[VALIDÉ]`** : L’administration peut modérer ou suspendre une annonce selon les règles de la plateforme.

---

## 5. Règles de visibilité, disponibilité et stock

* **RG-035 — Deux dimensions distinctes `[VALIDÉ]`** : La visibilité et la disponibilité d’une annonce sont deux dimensions indépendantes.
* **RG-036 — Visibilité publiée `[VALIDÉ]`** : Une annonce `PUBLIÉE` peut apparaître dans les résultats publics si elle respecte les autres conditions.
* **RG-037 — Visibilité masquée `[VALIDÉ]`** : Une annonce `MASQUÉE` par le vendeur n’apparaît plus dans les résultats publics, mais son historique est conservé.
* **RG-038 — Visibilité suspendue `[VALIDÉ]`** : Une annonce `SUSPENDUE` par l’administration n’est pas accessible comme annonce publique active.
* **RG-039 — Disponibilité `[VALIDÉ]`** : Une annonce peut être `DISPONIBLE`, `INDISPONIBLE` ou `ÉPUISÉE`.
* **RG-040 — Épuisement `[VALIDÉ]`** : Lorsque la quantité atteint zéro, l’annonce devient épuisée/indisponible.
* **RG-041 — Pas de réservation à la commande `[VALIDÉ]`** : Une demande de paiement ou une commande non payée ne réserve pas le stock.
* **RG-042 — Priorité au paiement confirmé `[VALIDÉ]`** : Le stock est attribué au premier paiement confirmé et correctement affecté à une unité disponible.
* **RG-043 — Décrémentation atomique `[VALIDÉ]`** : L’affectation et la décrémentation du stock doivent être atomiques ; une même unité ne peut être attribuée à deux commandes.
* **RG-044 — Commande devenue impossible `[VALIDÉ]`** : Si le stock ne permet plus de satisfaire une commande, celle-ci est annulée et l’acheteur est informé.
* **RG-045 — Paiement tardif incompatible `[VALIDÉ]`** : Un paiement confirmé tardivement alors que le stock est déjà attribué déclenche une anomalie et une résolution administrative ; il ne doit jamais provoquer une double vente.
* **RG-046 — Paiement incertain et stock `[VALIDÉ]`** : Un paiement `PENDING` ou `UNKNOWN` ne permet ni d’affecter définitivement le stock ni de considérer le paiement comme échoué.

---

## 6. Recherche et favoris

* **RG-047 — Recherche `[VALIDÉ]`** : La recherche porte sur le titre et, lorsque pertinent, sur la description.
* **RG-048 — Filtres `[VALIDÉ]`** : Les filtres comprennent au minimum catégorie, sous-catégorie, état, fourchette de prix, quartier/secteur et acceptation du troc.

• RG-049 — Favoris [VALIDÉ] : Un utilisateur peut ajouter et retirer une annonce de ses favoris.
• RG-050 — État des favoris [VALIDÉ] : L’état masqué, suspendu ou indisponible d’une annonce doit être reflété dans la liste des favoris.
• RG-051 — Favoris distincts des souhaits [VALIDÉ] : Les favoris ordinaires sont inclus au lancement ; les listes de souhaits sont exclues.

7. Messagerie, conversations et négociation

• RG-052 — Conversation acheteur-vendeur [VALIDÉ] : Une conversation consolidée relie un acheteur et un vendeur.
• RG-053 — Plusieurs annonces par conversation [VALIDÉ] : Plusieurs annonces peuvent être discutées dans une même conversation.
• RG-054 — Annonce contextualisée [VALIDÉ] : Chaque message ou proposition doit pouvoir être rattaché à l’annonce concernée.
• RG-055 — Messages texte [VALIDÉ] : La messagerie accepte les messages textuels uniquement au lancement.
• RG-056 — Indicateur de lecture [VALIDÉ] : La messagerie fournit un indicateur de lecture des messages.
• RG-057 — Pas de modification/suppression [VALIDÉ] : Les messages ne peuvent être ni modifiés ni supprimés par les utilisateurs au lancement.
• RG-058 — Signalement sans blocage automatique [VALIDÉ] : Un signalement ne bloque pas automatiquement la conversation.
• RG-059 — Consultation administrative [À DÉFINIR] : Les messages ne sont consultés par l’administration que dans le cadre du support ou d’un litige, selon une politique de confidentialité à définir.
• RG-060 — Contenu d’une proposition [VALIDÉ] : Une proposition comporte le prix proposé, le lieu de remise et la date/heure de remise.
• RG-061 — États d’une proposition [VALIDÉ] : Une proposition peut être en attente, acceptée, refusée ou annulée.
• RG-062 — Accord préalable [VALIDÉ] : Avant paiement, les parties doivent convenir du prix final, du lieu, de la date et de l’heure.
• RG-063 — Disponibilité confirmée [VALIDÉ] : Le vendeur confirme la disponibilité du produit avant le paiement.
• RG-064 — Instantané de commande [VALIDÉ] : La commande conserve un instantané des conditions acceptées ; les modifications ultérieures de l’annonce ne les modifient pas.

8. Commandes et demandes de paiement

• RG-065 — Commande après accord [VALIDÉ] : La commande est enregistrée après accord commercial entre les parties.
• RG-066 — Données de commande [VALIDÉ] : La commande conserve au minimum acheteur, vendeur, annonce, quantité, prix convenu, lieu, date et heure de remise.
• RG-067 — Conditions immuables [VALIDÉ] : Les conditions de la commande engagée ne sont pas modifiées par une mise à jour ultérieure de l’annonce.
• RG-068 — Séparation commande/paiement [VALIDÉ] : Le statut de la commande est distinct du statut du paiement.
• RG-069 — Demande rattachée [VALIDÉ] : Une demande de paiement est liée à la commande concernée et au montant convenu.
• RG-070 — États de demande [VALIDÉ] : Une demande de paiement peut être ouverte/en attente, soldée, ou annulée ; les refus doivent également être tracés selon le parcours retenu.
• RG-071 — Pas d’expiration automatique [VALIDÉ] : Une commande ou demande de paiement n’expire pas automatiquement du seul fait du temps.
• RG-072 — Pas de réservation par demande [VALIDÉ] : La demande de paiement ne réserve pas le stock.
• RG-073 — Type de commande [VALIDÉ] : Les types fonctionnels comprennent l’achat classique et la commande liée à une soulte de troc.
• RG-074 — Conditions affiliées figées [VALIDÉ] : Lorsqu’une commande provient d’un lien affilié, l’identifiant de l’apporteur et les montants applicables sont conservés dans la commande.

9. Paiements Mobile Money

• RG-075 — Opérateurs acceptés [VALIDÉ] : Les moyens retenus au lancement sont MTN Mobile Money et Orange Money.
• RG-076 — Traitement manuel [VALIDÉ] : Au lancement, aucun agrégateur ni API de paiement n’est retenu ; la vérification est manuelle.
• RG-077 — Compte dédié [VALIDÉ] : L’acheteur transfère le montant exact vers un compte Mobile Money dédié à TopDeal.
• RG-078 — Signalement acheteur [VALIDÉ] : Après le transfert, l’acheteur signale le paiement et fournit les informations ou références disponibles.
• RG-079 — Vérification administrative [VALIDÉ] : L’administration vérifie la réception dans l’historique du compte dédié.
• RG-080 — Critères de confirmation [VALIDÉ] : Un paiement est confirmé uniquement si la réception, le montant et l’association à la commande sont cohérents.
• RG-081 — PENDING/UNKNOWN [VALIDÉ] : Un paiement en attente ou inconnu n’est ni un succès ni un échec ; il reste en vérification.
• RG-082 — Montant incorrect [VALIDÉ] : Un montant différent du montant attendu est placé en anomalie et nécessite une décision administrative.
• RG-083 — Confirmation unique [VALIDÉ] : Une confirmation de paiement ne produit ses effets qu’une seule fois.
• RG-084 — Paiement non réutilisable [VALIDÉ] : Un paiement confirmé ne peut pas être affecté à plusieurs commandes.
• RG-085 — Paiement tardif [VALIDÉ] : Un paiement confirmé tardivement incompatible avec le stock déjà attribué est traité administrativement sans double vente.
• RG-086 — Comptes dédiés [VALIDÉ] : Les comptes Mobile Money de la plateforme sont dédiés aux opérations TopDeal et ne sont pas mélangés à des fonds personnels.
• RG-087 — Pas de code sans paiement [VALIDÉ] : Pour une vente classique, aucun code de remise n’est généré avant confirmation du paiement et affectation du stock.

10. Remise du produit et code de confirmation

• RG-088 — Remise en main propre [VALIDÉ] : La remise du produit s’effectue en main propre au lieu et à l’heure convenus.
• RG-089 — Code visible acheteur [VALIDÉ] : Le code de remise est visible uniquement par l’acheteur avant qu’il ne le communique.
• RG-090 — Code à usage unique [VALIDÉ] : Un code de remise ne peut être utilisé qu’une seule fois.
• RG-091 — Code non conservé en clair [VALIDÉ] : Le code n’est pas conservé en clair dans le système.
• RG-092 — Inspection préalable [VALIDÉ] : L’acheteur inspecte le produit avant de communiquer le code au vendeur.
• RG-093 — Validation par vendeur [VALIDÉ] : Le vendeur saisit le code communiqué par l’acheteur ; la plateforme vérifie le code et enregistre la remise.
• RG-094 — Trois tentatives [VALIDÉ] : Après trois tentatives incorrectes, la validation est bloquée et le vendeur doit contacter l’administration.
• RG-095 — Fonds gelés en anomalie [VALIDÉ] : En cas de blocage ou d’incident de remise, les fonds restent gelés jusqu’à résolution.
• RG-096 — Silence de l’acheteur [VALIDÉ] : Le silence de l’acheteur ne déclenche jamais automatiquement un versement.
• RG-097 — Paramètres du code [À DÉFINIR] : La durée de validité, le renouvellement, la perte du code et la procédure de remise sans code restent à définir.
• RG-098 — Déclaration vendeur [À DÉFINIR] : Une éventuelle déclaration de remise par le vendeur et sa contestation restent à définir.

11. Affiliation

• RG-099 — Activation par propriétaire [VALIDÉ] : Le propriétaire de l’annonce peut activer ou désactiver l’affiliation.
• RG-100 — Rémunération fixe [VALIDÉ] : À l’activation, le propriétaire fixe une rémunération unique en FCFA par exemplaire, identique pour tous les apporteurs du produit.
• RG-101 — Prix de base inchangé [VALIDÉ] : L’activation de l’affiliation ne modifie pas le prix de base de l’annonce originale.
• RG-102 — Prix du lien [VALIDÉ] : Le prix présenté via le lien affilié est égal au prix de base augmenté de la rémunération fixe.
• RG-103 — Prix final fixe [VALIDÉ] : Le prix final affiché via le lien est un montant unique, fixe et non négociable via ce lien.
• RG-104 — Attribution par lien [VALIDÉ] : La rémunération est attribuée uniquement si l’acheteur commande effectivement via le lien affilié utilisé.
• RG-105 — Auto-affiliation interdite [VALIDÉ] : Le propriétaire ne peut pas s’attribuer sa propre affiliation.
• RG-106 — Conditions des commandes engagées [VALIDÉ] : Les nouvelles commandes utilisent les nouvelles conditions ; les commandes déjà engagées conservent les conditions précédentes.
• RG-107 — Pas de gestion par apporteur [VALIDÉ] : L’apporteur ne gère ni le stock, ni la commande, ni la remise du produit.
• RG-108 — Deux versements possibles [VALIDÉ] : Après remise validée, une commande affiliée peut générer un versement vendeur et un versement apporteur distincts.
• RG-109 — Pas de rémunération après annulation/remboursement [VALIDÉ] : Une vente annulée ou remboursée ne donne lieu à aucune rémunération d’affiliation.
• RG-110 — Affiliation sur troc exclue [VALIDÉ] : L’affiliation sur troc ou soulte est exclue du périmètre actuel ; toute évolution nécessite une décision métier explicite.

12. Troc

• RG-111 — Troc au lancement [VALIDÉ] : Le troc fait partie du périmètre initial.
• RG-112 — Un article contre un article [VALIDÉ] : Un troc porte sur un seul article proposé par chaque partie.
• RG-113 — Propriété des articles [VALIDÉ] : Chaque partie doit posséder l’article qu’elle propose.
• RG-114 — Annonces éligibles [VALIDÉ] : Les deux annonces concernées doivent accepter le troc.
• RG-115 — Accord avant échange [VALIDÉ] : Les parties conviennent des deux articles, du lieu, de la date et de l’heure avant l’échange.
• RG-116 — Soulte autorisée [VALIDÉ] : Une soulte peut compenser une différence de valeur entre les deux articles.
• RG-117 — Troc sans soulte [VALIDÉ] : Sans soulte, aucun paiement et aucun code de remise ne sont générés.
• RG-118 — Confirmation A et B [VALIDÉ] : Chaque partie confirme séparément avoir reçu l’article de l’autre.
• RG-119 — Clôture à deux confirmations [VALIDÉ] : Le troc n’est terminé que lorsque les deux confirmations sont enregistrées.
• RG-120 — Silence non assimilé [VALIDÉ] : L’absence de confirmation ne vaut jamais confirmation implicite.
• RG-121 — Troc avec soulte [VALIDÉ] : Avec soulte, la partie désignée comme payeuse règle la soulte selon le parcours de paiement.
• RG-122 — Code limité à la soulte [VALIDÉ] : Le code généré dans un troc avec soulte concerne uniquement le paiement de la soulte.
• RG-123 — Code ne clôture pas le troc [VALIDÉ] : La validation du code de soulte ne remplace jamais les deux confirmations de réception.
• RG-124 — Litige ou confirmation manquante [VALIDÉ] : Si une confirmation manque ou si une partie conteste l’échange, l’administration examine le dossier et tranche.
• RG-125 — Disponibilité des articles [À DÉFINIR] : Les règles de disponibilité/réservation des deux articles pendant le troc restent à définir.
• RG-126 — Annulation du troc [À DÉFINIR] : Les conséquences d’une annulation avant ou après paiement de la soulte, notamment la restitution des articles et le remboursement éventuel, restent à définir.
• RG-127 — Non-conformité et absence [À DÉFINIR] : La procédure en cas de produit non conforme ou d’absence au rendez-vous reste à définir.

13. Versements, frais et absence de portefeuille

• RG-128 — Pas de portefeuille [VALIDÉ] : Aucun portefeuille virtuel n’est proposé au lancement.
• RG-129 — Pas de solde utilisateur [VALIDÉ] : Aucun solde disponible ou en attente n’est présenté comme portefeuille à l’utilisateur.
• RG-130 — Pas de retrait utilisateur [VALIDÉ] : L’utilisateur ne déclenche pas lui-même un retrait ; les versements sont exécutés par l’administration.
• RG-131 — Historique des versements [VALIDÉ] : Le bénéficiaire peut consulter l’historique des versements qui lui sont destinés.
• RG-132 — Un versement par bénéficiaire [VALIDÉ] : Une commande génère au maximum un versement par bénéficiaire et par type de droit financier applicable.
• RG-133 — Versement vendeur [VALIDÉ] : Une vente classique génère normalement un versement destiné au vendeur après validation de la remise et contrôles.
• RG-134 — Versement affilié [VALIDÉ] : Une commande affiliée peut générer un second versement distinct destiné à l’apporteur.
• RG-135 — Contrôle avant versement [VALIDÉ] : Aucun versement n’est exécuté tant que les contrôles requis et l’absence de litige bloquant ne sont pas établis.
• RG-136 — Coordonnées bénéficiaire [VALIDÉ] : Le bénéficiaire fournit son numéro Mobile Money et le nom du titulaire.
• RG-137 — Approbation administrative [VALIDÉ] : L’administration vérifie et approuve le versement avant son exécution.
• RG-138 — Preuve du transfert [VALIDÉ] : Le versement n’est marqué payé qu’après confirmation du transfert et enregistrement de sa référence.
• RG-139 — Frais à charge bénéficiaire [VALIDÉ] : Les frais de transfert sont à la charge du bénéficiaire.
• RG-140 — Montant des frais [À DÉFINIR] : Le montant, le calcul et l’affichage des frais doivent être confirmés.
• RG-141 — Commission plateforme [VALIDÉ] : La commission de la plateforme est de 0 % au lancement.
• RG-142 — Transfert inconnu [VALIDÉ] : Un transfert dont le statut est inconnu reste en vérification ; aucune nouvelle tentative ne doit être lancée avant contrôle.
• RG-143 — Échec vérifié [VALIDÉ] : Un versement en échec vérifié reste dû jusqu’à résolution ; son statut ne doit pas être présenté comme payé.

14. Annulations et remboursements

• RG-144 — Annulation distincte [VALIDÉ] : L’annulation d’une commande et le remboursement d’un paiement sont deux opérations distinctes.
• RG-145 — Annulation avant paiement [VALIDÉ] : Une commande non payée peut être annulée selon les droits et conditions du parcours ; elle ne donne lieu à aucun remboursement puisqu’aucun paiement n’a été confirmé.
• RG-146 — Annulation après paiement [VALIDÉ] : L’annulation d’une commande payée ne rembourse pas automatiquement l’acheteur.
• RG-147 — Remboursement total uniquement [VALIDÉ] : Au lancement, seuls les remboursements totaux sont prévus ; les remboursements partiels sont exclus.
• RG-148 — Approbation administrative [VALIDÉ] : Tout remboursement nécessite une approbation de l’administration.
• RG-149 — Exécution manuelle [VALIDÉ] : Le remboursement est exécuté manuellement vers le Mobile Money de l’acheteur.
• RG-150 — Preuve remboursement [VALIDÉ] : Le montant, le motif, la date, l’opérateur et la référence du transfert sont enregistrés.
• RG-151 — Statut exécuté [VALIDÉ] : Le remboursement n’est marqué exécuté qu’après confirmation du transfert.
• RG-152 — Remboursement inconnu [VALIDÉ] : Un remboursement au statut inconnu reste en vérification ; aucune nouvelle tentative ne doit créer un doublon.
• RG-153 — Affiliation annulée [VALIDÉ] : Une vente annulée ou remboursée ne donne lieu à aucune rémunération affiliée.
• RG-154 — Frais de remboursement [À DÉFINIR] : La prise en charge des frais de transfert lors d’un remboursement reste à définir.

15. Litiges et support

• RG-155 — Objet référencé [VALIDÉ] : Un litige ou dossier support doit référencer au moins une commande ou un troc ; il peut référencer les deux si les opérations sont liées.
• RG-156 — Blocage des versements [VALIDÉ] : Lorsqu’un litige est ouvert avant l’exécution d’un versement, les versements concernés sont bloqués.
• RG-157 — Fonds gelés [VALIDÉ] : Les fonds concernés restent gelés pendant l’examen du litige.
• RG-158 — Éléments examinés [VALIDÉ] : L’administration peut examiner les conditions convenues, paiements, versements, messages, propositions, code, confirmations et preuves transmises.
• RG-159 — Décisions possibles [VALIDÉ] : L’administration peut maintenir les fonds gelés, autoriser le versement ou approuver un remboursement total.
• RG-160 — Décision motivée [VALIDÉ] : Toute décision de litige est motivée et journalisée.
• RG-161 — Traitement manuel [VALIDÉ] : Le traitement des litiges est manuel au lancement.
• RG-162 — Silence sans effet [VALIDÉ] : Le silence d’une partie ne déclenche ni transfert ni remboursement.
• RG-163 — Procédure de support [À DÉFINIR] : Les délais de prise en charge, priorités, pièces justificatives et règles d’escalade restent à définir.

16. Notifications

• RG-164 — Notifications internes [VALIDÉ] : Les notifications sont internes à l’application au lancement.
• RG-165 — SMS exclu [VALIDÉ] : Les SMS sont exclus du lancement.
• RG-166 — Canaux futurs [VALIDÉ] : L’e-mail et les notifications push restent à définir.
• RG-167 — Événements notifiés [VALIDÉ] : Les événements notifiables comprennent notamment messages, propositions, commandes, paiements, code, remise, troc, annulation, versement, remboursement, affiliation, vérification, signalement et litige.
• RG-168 — Code confidentiel [VALIDÉ] : Aucune notification ne doit divulguer le code de remise.
• RG-169 — Données minimales [VALIDÉ] : Une notification ne divulgue pas de données personnelles ou financières inutiles.
• RG-170 — Destinataire adapté [VALIDÉ] : La notification est envoyée uniquement aux parties concernées selon la confidentialité de l’événement.

17. Journal financier, traçabilité et sécurité

• RG-171 — Traçabilité financière [VALIDÉ] : Chaque paiement, remboursement, versement, attribution d’affiliation et correction est traçable.
• RG-172 — Historique immuable [VALIDÉ] : Une écriture financière historique n’est pas modifiée directement.
• RG-173 — Correction par nouvelle opération [VALIDÉ] : Toute correction financière crée une nouvelle écriture liée à l’opération originale et justifiée.
• RG-174 — Pas de double paiement [VALIDÉ] : Un versement ne peut pas être payé deux fois.
• RG-175 — Pas de double affectation [VALIDÉ] : Un paiement confirmé ne peut pas être affecté à plusieurs commandes.
• RG-176 — Rapprochement [VALIDÉ] : L’administration rapproche les opérations TopDeal des historiques des comptes Mobile Money dédiés.
• RG-177 — Données protégées [VALIDÉ] : Les données personnelles, pièces d’identité, coordonnées Mobile Money, conversations et données financières sont accessibles uniquement aux fonctions habilitées.
• RG-178 — Opérations incertaines [VALIDÉ] : Toute opération financière incertaine reste en vérification jusqu’à obtention d’éléments suffisants.
• RG-179 — Journal d’audit [VALIDÉ] : Les actions administratives sensibles sont enregistrées dans le journal d’audit.
• RG-180 — Fréquence de rapprochement [À DÉFINIR] : La fréquence, les responsables, la conservation des preuves et la résolution des écarts restent à définir.

18. Règles d’exclusion du lancement

Les éléments suivants sont explicitement exclus du périmètre de lancement :
• Portefeuille virtuel, soldes disponibles/en attente et retraits initiés par l’utilisateur.
• Paiement par carte bancaire et déploiement dans d’autres villes que Bafoussam.
• Livraison organisée par la plateforme ou livraison interurbaine.
• Promotions payantes et programme de fidélité.
• Suppression physique du compte par l’utilisateur.
• Photos, pièces jointes et messages vocaux dans la messagerie.
• SMS et langues autres que le français.
• Revente d’un produit appartenant à un autre utilisateur.
• Troc de plusieurs articles et listes de souhaits.
• Affiliation sur troc/soulte tant qu’aucune règle n’est validée.
• Agrégateur/API de paiement ou transfert au lancement.
• Remboursements partiels et litiges automatisés avancés.
• Évaluations, avis, reçus avancés, exports et statistiques avancées.

19. Points métier restant à arbitrer ou vérifier


Point	Statut	Décision / travail restant
Cadre légal des flux financiers	BLOQUANT	Obtenir un avis juridique compétent sur l’encaissement et la redistribution de fonds de tiers au regard du cadre CEMAC applicable. La spécification ne constitue pas un avis juridique.
Pilote et plafonds	À définir	Définir le cercle fermé éventuel, les plafonds, contrôles et conditions du pilote.
Procédure de paiement manuel	À préciser	Définir instructions, preuves acceptées, délais internes, traitement des montants erronés et paiements introuvables.
Frais de transfert	À confirmer	Confirmer montant, affichage, calcul et prise en charge lors d’un remboursement.
Code de remise	À définir	Durée de validité, renouvellement, perte du code et procédure manuelle de remise sans code.
Déclaration de remise sans code	À définir	Définir déclaration vendeur, contestation et revue administrative ; aucun transfert automatique sur silence.
Stock du troc	À définir	Définir disponibilité des deux articles pendant le troc et comportement en cas de commandes concurrentes.
Annulation d’un troc avec soulte	À définir	Définir soulte déjà payée, remboursement, libération/restauration des articles et responsabilités.
Photos	À définir	Nombre, formats, tailles, qualité et modération.
Vérification d’identité	À définir	Pièces exigées, stockage, accès, conservation, suppression, refus et recours.
Récupération de compte	À définir	Contrôles, preuves et délais.
Unicité e-mail	À confirmer	Règle selon le mode d’inscription.
Notifications	À définir	E-mail/push, coûts, consentements et préférences.
Confidentialité	À rédiger	Règles de consultation des conversations, conservation des données personnelles et financières.
Rapprochement	À définir	Fréquence, responsables et résolution des écarts.
Support	À définir	Délais, priorités, preuves et escalade.
Produits interdits	À définir	Catégories et procédure de modération.
Affiliation sur troc/soulte	Exclue actuellement	Toute inclusion nécessite une décision métier explicite.


20. Correspondance avec le diagramme de classes et les énumérations

Le diagramme de classes fourni constitue une représentation structurelle. Les règles métier ci-dessus restent applicables même lorsqu’elles ne sont pas directement visibles dans les attributs ou associations. Les contrôles d’atomicité, d’idempotence, d’autorisation et de transition d’état sont notamment portés par les services métier et les transactions.

20.1 Points d’alignement à traiter dans le modèle


Élément du modèle	Vérification / recommandation
StatutPaiement.EXPIRED	La spécification v1.3 affirme qu’aucun délai automatique de paiement n’est appliqué et qu’aucune expiration automatique n’a lieu. Retirer EXPIRED ou documenter précisément un cas d’expiration non temporel, après décision métier.
TypeVersement.REMBOURSEMENT	La spécification distingue Remboursement (demande/décision) et Versement (transfert au bénéficiaire). Le modèle doit éviter de confondre le remboursement de l’acheteur avec les versements vendeur/affilié. À arbitrer dans le diagramme.
StatutCommande	Les états du diagramme (CREEE, EN_ATTENTE_PAIEMENT, PAYEE, CODE_VALIDE, TERMINEE, etc.) doivent être documentés par rapport aux états fonctionnels de la v1.3, notamment « paiement à vérifier » et « payée/en attente de remise ». Ne pas fusionner statut de commande et statut de paiement.
Troc	Les dates dateConfirmationA et dateConfirmationB sont cohérentes avec les deux confirmations requises. Il faut s’assurer que les deux confirmations sont des événements indépendants et que le troc ne passe à CONFIRME qu’après les deux.
Troc / Commande	La relation Troc–Commande liée à la soulte doit préciser comment la commande référence le payeur, le bénéficiaire, le montant, le paiement et le code exclusivement associés à la soulte.
Stock	L’atomicité du décrément de stock et la gestion des paiements tardifs ne sont pas garanties par le seul diagramme ; elles doivent être des invariants des services métier et de la persistance.
AttributionAffiliation	Les valeurs prixBaseUnitaire, remunerationUnitaire et prixFinalUnitaire doivent constituer un instantané de la commande, afin que les changements ultérieurs d’affiliation n’altèrent pas une commande déjà engagée.
EvenementOutbox	Le diagramme doit préciser le rattachement fonctionnel de l’événement (agrégat/objet source) et les règles de publication/reprise, si l’outbox est conservée dans le modèle.


20.2 Distinction entre règle métier et choix technique

• Une règle métier exprime ce qui doit être vrai (ex. une unité ne peut être vendue deux fois).
• Le mécanisme technique exprime comment la règle est garantie (ex. transaction atomique, verrouillage ou contrainte en base).
• Le diagramme de classes ne doit pas être surchargé pour représenter chaque contrôle technique.
• Les diagrammes de séquence doivent montrer les validations, contrôles d’autorisation, vérifications de paiement, mises à jour de stock et traitements d’anomalies.

21. Conditions minimales de validation avant lancement

• Tester une vente classique de bout en bout, y compris paiement en attente et inconnu.
• Tester le troc sans soulte et le troc avec soulte de bout en bout.
• Tester l’affiliation et la conservation des conditions dans une commande.
• Vérifier qu’aucune double vente n’est possible et qu’une commande non payée ne bloque pas le stock.
• Vérifier que prix, lieu, date et heure convenus sont conservés dans la commande.
• Vérifier que le code est sécurisé, à usage unique et inaccessible au vendeur avant communication.
• Vérifier que les deux confirmations sont indispensables pour terminer un troc.
• Vérifier la traçabilité et le rapprochement des paiements, versements et remboursements.
• Rendre visibles à l’administration les paiements tardifs, doublons et statuts inconnus.
• Journaliser les actions administratives sensibles.
• Documenter confidentialité, conservation des données et procédure de support/litige.
• Faire vérifier le cadre légal des flux financiers et le modèle opérationnel avant ouverture publique.
• Afficher clairement les frais et modalités de transfert.

22. Glossaire


Terme	Définition
Annonce	Présentation d’un produit proposé à la vente ou au troc.
Propriétaire / vendeur	Utilisateur qui possède le produit et fixe le prix de base.
Acheteur	Utilisateur qui souhaite acquérir un produit.
Apporteur / affilié	Utilisateur qui recommande un produit par un lien et peut recevoir une rémunération.
Demande de paiement	Demande adressée à l’acheteur pour régler le montant convenu.
Commande	Enregistrement de l’accord commercial et des conditions de remise.
Paiement confirmé	Paiement dont la réception a été vérifiée par l’administration.
Stock attribué	Unité affectée à une commande après confirmation du paiement.
Code de remise	Code secret communiqué par l’acheteur au vendeur lors de la récupération.
Fonds gelés	Fonds payés et conservés sur le compte de la plateforme jusqu’à validation ou résolution d’un incident.
Versement	Transfert manuel de l’administration à un bénéficiaire après validation et contrôles.
Remboursement	Restitution à l’acheteur d’un paiement reçu, approuvée et exécutée par l’administration.
Troc	Échange d’un article contre un autre entre deux utilisateurs.
Soulte	Somme payée par une partie pour compenser une différence de valeur.
Rapprochement	Comparaison des opérations TopDeal avec les historiques des comptes Mobile Money dédiés.


23. Utilisation du référentiel

Ce référentiel doit servir de base commune pour vérifier les cas d’utilisation, les diagrammes de séquence, les contrats des services métier, les tests fonctionnels et les critères d’acceptation. Toute modification d’une règle validée doit être explicitement décidée puis répercutée dans la spécification, le diagramme de classes, les énumérations, les séquences et les tests.