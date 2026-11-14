TOPDEAL
DOCUMENTATION TECHNIQUE DE LA BASE DE DONNÉES
PostgreSQL 18.1 — Schéma public

Référence établie à partir de l’export pg_dump fourni
 
1. Présentation générale
TopDeal est une plateforme de marketplace permettant la publication d’annonces, les échanges entre utilisateurs, les achats, les trocs avec ou sans soulte, le traitement des paiements et versements, l’affiliation, la vérification d’identité et la gestion du support et des litiges.
Ce document décrit le schéma PostgreSQL réellement exporté dans le fichier topdeal_schema.sql. Les noms SQL et les valeurs des ENUM sont conservés tels quels.
2. Synthèse du schéma
Élément	Valeur
Version PostgreSQL du dump	18.1
Schéma documenté	public
Tables	29
Types ENUM	29
Clés étrangères extraites	59
Index extraits	60
Contraintes CHECK déclarées dans les tables	31

Les nombres ci-dessus sont calculés à partir des définitions présentes dans le dump. Les index uniques partiels sont documentés séparément des contraintes UNIQUE.
3. Conventions et choix de conception visibles
•	Les identifiants principaux sont généralement des UUID avec gen_random_uuid() comme valeur par défaut.
•	Les dates métier utilisent majoritairement timestamp with time zone.
•	Les montants sont généralement stockés en numeric(12,2).
•	Les états contrôlés sont modélisés avec des types ENUM PostgreSQL.
•	Les suppressions référentielles utilisent ON DELETE RESTRICT dans les clés étrangères présentes dans le dump.
•	L’identité d’authentification externe est séparée du compte interne dans identite_externe.
•	Les métadonnées de fichiers sont stockées directement dans photo_annonce et verification_identite.
•	Les événements asynchrones disposent d’une table evenement_outbox.
•	Les frais de transfert sont portés par versement ; la table commande ne comporte pas de colonne frais_transfert.
4. Types ENUM
Chaque ENUM ci-dessous liste les valeurs exactes extraites du dump.
disponibilite
DISPONIBLE · INDISPONIBLE · EPUISEE
etat_article
NEUF · OCCASION
fournisseur_auth
FIREBASE
operateur
MTN_MOMO · ORANGE_MONEY
role_admin
SUPER_ADMIN · MODERATEUR · FINANCIER
sens_ecriture
DEBIT · CREDIT
sens_soulte
PARTIE_A_PAIE · PARTIE_B_PAIE · AUCUNE
statut_code
ACTIF · UTILISE · BLOQUE
statut_commande
CREEE · EN_ATTENTE_PAIEMENT · PAYEE · CODE_VALIDE · TERMINEE · ANNULEE · REMBOURSEE · EN_LITIGE
statut_compte
ACTIF · SUSPENDU
statut_conversation
ACTIVE · ARCHIVEE
statut_demande
EN_ATTENTE · ACCEPTEE · REFUSEE · ANNULEE
statut_evenement
EN_ATTENTE · PUBLIE · ECHEC
statut_litige
OUVERT · EN_EXAMEN · TRANCHE · CLOS
statut_paiement
INITIATED · PENDING · SUCCEEDED · FAILED · CANCELLED · UNKNOWN
statut_proposition
EN_ATTENTE · ACCEPTEE · REFUSEE · ANNULEE
statut_remboursement
REQUESTED · UNDER_REVIEW · APPROVED · REJECTED · EXECUTED
statut_remuneration
EN_ATTENTE · ACQUISE · ANNULEE · VERSEE
statut_signalement
OUVERT · EN_COURS · TRAITE · REJETE
statut_ticket
OUVERT · EN_COURS · RESOLU · FERME
statut_troc
PROPOSE · ACCEPTE · SOULTE_EN_ATTENTE · EN_COURS · CONFIRME · EN_LITIGE · ANNULE
statut_verification
EN_ATTENTE · VERIFIEE · REFUSEE
statut_versement
NOT_READY · AWAITING_ADMIN_DECISION · APPROVED · SUBMITTED · SUCCEEDED · FAILED · UNKNOWN
type_cible
ANNONCE · UTILISATEUR · MESSAGE · CONVERSATION
type_commande
ACHAT · TROC_SOULTE
type_ecriture
PAIEMENT_RECU · VERSEMENT_EMIS · REMBOURSEMENT_EMIS · FRAIS_TRANSFERT · REMUNERATION_AFFILIE · CORRECTION
type_notification
MESSAGE_RECU · PROPOSITION_RECUE · COMMANDE_CREEE · PAIEMENT_CONFIRME · CODE_DISPONIBLE · VERSEMENT_EFFECTUE · REMBOURSEMENT_DECIDE · LITIGE_MIS_A_JOUR · VERIFICATION_DECIDEE · PAIEMENT_SIGNALE · PAIEMENT_ECHOUE · PROPOSITION_TROC_RECUE
type_versement
VENDEUR · AFFILIE · REMBOURSEMENT
visibilite
PUBLIEE · MASQUEE · SUSPENDUE
5. Dictionnaire des tables et colonnes
Les définitions de colonnes ci-dessous reprennent les types SQL, valeurs par défaut et propriétés NOT NULL tels qu’ils apparaissent dans CREATE TABLE.
administrateur
Colonne	Définition SQL
utilisateur_id	uuid NOT NULL
role	public.role_admin NOT NULL

affiliation
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
active	boolean DEFAULT true NOT NULL
remuneration_fixe	numeric(12,2) NOT NULL
date_activation	timestamp with time zone
date_modification	timestamp with time zone
annonce_id	uuid NOT NULL

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_affiliation_remuneration_positive CHECK ((remuneration_fixe >= (0)::numeric))
annonce
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
titre	character varying(255) NOT NULL
description	text
etat	public.etat_article NOT NULL
prix	numeric(12,2) NOT NULL
quantite	integer NOT NULL
quartier	character varying(150)
troc_accepte	boolean DEFAULT false NOT NULL
visibilite	public.visibilite NOT NULL
disponibilite	public.disponibilite NOT NULL
date_publication	timestamp with time zone
utilisateur_id	uuid NOT NULL
categorie_id	uuid NOT NULL
categorie_souhaitee_id	uuid
souhait_echange_description	text

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_annonce_prix_positif CHECK ((prix >= (0)::numeric))
•	CONSTRAINT chk_annonce_quantite_positive CHECK ((quantite > 0))
•	CONSTRAINT chk_annonce_souhait_echange CHECK (((troc_accepte = false) OR (categorie_souhaitee_id IS NOT NULL) OR (NULLIF(TRIM(BOTH FROM souhait_echange_description), ''::text) IS NOT NULL)))
attribution_affiliation
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
quantite	integer NOT NULL
prix_base_unitaire	numeric(12,2) NOT NULL
remuneration_unitaire	numeric(12,2) NOT NULL
prix_final_unitaire	numeric(12,2) NOT NULL
statut	public.statut_remuneration DEFAULT 'EN_ATTENTE'::public.statut_remuneration NOT NULL
commande_id	uuid NOT NULL
lien_affiliation_id	uuid NOT NULL
versement_id	uuid

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_attribution_prix_base_positif CHECK ((prix_base_unitaire >= (0)::numeric))
•	CONSTRAINT chk_attribution_prix_final_positif CHECK ((prix_final_unitaire >= (0)::numeric))
•	CONSTRAINT chk_attribution_quantite_positive CHECK ((quantite > 0))
•	CONSTRAINT chk_attribution_remuneration_positive CHECK ((remuneration_unitaire >= (0)::numeric))
categorie
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
nom	character varying(150) NOT NULL
active	boolean DEFAULT true NOT NULL
parent_id	uuid

code_remise
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
code_hash	character varying(255) NOT NULL
tentatives	integer DEFAULT 0 NOT NULL
statut	public.statut_code DEFAULT 'ACTIF'::public.statut_code NOT NULL
date_generation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
date_validation	timestamp with time zone
commande_id	uuid NOT NULL

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_code_remise_tentatives_positives CHECK ((tentatives >= 0))
commande
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
reference	character varying(100) NOT NULL
type	public.type_commande NOT NULL
quantite	integer NOT NULL
prix_unitaire	numeric(12,2) NOT NULL
montant_total	numeric(12,2) NOT NULL
lieu_remise	character varying(255)
heure_remise	timestamp with time zone
statut	public.statut_commande DEFAULT 'CREEE'::public.statut_commande NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
acheteur_id	uuid NOT NULL
vendeur_id	uuid NOT NULL
annonce_id	uuid NOT NULL

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_commande_montant_total_positif CHECK ((montant_total >= (0)::numeric))
•	CONSTRAINT chk_commande_prix_unitaire_positif CHECK ((prix_unitaire >= (0)::numeric))
•	CONSTRAINT chk_commande_quantite_positive CHECK ((quantite > 0))
conversation
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
statut	public.statut_conversation DEFAULT 'ACTIVE'::public.statut_conversation NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
derniere_activite	timestamp with time zone

demande_paiement
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
montant	numeric(12,2) NOT NULL
operateur	public.operateur NOT NULL
statut	public.statut_demande DEFAULT 'EN_ATTENTE'::public.statut_demande NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
commande_id	uuid NOT NULL

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_demande_paiement_montant_positif CHECK ((montant >= (0)::numeric))
ecriture_journal
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
type	public.type_ecriture NOT NULL
sens	public.sens_ecriture NOT NULL
montant	numeric(12,2) NOT NULL
reference	character varying(255) NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
paiement_id	uuid
versement_id	uuid
remboursement_id	uuid
corrige_ecriture_id	uuid

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_ecriture_journal_montant_positif CHECK ((montant >= (0)::numeric))
•	CONSTRAINT chk_ecriture_une_operation CHECK ((num_nonnulls(paiement_id, versement_id, remboursement_id) = 1))
evenement_outbox
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
type	character varying(100) NOT NULL
payload	jsonb NOT NULL
statut	public.statut_evenement DEFAULT 'EN_ATTENTE'::public.statut_evenement NOT NULL
tentatives	integer DEFAULT 0 NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
date_publication	timestamp with time zone

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_evenement_outbox_tentatives_positives CHECK ((tentatives >= 0))
favori
Colonne	Définition SQL
utilisateur_id	uuid NOT NULL
annonce_id	uuid NOT NULL
date_ajout	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL

identite_externe
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
utilisateur_id	uuid NOT NULL
fournisseur	public.fournisseur_auth NOT NULL
identifiant_externe	character varying(255) NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL

journal_audit
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
action	character varying(255) NOT NULL
objet_type	character varying(100) NOT NULL
objet_id	uuid
motif	text
date_action	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
administrateur_id	uuid NOT NULL

lien_affiliation
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
code_unique	character varying(255) NOT NULL
actif	boolean DEFAULT true NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
affiliation_id	uuid NOT NULL
utilisateur_id	uuid NOT NULL

litige
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
motif	text NOT NULL
description	text NOT NULL
decision	text
statut	public.statut_litige DEFAULT 'OUVERT'::public.statut_litige NOT NULL
date_ouverture	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
date_cloture	timestamp with time zone
utilisateur_id	uuid NOT NULL
commande_id	uuid
troc_id	uuid
administrateur_id	uuid

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_litige_cible CHECK ((num_nonnulls(commande_id, troc_id) <= 1))
message
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
contenu	text NOT NULL
date_envoi	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
date_lecture	timestamp with time zone
conversation_id	uuid NOT NULL
utilisateur_id	uuid NOT NULL
annonce_id	uuid

notification
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
type	public.type_notification NOT NULL
contenu	text NOT NULL
lue	boolean DEFAULT false NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
utilisateur_id	uuid NOT NULL

paiement
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
montant	numeric(12,2) NOT NULL
operateur	public.operateur NOT NULL
reference_operateur	character varying(255)
statut	public.statut_paiement DEFAULT 'INITIATED'::public.statut_paiement NOT NULL
cle_idempotence	character varying(255) NOT NULL
date_initiation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
date_confirmation	timestamp with time zone
demande_paiement_id	uuid NOT NULL
administrateur_id	uuid

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_paiement_montant_positif CHECK ((montant >= (0)::numeric))
participant_conversation
Colonne	Définition SQL
conversation_id	uuid NOT NULL
utilisateur_id	uuid NOT NULL
date_entree	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL

photo_annonce
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
cle	character varying(500) NOT NULL
nom_original	character varying(255) NOT NULL
type_mime	character varying(100) NOT NULL
taille	integer NOT NULL
ordre	integer NOT NULL
annonce_id	uuid NOT NULL

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_photo_ordre_positif CHECK ((ordre >= 0))
•	CONSTRAINT chk_photo_taille_positive CHECK ((taille >= 0))
proposition
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
prix_propose	numeric(12,2)
lieu_remise	character varying(255)
heure_remise	timestamp with time zone
statut	public.statut_proposition DEFAULT 'EN_ATTENTE'::public.statut_proposition NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
annonce_id	uuid NOT NULL
conversation_id	uuid NOT NULL
commande_id	uuid

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_proposition_prix_positif CHECK ((prix_propose >= (0)::numeric))
remboursement
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
montant	numeric(12,2) NOT NULL
motif	text NOT NULL
statut	public.statut_remboursement DEFAULT 'REQUESTED'::public.statut_remboursement NOT NULL
date_demande	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
date_decision	timestamp with time zone
commande_id	uuid NOT NULL
paiement_id	uuid
versement_id	uuid
administrateur_id	uuid

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_remboursement_montant_positif CHECK ((montant >= (0)::numeric))
•	CONSTRAINT chk_remboursement_une_reference CHECK ((num_nonnulls(paiement_id, versement_id) = 1))
signalement
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
cible_type	public.type_cible NOT NULL
cible_id	uuid NOT NULL
motif	character varying(255) NOT NULL
description	text
statut	public.statut_signalement DEFAULT 'OUVERT'::public.statut_signalement NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
utilisateur_id	uuid NOT NULL
administrateur_id	uuid

ticket_support
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
sujet	character varying(255) NOT NULL
description	text NOT NULL
statut	public.statut_ticket DEFAULT 'OUVERT'::public.statut_ticket NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
utilisateur_id	uuid NOT NULL
commande_id	uuid
troc_id	uuid

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_ticket_support_cible CHECK (((commande_id IS NOT NULL) OR (troc_id IS NOT NULL)))
troc
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
soulte	numeric(12,2) DEFAULT 0 NOT NULL
payeur_soulte	public.sens_soulte DEFAULT 'AUCUNE'::public.sens_soulte NOT NULL
statut	public.statut_troc DEFAULT 'PROPOSE'::public.statut_troc NOT NULL
lieu_echange	character varying(255)
date_echange	timestamp with time zone
date_confirmation_a	timestamp with time zone
date_confirmation_b	timestamp with time zone
annonce_a_id	uuid NOT NULL
annonce_b_id	uuid NOT NULL
partie_a_id	uuid NOT NULL
partie_b_id	uuid NOT NULL
commande_id	uuid

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_troc_parties_differentes CHECK ((partie_a_id <> partie_b_id))
•	CONSTRAINT chk_troc_soulte_positive CHECK ((soulte >= (0)::numeric))
utilisateur
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
prenom	character varying(100) NOT NULL
nom	character varying(100) NOT NULL
telephone	character varying(30)
email	character varying(255)
date_naissance	date
quartier	character varying(150)
statut	public.statut_compte DEFAULT 'ACTIF'::public.statut_compte NOT NULL
date_creation	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL

Contraintes CHECK définies dans la table :
•	CONSTRAINT ck_utilisateur_nom CHECK ((length(TRIM(BOTH FROM nom)) > 0))
•	CONSTRAINT ck_utilisateur_prenom CHECK ((length(TRIM(BOTH FROM prenom)) > 0))
verification_identite
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
piece_recto_cle	text NOT NULL
piece_recto_nom_original	text NOT NULL
piece_recto_type_mime	character varying(100) NOT NULL
piece_recto_taille	bigint NOT NULL
piece_verso_cle	text NOT NULL
piece_verso_nom_original	text NOT NULL
piece_verso_type_mime	character varying(100) NOT NULL
piece_verso_taille	bigint NOT NULL
selfie_cle	text NOT NULL
selfie_nom_original	text NOT NULL
selfie_type_mime	character varying(100) NOT NULL
selfie_taille	bigint NOT NULL
statut	public.statut_verification DEFAULT 'EN_ATTENTE'::public.statut_verification NOT NULL
motif_refus	text
date_demande	timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
date_decision	timestamp with time zone
utilisateur_id	uuid NOT NULL
administrateur_id	uuid

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_verification_tailles_positives CHECK (((piece_recto_taille >= 0) AND (piece_verso_taille >= 0) AND (selfie_taille >= 0)))
versement
Colonne	Définition SQL
id	uuid DEFAULT gen_random_uuid() NOT NULL
type	public.type_versement NOT NULL
montant	numeric(12,2) NOT NULL
frais_transfert	numeric(12,2) NOT NULL
operateur	public.operateur NOT NULL
numero_beneficiaire	character varying(30) NOT NULL
nom_titulaire	character varying(150) NOT NULL
statut	public.statut_versement DEFAULT 'NOT_READY'::public.statut_versement NOT NULL
reference_transfert	character varying(255)
date_decision	timestamp with time zone
date_transfert	timestamp with time zone
commande_id	uuid NOT NULL
beneficiaire_id	uuid NOT NULL
administrateur_id	uuid

Contraintes CHECK définies dans la table :
•	CONSTRAINT chk_versement_frais_positifs CHECK ((frais_transfert >= (0)::numeric))
•	CONSTRAINT chk_versement_montant_positif CHECK ((montant >= (0)::numeric))
6. Clés primaires et contraintes UNIQUE
Type	Nom	Colonnes
PRIMARY KEY	administrateur_pkey	utilisateur_id
UNIQUE	affiliation_annonce_id_key	annonce_id
PRIMARY KEY	affiliation_pkey	id
PRIMARY KEY	annonce_pkey	id
UNIQUE	attribution_affiliation_commande_id_key	commande_id
PRIMARY KEY	attribution_affiliation_pkey	id
UNIQUE	attribution_affiliation_versement_id_key	versement_id
PRIMARY KEY	categorie_pkey	id
UNIQUE	code_remise_code_hash_key	code_hash
UNIQUE	code_remise_commande_id_key	commande_id
PRIMARY KEY	code_remise_pkey	id
PRIMARY KEY	commande_pkey	id
UNIQUE	commande_reference_key	reference
PRIMARY KEY	conversation_pkey	id
PRIMARY KEY	demande_paiement_pkey	id
PRIMARY KEY	ecriture_journal_pkey	id
PRIMARY KEY	evenement_outbox_pkey	id
PRIMARY KEY	identite_externe_pkey	id
PRIMARY KEY	journal_audit_pkey	id
UNIQUE	lien_affiliation_code_unique_key	code_unique
PRIMARY KEY	lien_affiliation_pkey	id
PRIMARY KEY	litige_pkey	id
PRIMARY KEY	message_pkey	id
PRIMARY KEY	notification_pkey	id
UNIQUE	paiement_cle_idempotence_key	cle_idempotence
PRIMARY KEY	paiement_pkey	id
PRIMARY KEY	photo_annonce_pkey	id
PRIMARY KEY	pk_favori	utilisateur_id, annonce_id
PRIMARY KEY	pk_participant_conversation	conversation_id, utilisateur_id
UNIQUE	proposition_commande_id_key	commande_id
PRIMARY KEY	proposition_pkey	id
UNIQUE	remboursement_paiement_id_key	paiement_id
PRIMARY KEY	remboursement_pkey	id
UNIQUE	remboursement_versement_id_key	versement_id
PRIMARY KEY	signalement_pkey	id
PRIMARY KEY	ticket_support_pkey	id
UNIQUE	troc_commande_id_key	commande_id
PRIMARY KEY	troc_pkey	id
UNIQUE	uq_identite_fournisseur	fournisseur, identifiant_externe
UNIQUE	uq_identite_utilisateur_fournisseur	utilisateur_id, fournisseur
PRIMARY KEY	utilisateur_pkey	id
PRIMARY KEY	verification_identite_pkey	id
PRIMARY KEY	versement_pkey	id

Le dump contient également des index uniques partiels sur utilisateur : uq_utilisateur_email (lower(email), lorsque email n’est pas NULL) et uq_utilisateur_telephone (telephone, lorsque telephone n’est pas NULL).
7. Clés étrangères et règles référentielles
Contrainte	Colonne(s) source	Table cible	Colonne(s) cible	Suppression
fk_administrateur_utilisateur	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
fk_affiliation_annonce	annonce_id	annonce	id	ON DELETE RESTRICT
fk_annonce_categorie	categorie_id	categorie	id	ON DELETE RESTRICT
fk_annonce_categorie_souhaitee	categorie_souhaitee_id	categorie	id	ON DELETE RESTRICT
fk_annonce_utilisateur	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
fk_attribution_commande	commande_id	commande	id	ON DELETE RESTRICT
fk_attribution_lien	lien_affiliation_id	lien_affiliation	id	ON DELETE RESTRICT
fk_attribution_versement	versement_id	versement	id	ON DELETE RESTRICT
fk_categorie_parent	parent_id	categorie	id	ON DELETE RESTRICT
fk_code_remise_commande	commande_id	commande	id	ON DELETE RESTRICT
fk_commande_acheteur	acheteur_id	utilisateur	id	ON DELETE RESTRICT
fk_commande_annonce	annonce_id	annonce	id	ON DELETE RESTRICT
fk_commande_vendeur	vendeur_id	utilisateur	id	ON DELETE RESTRICT
fk_demande_paiement_commande	commande_id	commande	id	ON DELETE RESTRICT
fk_ecriture_journal_correction	corrige_ecriture_id	ecriture_journal	id	ON DELETE RESTRICT
fk_ecriture_paiement	paiement_id	paiement	id	ON DELETE RESTRICT
fk_ecriture_remboursement	remboursement_id	remboursement	id	ON DELETE RESTRICT
fk_ecriture_versement	versement_id	versement	id	ON DELETE RESTRICT
fk_favori_annonce	annonce_id	annonce	id	ON DELETE RESTRICT
fk_favori_utilisateur	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
fk_identite_utilisateur	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
fk_lien_affiliation	affiliation_id	affiliation	id	ON DELETE RESTRICT
fk_lien_utilisateur	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
fk_message_annonce	annonce_id	annonce	id	ON DELETE RESTRICT
fk_message_conversation	conversation_id	conversation	id	ON DELETE RESTRICT
fk_message_utilisateur	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
fk_paiement_administrateur	administrateur_id	administrateur	utilisateur_id	ON DELETE RESTRICT
fk_paiement_demande	demande_paiement_id	demande_paiement	id	ON DELETE RESTRICT
fk_participant_conversation	conversation_id	conversation	id	ON DELETE RESTRICT
fk_participant_utilisateur	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
fk_photo_annonce	annonce_id	annonce	id	ON DELETE RESTRICT
fk_proposition_annonce	annonce_id	annonce	id	ON DELETE RESTRICT
fk_proposition_commande	commande_id	commande	id	ON DELETE RESTRICT
fk_proposition_conversation	conversation_id	conversation	id	ON DELETE RESTRICT
fk_remboursement_administrateur	administrateur_id	administrateur	utilisateur_id	ON DELETE RESTRICT
fk_remboursement_commande	commande_id	commande	id	ON DELETE RESTRICT
fk_remboursement_paiement	paiement_id	paiement	id	ON DELETE RESTRICT
fk_remboursement_versement	versement_id	versement	id	ON DELETE RESTRICT
fk_ticket_support_commande	commande_id	commande	id	ON DELETE RESTRICT
fk_ticket_support_troc	troc_id	troc	id	ON DELETE RESTRICT
fk_troc_annonce_a	annonce_a_id	annonce	id	ON DELETE RESTRICT
fk_troc_annonce_b	annonce_b_id	annonce	id	ON DELETE RESTRICT
fk_troc_commande	commande_id	commande	id	ON DELETE RESTRICT
fk_troc_partie_a	partie_a_id	utilisateur	id	ON DELETE RESTRICT
fk_troc_partie_b	partie_b_id	utilisateur	id	ON DELETE RESTRICT
fk_versement_administrateur	administrateur_id	administrateur	utilisateur_id	ON DELETE RESTRICT
fk_versement_beneficiaire	beneficiaire_id	utilisateur	id	ON DELETE RESTRICT
fk_versement_commande	commande_id	commande	id	ON DELETE RESTRICT
journal_audit_administrateur_id_fkey	administrateur_id	administrateur	utilisateur_id	ON DELETE RESTRICT
litige_administrateur_id_fkey	administrateur_id	administrateur	utilisateur_id	ON DELETE RESTRICT
litige_commande_id_fkey	commande_id	commande	id	ON DELETE RESTRICT
litige_troc_id_fkey	troc_id	troc	id	ON DELETE RESTRICT
litige_utilisateur_id_fkey	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
notification_utilisateur_id_fkey	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
signalement_administrateur_id_fkey	administrateur_id	administrateur	utilisateur_id	ON DELETE RESTRICT
signalement_utilisateur_id_fkey	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
ticket_support_utilisateur_id_fkey	utilisateur_id	utilisateur	id	ON DELETE RESTRICT
verification_identite_administrateur_id_fkey	administrateur_id	administrateur	utilisateur_id	ON DELETE RESTRICT
verification_identite_utilisateur_id_fkey	utilisateur_id	utilisateur	id	ON DELETE RESTRICT

8. Index
Nature	Nom	Table	Colonnes / expression	Filtre
INDEX	idx_annonce_categorie	annonce	categorie_id	
INDEX	idx_annonce_categorie_souhaitee	annonce	categorie_souhaitee_id	
INDEX	idx_annonce_recherche	annonce	visibilite, disponibilite	
INDEX	idx_annonce_utilisateur	annonce	utilisateur_id	
INDEX	idx_attribution_lien	attribution_affiliation	lien_affiliation_id	
INDEX	idx_categorie_parent	categorie	parent_id	
INDEX	idx_commande_acheteur	commande	acheteur_id	
INDEX	idx_commande_annonce	commande	annonce_id	
INDEX	idx_commande_statut	commande	statut	
INDEX	idx_commande_vendeur	commande	vendeur_id	
INDEX	idx_demande_paiement_commande	demande_paiement	commande_id	
INDEX	idx_demande_paiement_statut	demande_paiement	statut	
INDEX	idx_ecriture_journal_correction	ecriture_journal	corrige_ecriture_id	
INDEX	idx_ecriture_paiement	ecriture_journal	paiement_id	
INDEX	idx_ecriture_remboursement	ecriture_journal	remboursement_id	
INDEX	idx_ecriture_versement	ecriture_journal	versement_id	
INDEX	idx_favori_annonce	favori	annonce_id	
INDEX	idx_journal_audit_administrateur	journal_audit	administrateur_id	
INDEX	idx_lien_affiliation_affiliation	lien_affiliation	affiliation_id	
INDEX	idx_lien_affiliation_utilisateur	lien_affiliation	utilisateur_id	
INDEX	idx_litige_administrateur	litige	administrateur_id	
INDEX	idx_litige_commande	litige	commande_id	
INDEX	idx_litige_statut	litige	statut	
INDEX	idx_litige_troc	litige	troc_id	
INDEX	idx_litige_utilisateur	litige	utilisateur_id	
INDEX	idx_message_annonce	message	annonce_id	(annonce_id IS NOT NULL)
INDEX	idx_message_conversation_date	message	conversation_id, date_envoi DESC	
INDEX	idx_message_utilisateur	message	utilisateur_id	
INDEX	idx_notification_utilisateur	notification	utilisateur_id	
INDEX	idx_paiement_administrateur	paiement	administrateur_id	
INDEX	idx_paiement_demande	paiement	demande_paiement_id	
INDEX	idx_paiement_reference_operateur	paiement	reference_operateur	
INDEX	idx_paiement_statut	paiement	statut	
INDEX	idx_participant_utilisateur	participant_conversation	utilisateur_id	
INDEX	idx_photo_annonce	photo_annonce	annonce_id	
INDEX	idx_proposition_annonce	proposition	annonce_id	
INDEX	idx_proposition_conversation	proposition	conversation_id	
INDEX	idx_remboursement_administrateur	remboursement	administrateur_id	
INDEX	idx_remboursement_commande	remboursement	commande_id	
INDEX	idx_remboursement_statut	remboursement	statut	
INDEX	idx_signalement_administrateur	signalement	administrateur_id	
INDEX	idx_signalement_statut	signalement	statut	
INDEX	idx_signalement_utilisateur	signalement	utilisateur_id	
INDEX	idx_ticket_support_commande	ticket_support	commande_id	
INDEX	idx_ticket_support_statut	ticket_support	statut	
INDEX	idx_ticket_support_troc	ticket_support	troc_id	
INDEX	idx_ticket_support_utilisateur	ticket_support	utilisateur_id	
INDEX	idx_troc_annonce_a	troc	annonce_a_id	
INDEX	idx_troc_annonce_b	troc	annonce_b_id	
INDEX	idx_troc_partie_a	troc	partie_a_id	
INDEX	idx_troc_partie_b	troc	partie_b_id	
INDEX	idx_verification_identite_administrateur	verification_identite	administrateur_id	
INDEX	idx_verification_identite_statut	verification_identite	statut	
INDEX	idx_verification_identite_utilisateur	verification_identite	utilisateur_id	
INDEX	idx_versement_administrateur	versement	administrateur_id	
INDEX	idx_versement_beneficiaire	versement	beneficiaire_id	
INDEX	idx_versement_commande	versement	commande_id	
INDEX	idx_versement_statut	versement	statut	
UNIQUE	uq_utilisateur_email	utilisateur	lower((email)::text)	(email IS NOT NULL)
UNIQUE	uq_utilisateur_telephone	utilisateur	telephone	(telephone IS NOT NULL)

9. Règles métier matérialisées dans la base
Domaine	Règle SQL
Annonces	prix >= 0 ; quantite > 0. Si troc_accepte est vrai, une catégorie souhaitée ou une description du souhait d’échange doit être renseignée.
Commandes	quantite > 0 ; prix_unitaire >= 0 ; montant_total >= 0.
Paiements	montant >= 0 ; statut par défaut INITIATED ; cle_idempotence unique.
Versements	montant >= 0 ; frais_transfert >= 0.
Remboursements	montant >= 0 ; exactement un des champs paiement_id et versement_id doit être renseigné ; chaque référence est unique.
Écritures de journal	montant >= 0 ; exactement une opération parmi paiement_id, versement_id et remboursement_id ; correction possible via corrige_ecriture_id.
Trocs	soulte >= 0 ; les deux parties doivent être différentes.
Tickets support	au moins une cible parmi commande_id et troc_id doit être renseignée.
Litiges	au plus une cible parmi commande_id et troc_id ; aucune cible reste autorisée.
Affiliation	remuneration_fixe >= 0 ; une affiliation au maximum par annonce.
Attribution affiliation	quantite > 0 et montants/rémunérations >= 0.
Utilisateur	prenom et nom doivent contenir au moins un caractère non blanc ; email et téléphone sont uniques lorsqu’ils sont renseignés.
Fichiers	tailles de fichiers et ordre des photos ne peuvent pas être négatifs.
Outbox	tentatives >= 0.

10. Description fonctionnelle des tables
Table	Rôle fonctionnel
utilisateur	Compte interne TopDeal et informations de profil.
identite_externe	Association entre un utilisateur interne et son identifiant auprès d’un fournisseur d’authentification externe.
administrateur	Extension d’un utilisateur avec un rôle administratif.
categorie	Catégories hiérarchiques utilisées pour classer les annonces.
annonce	Annonce publiée par un utilisateur, avec prix, quantité, disponibilité et paramètres de troc.
photo_annonce	Métadonnées des images associées à une annonce.
favori	Association entre un utilisateur et une annonce enregistrée en favori.
conversation	Conteneur d’échanges de messages entre utilisateurs.
participant_conversation	Participants associés à une conversation.
message	Message envoyé dans une conversation, éventuellement associé à une annonce.
proposition	Proposition commerciale associée à une annonce et à une conversation, pouvant être reliée à une commande.
commande	Opération d’achat ou commande liée à une soulte de troc.
code_remise	Code associé à une commande pour confirmer la remise.
troc	Échange entre deux annonces et deux parties, avec gestion éventuelle d’une soulte.
demande_paiement	Demande de paiement associée à une commande et à un opérateur.
paiement	Paiement initié pour une demande de paiement.
versement	Versement vers un bénéficiaire, avec frais de transfert et opérateur.
remboursement	Remboursement associé à une commande et à exactement un paiement ou versement.
ecriture_journal	Écriture financière rattachée à un paiement, versement ou remboursement, avec possibilité de correction.
affiliation	Configuration d’affiliation associée à une annonce.
lien_affiliation	Lien/code de suivi d’affiliation créé pour un utilisateur.
attribution_affiliation	Attribution d’une vente ou rémunération à un lien d’affiliation et à une commande.
verification_identite	Dossier de vérification d’identité et métadonnées des pièces justificatives.
litige	Dossier de litige ouvert par un utilisateur, ciblant facultativement une commande ou un troc.
ticket_support	Demande de support associée à un utilisateur et à une commande ou un troc.
signalement	Signalement d’une cible polymorphe identifiée par type et UUID.
notification	Notification destinée à un utilisateur.
journal_audit	Trace d’une action administrative.
evenement_outbox	Événement à publier de manière différée, avec statut et compteur de tentatives.

11. Points d’attention pour l’application
•	Les contraintes SQL protègent les invariants stockés en base, mais les transitions de statuts doivent également être contrôlées dans les cas d’usage applicatifs.
•	La cible de signalement est polymorphe (cible_type + cible_id) : la base ne peut pas garantir par une clé étrangère unique que cible_id existe dans la table correspondant à cible_type. Cette validation relève de la logique applicative ou d’un mécanisme dédié.
•	Les champs d’identification de fichier stockent des clés et métadonnées ; le contenu binaire doit rester dans le système de stockage prévu par l’application.
•	La table evenement_outbox permet de séparer l’écriture métier de la publication d’événements. Un worker applicatif doit traiter les événements en attente et gérer les tentatives.
•	Les rôles administratifs sont persistés dans administrateur ; les autorisations fines doivent être appliquées par l’application si elles ne sont pas représentées dans ce schéma.
•	Les règles de cohérence entre le type de commande, les annonces, les parties d’un troc et les montants doivent être vérifiées dans les cas d’usage transactionnels.
12. Vérifications de qualité effectuées pendant la construction
•	Vérification des types ENUM et correction des valeurs de statut convenues.
•	Vérification des clés étrangères et uniformisation de ON DELETE RESTRICT.
•	Vérification des index de support des clés étrangères.
•	Ajout et vérification de contraintes CHECK sur les montants, quantités, tailles et règles métier.
•	Vérification qu’aucune contrainte n’est non validée.
•	Vérification qu’aucun index n’est invalide ou non prêt.
13. Limites de cette documentation
Ce document décrit le schéma DDL exporté. Il ne contient pas les données métier, les secrets, les comptes PostgreSQL, les droits d’accès complets, ni le code applicatif. Il ne remplace pas les spécifications fonctionnelles et ne prouve pas à lui seul que toutes les règles métier transversales sont appliquées par l’application.
Le fichier source indique un export réalisé avec pg_dump 18.1 depuis PostgreSQL 18.1. Les éventuelles modifications réalisées après cet export ne sont pas représentées.
