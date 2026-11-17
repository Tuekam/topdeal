-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "disponibilite" AS ENUM ('DISPONIBLE', 'INDISPONIBLE', 'EPUISEE');

-- CreateEnum
CREATE TYPE "etat_article" AS ENUM ('NEUF', 'OCCASION');

-- CreateEnum
CREATE TYPE "fournisseur_auth" AS ENUM ('FIREBASE');

-- CreateEnum
CREATE TYPE "operateur" AS ENUM ('MTN_MOMO', 'ORANGE_MONEY');

-- CreateEnum
CREATE TYPE "role_admin" AS ENUM ('SUPER_ADMIN', 'MODERATEUR', 'FINANCIER');

-- CreateEnum
CREATE TYPE "sens_ecriture" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "sens_soulte" AS ENUM ('PARTIE_A_PAIE', 'PARTIE_B_PAIE', 'AUCUNE');

-- CreateEnum
CREATE TYPE "statut_code" AS ENUM ('ACTIF', 'UTILISE', 'BLOQUE');

-- CreateEnum
CREATE TYPE "statut_commande" AS ENUM ('CREEE', 'EN_ATTENTE_PAIEMENT', 'PAYEE', 'CODE_VALIDE', 'TERMINEE', 'ANNULEE', 'REMBOURSEE', 'EN_LITIGE');

-- CreateEnum
CREATE TYPE "statut_compte" AS ENUM ('ACTIF', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "statut_conversation" AS ENUM ('ACTIVE', 'ARCHIVEE');

-- CreateEnum
CREATE TYPE "statut_demande" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "statut_evenement" AS ENUM ('EN_ATTENTE', 'PUBLIE', 'ECHEC');

-- CreateEnum
CREATE TYPE "statut_litige" AS ENUM ('OUVERT', 'EN_EXAMEN', 'TRANCHE', 'CLOS');

-- CreateEnum
CREATE TYPE "statut_paiement" AS ENUM ('INITIATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "statut_proposition" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "statut_remboursement" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXECUTED');

-- CreateEnum
CREATE TYPE "statut_remuneration" AS ENUM ('EN_ATTENTE', 'ACQUISE', 'ANNULEE', 'VERSEE');

-- CreateEnum
CREATE TYPE "statut_signalement" AS ENUM ('OUVERT', 'EN_COURS', 'TRAITE', 'REJETE');

-- CreateEnum
CREATE TYPE "statut_ticket" AS ENUM ('OUVERT', 'EN_COURS', 'RESOLU', 'FERME');

-- CreateEnum
CREATE TYPE "statut_troc" AS ENUM ('PROPOSE', 'ACCEPTE', 'SOULTE_EN_ATTENTE', 'EN_COURS', 'CONFIRME', 'EN_LITIGE', 'ANNULE');

-- CreateEnum
CREATE TYPE "statut_verification" AS ENUM ('EN_ATTENTE', 'VERIFIEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "statut_versement" AS ENUM ('NOT_READY', 'AWAITING_ADMIN_DECISION', 'APPROVED', 'SUBMITTED', 'SUCCEEDED', 'FAILED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "type_cible" AS ENUM ('ANNONCE', 'UTILISATEUR', 'MESSAGE', 'CONVERSATION');

-- CreateEnum
CREATE TYPE "type_commande" AS ENUM ('ACHAT', 'TROC_SOULTE');

-- CreateEnum
CREATE TYPE "type_ecriture" AS ENUM ('PAIEMENT_RECU', 'VERSEMENT_EMIS', 'REMBOURSEMENT_EMIS', 'FRAIS_TRANSFERT', 'REMUNERATION_AFFILIE', 'CORRECTION');

-- CreateEnum
CREATE TYPE "type_notification" AS ENUM ('MESSAGE_RECU', 'PROPOSITION_RECUE', 'COMMANDE_CREEE', 'PAIEMENT_CONFIRME', 'CODE_DISPONIBLE', 'VERSEMENT_EFFECTUE', 'REMBOURSEMENT_DECIDE', 'LITIGE_MIS_A_JOUR', 'VERIFICATION_DECIDEE', 'PAIEMENT_SIGNALE', 'PAIEMENT_ECHOUE', 'PROPOSITION_TROC_RECUE');

-- CreateEnum
CREATE TYPE "type_versement" AS ENUM ('VENDEUR', 'AFFILIE', 'REMBOURSEMENT');

-- CreateEnum
CREATE TYPE "visibilite" AS ENUM ('PUBLIEE', 'MASQUEE', 'SUSPENDUE');

-- CreateTable
CREATE TABLE "administrateur" (
    "utilisateur_id" UUID NOT NULL,
    "role" "role_admin" NOT NULL,

    CONSTRAINT "administrateur_pkey" PRIMARY KEY ("utilisateur_id")
);

-- CreateTable
CREATE TABLE "affiliation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "remuneration_fixe" DECIMAL(12,2) NOT NULL,
    "date_activation" TIMESTAMPTZ(6),
    "date_modification" TIMESTAMPTZ(6),
    "annonce_id" UUID NOT NULL,

    CONSTRAINT "affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annonce" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "etat" "etat_article" NOT NULL,
    "prix" DECIMAL(12,2) NOT NULL,
    "quantite" INTEGER NOT NULL,
    "quartier" VARCHAR(150),
    "troc_accepte" BOOLEAN NOT NULL DEFAULT false,
    "visibilite" "visibilite" NOT NULL,
    "disponibilite" "disponibilite" NOT NULL,
    "date_publication" TIMESTAMPTZ(6),
    "utilisateur_id" UUID NOT NULL,
    "categorie_id" UUID NOT NULL,
    "categorie_souhaitee_id" UUID,
    "souhait_echange_description" TEXT,

    CONSTRAINT "annonce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribution_affiliation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quantite" INTEGER NOT NULL,
    "prix_base_unitaire" DECIMAL(12,2) NOT NULL,
    "remuneration_unitaire" DECIMAL(12,2) NOT NULL,
    "prix_final_unitaire" DECIMAL(12,2) NOT NULL,
    "statut" "statut_remuneration" NOT NULL DEFAULT 'EN_ATTENTE',
    "commande_id" UUID NOT NULL,
    "lien_affiliation_id" UUID NOT NULL,
    "versement_id" UUID,

    CONSTRAINT "attribution_affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorie" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" VARCHAR(150) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" UUID,

    CONSTRAINT "categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_remise" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code_hash" VARCHAR(255) NOT NULL,
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "statut" "statut_code" NOT NULL DEFAULT 'ACTIF',
    "date_generation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMPTZ(6),
    "commande_id" UUID NOT NULL,

    CONSTRAINT "code_remise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commande" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reference" VARCHAR(100) NOT NULL,
    "type" "type_commande" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_unitaire" DECIMAL(12,2) NOT NULL,
    "montant_total" DECIMAL(12,2) NOT NULL,
    "lieu_remise" VARCHAR(255),
    "heure_remise" TIMESTAMPTZ(6),
    "statut" "statut_commande" NOT NULL DEFAULT 'CREEE',
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acheteur_id" UUID NOT NULL,
    "vendeur_id" UUID NOT NULL,
    "annonce_id" UUID NOT NULL,

    CONSTRAINT "commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "statut" "statut_conversation" NOT NULL DEFAULT 'ACTIVE',
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniere_activite" TIMESTAMPTZ(6),

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demande_paiement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "montant" DECIMAL(12,2) NOT NULL,
    "operateur" "operateur" NOT NULL,
    "statut" "statut_demande" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commande_id" UUID NOT NULL,

    CONSTRAINT "demande_paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecriture_journal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "type_ecriture" NOT NULL,
    "sens" "sens_ecriture" NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "reference" VARCHAR(255) NOT NULL,
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paiement_id" UUID,
    "versement_id" UUID,
    "remboursement_id" UUID,
    "corrige_ecriture_id" UUID,

    CONSTRAINT "ecriture_journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenement_outbox" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "statut" "statut_evenement" NOT NULL DEFAULT 'EN_ATTENTE',
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_publication" TIMESTAMPTZ(6),

    CONSTRAINT "evenement_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favori" (
    "utilisateur_id" UUID NOT NULL,
    "annonce_id" UUID NOT NULL,
    "date_ajout" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_favori" PRIMARY KEY ("utilisateur_id","annonce_id")
);

-- CreateTable
CREATE TABLE "identite_externe" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "utilisateur_id" UUID NOT NULL,
    "fournisseur" "fournisseur_auth" NOT NULL,
    "identifiant_externe" VARCHAR(255) NOT NULL,
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identite_externe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_audit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" VARCHAR(255) NOT NULL,
    "objet_type" VARCHAR(100) NOT NULL,
    "objet_id" UUID,
    "motif" TEXT,
    "date_action" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "administrateur_id" UUID NOT NULL,

    CONSTRAINT "journal_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lien_affiliation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code_unique" VARCHAR(255) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "affiliation_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,

    CONSTRAINT "lien_affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litige" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "motif" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "decision" TEXT,
    "statut" "statut_litige" NOT NULL DEFAULT 'OUVERT',
    "date_ouverture" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_cloture" TIMESTAMPTZ(6),
    "utilisateur_id" UUID NOT NULL,
    "commande_id" UUID,
    "troc_id" UUID,
    "administrateur_id" UUID,

    CONSTRAINT "litige_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contenu" TEXT NOT NULL,
    "date_envoi" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_lecture" TIMESTAMPTZ(6),
    "conversation_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "annonce_id" UUID,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "type_notification" NOT NULL,
    "contenu" TEXT NOT NULL,
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateur_id" UUID NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "montant" DECIMAL(12,2) NOT NULL,
    "operateur" "operateur" NOT NULL,
    "reference_operateur" VARCHAR(255),
    "statut" "statut_paiement" NOT NULL DEFAULT 'INITIATED',
    "cle_idempotence" VARCHAR(255) NOT NULL,
    "date_initiation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_confirmation" TIMESTAMPTZ(6),
    "demande_paiement_id" UUID NOT NULL,
    "administrateur_id" UUID,

    CONSTRAINT "paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participant_conversation" (
    "conversation_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "date_entree" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_participant_conversation" PRIMARY KEY ("conversation_id","utilisateur_id")
);

-- CreateTable
CREATE TABLE "photo_annonce" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cle" VARCHAR(500) NOT NULL,
    "nom_original" VARCHAR(255) NOT NULL,
    "type_mime" VARCHAR(100) NOT NULL,
    "taille" INTEGER NOT NULL,
    "ordre" INTEGER NOT NULL,
    "annonce_id" UUID NOT NULL,

    CONSTRAINT "photo_annonce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prix_propose" DECIMAL(12,2),
    "lieu_remise" VARCHAR(255),
    "heure_remise" TIMESTAMPTZ(6),
    "statut" "statut_proposition" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "annonce_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "commande_id" UUID,

    CONSTRAINT "proposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remboursement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "montant" DECIMAL(12,2) NOT NULL,
    "motif" TEXT NOT NULL,
    "statut" "statut_remboursement" NOT NULL DEFAULT 'REQUESTED',
    "date_demande" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_decision" TIMESTAMPTZ(6),
    "commande_id" UUID NOT NULL,
    "paiement_id" UUID,
    "versement_id" UUID,
    "administrateur_id" UUID,

    CONSTRAINT "remboursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signalement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cible_type" "type_cible" NOT NULL,
    "cible_id" UUID NOT NULL,
    "motif" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "statut" "statut_signalement" NOT NULL DEFAULT 'OUVERT',
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateur_id" UUID NOT NULL,
    "administrateur_id" UUID,

    CONSTRAINT "signalement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_support" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sujet" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "statut" "statut_ticket" NOT NULL DEFAULT 'OUVERT',
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateur_id" UUID NOT NULL,
    "commande_id" UUID,
    "troc_id" UUID,

    CONSTRAINT "ticket_support_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "troc" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "soulte" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payeur_soulte" "sens_soulte" NOT NULL DEFAULT 'AUCUNE',
    "statut" "statut_troc" NOT NULL DEFAULT 'PROPOSE',
    "lieu_echange" VARCHAR(255),
    "date_echange" TIMESTAMPTZ(6),
    "date_confirmation_a" TIMESTAMPTZ(6),
    "date_confirmation_b" TIMESTAMPTZ(6),
    "annonce_a_id" UUID NOT NULL,
    "annonce_b_id" UUID NOT NULL,
    "partie_a_id" UUID NOT NULL,
    "partie_b_id" UUID NOT NULL,
    "commande_id" UUID,

    CONSTRAINT "troc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prenom" VARCHAR(100) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "telephone" VARCHAR(30),
    "email" VARCHAR(255),
    "date_naissance" DATE,
    "quartier" VARCHAR(150),
    "statut" "statut_compte" NOT NULL DEFAULT 'ACTIF',
    "date_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_identite" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "piece_recto_cle" TEXT NOT NULL,
    "piece_recto_nom_original" TEXT NOT NULL,
    "piece_recto_type_mime" VARCHAR(100) NOT NULL,
    "piece_recto_taille" BIGINT NOT NULL,
    "piece_verso_cle" TEXT NOT NULL,
    "piece_verso_nom_original" TEXT NOT NULL,
    "piece_verso_type_mime" VARCHAR(100) NOT NULL,
    "piece_verso_taille" BIGINT NOT NULL,
    "selfie_cle" TEXT NOT NULL,
    "selfie_nom_original" TEXT NOT NULL,
    "selfie_type_mime" VARCHAR(100) NOT NULL,
    "selfie_taille" BIGINT NOT NULL,
    "statut" "statut_verification" NOT NULL DEFAULT 'EN_ATTENTE',
    "motif_refus" TEXT,
    "date_demande" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_decision" TIMESTAMPTZ(6),
    "utilisateur_id" UUID NOT NULL,
    "administrateur_id" UUID,

    CONSTRAINT "verification_identite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "versement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "type_versement" NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "frais_transfert" DECIMAL(12,2) NOT NULL,
    "operateur" "operateur" NOT NULL,
    "numero_beneficiaire" VARCHAR(30) NOT NULL,
    "nom_titulaire" VARCHAR(150) NOT NULL,
    "statut" "statut_versement" NOT NULL DEFAULT 'NOT_READY',
    "reference_transfert" VARCHAR(255),
    "date_decision" TIMESTAMPTZ(6),
    "date_transfert" TIMESTAMPTZ(6),
    "commande_id" UUID NOT NULL,
    "beneficiaire_id" UUID NOT NULL,
    "administrateur_id" UUID,

    CONSTRAINT "versement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliation_annonce_id_key" ON "affiliation"("annonce_id");

-- CreateIndex
CREATE INDEX "idx_annonce_categorie" ON "annonce"("categorie_id");

-- CreateIndex
CREATE INDEX "idx_annonce_categorie_souhaitee" ON "annonce"("categorie_souhaitee_id");

-- CreateIndex
CREATE INDEX "idx_annonce_recherche" ON "annonce"("visibilite", "disponibilite");

-- CreateIndex
CREATE INDEX "idx_annonce_utilisateur" ON "annonce"("utilisateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "attribution_affiliation_commande_id_key" ON "attribution_affiliation"("commande_id");

-- CreateIndex
CREATE UNIQUE INDEX "attribution_affiliation_versement_id_key" ON "attribution_affiliation"("versement_id");

-- CreateIndex
CREATE INDEX "idx_attribution_lien" ON "attribution_affiliation"("lien_affiliation_id");

-- CreateIndex
CREATE INDEX "idx_categorie_parent" ON "categorie"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "code_remise_code_hash_key" ON "code_remise"("code_hash");

-- CreateIndex
CREATE UNIQUE INDEX "code_remise_commande_id_key" ON "code_remise"("commande_id");

-- CreateIndex
CREATE UNIQUE INDEX "commande_reference_key" ON "commande"("reference");

-- CreateIndex
CREATE INDEX "idx_commande_acheteur" ON "commande"("acheteur_id");

-- CreateIndex
CREATE INDEX "idx_commande_annonce" ON "commande"("annonce_id");

-- CreateIndex
CREATE INDEX "idx_commande_statut" ON "commande"("statut");

-- CreateIndex
CREATE INDEX "idx_commande_vendeur" ON "commande"("vendeur_id");

-- CreateIndex
CREATE INDEX "idx_demande_paiement_commande" ON "demande_paiement"("commande_id");

-- CreateIndex
CREATE INDEX "idx_demande_paiement_statut" ON "demande_paiement"("statut");

-- CreateIndex
CREATE INDEX "idx_ecriture_journal_correction" ON "ecriture_journal"("corrige_ecriture_id");

-- CreateIndex
CREATE INDEX "idx_ecriture_paiement" ON "ecriture_journal"("paiement_id");

-- CreateIndex
CREATE INDEX "idx_ecriture_remboursement" ON "ecriture_journal"("remboursement_id");

-- CreateIndex
CREATE INDEX "idx_ecriture_versement" ON "ecriture_journal"("versement_id");

-- CreateIndex
CREATE INDEX "idx_favori_annonce" ON "favori"("annonce_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_identite_fournisseur" ON "identite_externe"("fournisseur", "identifiant_externe");

-- CreateIndex
CREATE UNIQUE INDEX "uq_identite_utilisateur_fournisseur" ON "identite_externe"("utilisateur_id", "fournisseur");

-- CreateIndex
CREATE INDEX "idx_journal_audit_administrateur" ON "journal_audit"("administrateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "lien_affiliation_code_unique_key" ON "lien_affiliation"("code_unique");

-- CreateIndex
CREATE INDEX "idx_lien_affiliation_affiliation" ON "lien_affiliation"("affiliation_id");

-- CreateIndex
CREATE INDEX "idx_lien_affiliation_utilisateur" ON "lien_affiliation"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_litige_administrateur" ON "litige"("administrateur_id");

-- CreateIndex
CREATE INDEX "idx_litige_commande" ON "litige"("commande_id");

-- CreateIndex
CREATE INDEX "idx_litige_statut" ON "litige"("statut");

-- CreateIndex
CREATE INDEX "idx_litige_troc" ON "litige"("troc_id");

-- CreateIndex
CREATE INDEX "idx_litige_utilisateur" ON "litige"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_message_annonce" ON "message"("annonce_id") WHERE (annonce_id IS NOT NULL);

-- CreateIndex
CREATE INDEX "idx_message_conversation_date" ON "message"("conversation_id", "date_envoi" DESC);

-- CreateIndex
CREATE INDEX "idx_message_utilisateur" ON "message"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_notification_utilisateur" ON "notification"("utilisateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "paiement_cle_idempotence_key" ON "paiement"("cle_idempotence");

-- CreateIndex
CREATE INDEX "idx_paiement_administrateur" ON "paiement"("administrateur_id");

-- CreateIndex
CREATE INDEX "idx_paiement_demande" ON "paiement"("demande_paiement_id");

-- CreateIndex
CREATE INDEX "idx_paiement_reference_operateur" ON "paiement"("reference_operateur");

-- CreateIndex
CREATE INDEX "idx_paiement_statut" ON "paiement"("statut");

-- CreateIndex
CREATE INDEX "idx_participant_utilisateur" ON "participant_conversation"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_photo_annonce" ON "photo_annonce"("annonce_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposition_commande_id_key" ON "proposition"("commande_id");

-- CreateIndex
CREATE INDEX "idx_proposition_annonce" ON "proposition"("annonce_id");

-- CreateIndex
CREATE INDEX "idx_proposition_conversation" ON "proposition"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "remboursement_paiement_id_key" ON "remboursement"("paiement_id");

-- CreateIndex
CREATE UNIQUE INDEX "remboursement_versement_id_key" ON "remboursement"("versement_id");

-- CreateIndex
CREATE INDEX "idx_remboursement_administrateur" ON "remboursement"("administrateur_id");

-- CreateIndex
CREATE INDEX "idx_remboursement_commande" ON "remboursement"("commande_id");

-- CreateIndex
CREATE INDEX "idx_remboursement_statut" ON "remboursement"("statut");

-- CreateIndex
CREATE INDEX "idx_signalement_administrateur" ON "signalement"("administrateur_id");

-- CreateIndex
CREATE INDEX "idx_signalement_statut" ON "signalement"("statut");

-- CreateIndex
CREATE INDEX "idx_signalement_utilisateur" ON "signalement"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_ticket_support_commande" ON "ticket_support"("commande_id");

-- CreateIndex
CREATE INDEX "idx_ticket_support_statut" ON "ticket_support"("statut");

-- CreateIndex
CREATE INDEX "idx_ticket_support_troc" ON "ticket_support"("troc_id");

-- CreateIndex
CREATE INDEX "idx_ticket_support_utilisateur" ON "ticket_support"("utilisateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "troc_commande_id_key" ON "troc"("commande_id");

-- CreateIndex
CREATE INDEX "idx_troc_annonce_a" ON "troc"("annonce_a_id");

-- CreateIndex
CREATE INDEX "idx_troc_annonce_b" ON "troc"("annonce_b_id");

-- CreateIndex
CREATE INDEX "idx_troc_partie_a" ON "troc"("partie_a_id");

-- CreateIndex
CREATE INDEX "idx_troc_partie_b" ON "troc"("partie_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_utilisateur_telephone" ON "utilisateur"("telephone") WHERE (telephone IS NOT NULL);

-- CreateIndex
CREATE INDEX "idx_verification_identite_administrateur" ON "verification_identite"("administrateur_id");

-- CreateIndex
CREATE INDEX "idx_verification_identite_statut" ON "verification_identite"("statut");

-- CreateIndex
CREATE INDEX "idx_verification_identite_utilisateur" ON "verification_identite"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_versement_administrateur" ON "versement"("administrateur_id");

-- CreateIndex
CREATE INDEX "idx_versement_beneficiaire" ON "versement"("beneficiaire_id");

-- CreateIndex
CREATE INDEX "idx_versement_commande" ON "versement"("commande_id");

-- CreateIndex
CREATE INDEX "idx_versement_statut" ON "versement"("statut");

-- AddForeignKey
ALTER TABLE "administrateur" ADD CONSTRAINT "fk_administrateur_utilisateur" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "affiliation" ADD CONSTRAINT "fk_affiliation_annonce" FOREIGN KEY ("annonce_id") REFERENCES "annonce"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "annonce" ADD CONSTRAINT "fk_annonce_categorie" FOREIGN KEY ("categorie_id") REFERENCES "categorie"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "annonce" ADD CONSTRAINT "fk_annonce_categorie_souhaitee" FOREIGN KEY ("categorie_souhaitee_id") REFERENCES "categorie"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "annonce" ADD CONSTRAINT "fk_annonce_utilisateur" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attribution_affiliation" ADD CONSTRAINT "fk_attribution_commande" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attribution_affiliation" ADD CONSTRAINT "fk_attribution_lien" FOREIGN KEY ("lien_affiliation_id") REFERENCES "lien_affiliation"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attribution_affiliation" ADD CONSTRAINT "fk_attribution_versement" FOREIGN KEY ("versement_id") REFERENCES "versement"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categorie" ADD CONSTRAINT "fk_categorie_parent" FOREIGN KEY ("parent_id") REFERENCES "categorie"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "code_remise" ADD CONSTRAINT "fk_code_remise_commande" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commande" ADD CONSTRAINT "fk_commande_acheteur" FOREIGN KEY ("acheteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commande" ADD CONSTRAINT "fk_commande_annonce" FOREIGN KEY ("annonce_id") REFERENCES "annonce"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commande" ADD CONSTRAINT "fk_commande_vendeur" FOREIGN KEY ("vendeur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "demande_paiement" ADD CONSTRAINT "fk_demande_paiement_commande" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ecriture_journal" ADD CONSTRAINT "fk_ecriture_journal_correction" FOREIGN KEY ("corrige_ecriture_id") REFERENCES "ecriture_journal"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ecriture_journal" ADD CONSTRAINT "fk_ecriture_paiement" FOREIGN KEY ("paiement_id") REFERENCES "paiement"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ecriture_journal" ADD CONSTRAINT "fk_ecriture_remboursement" FOREIGN KEY ("remboursement_id") REFERENCES "remboursement"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ecriture_journal" ADD CONSTRAINT "fk_ecriture_versement" FOREIGN KEY ("versement_id") REFERENCES "versement"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favori" ADD CONSTRAINT "fk_favori_annonce" FOREIGN KEY ("annonce_id") REFERENCES "annonce"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favori" ADD CONSTRAINT "fk_favori_utilisateur" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "identite_externe" ADD CONSTRAINT "fk_identite_utilisateur" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "journal_audit" ADD CONSTRAINT "journal_audit_administrateur_id_fkey" FOREIGN KEY ("administrateur_id") REFERENCES "administrateur"("utilisateur_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_affiliation" ADD CONSTRAINT "fk_lien_affiliation" FOREIGN KEY ("affiliation_id") REFERENCES "affiliation"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_affiliation" ADD CONSTRAINT "fk_lien_utilisateur" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "litige" ADD CONSTRAINT "litige_administrateur_id_fkey" FOREIGN KEY ("administrateur_id") REFERENCES "administrateur"("utilisateur_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "litige" ADD CONSTRAINT "litige_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "litige" ADD CONSTRAINT "litige_troc_id_fkey" FOREIGN KEY ("troc_id") REFERENCES "troc"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "litige" ADD CONSTRAINT "litige_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "fk_message_annonce" FOREIGN KEY ("annonce_id") REFERENCES "annonce"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "fk_message_conversation" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "fk_message_utilisateur" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "fk_paiement_administrateur" FOREIGN KEY ("administrateur_id") REFERENCES "administrateur"("utilisateur_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "fk_paiement_demande" FOREIGN KEY ("demande_paiement_id") REFERENCES "demande_paiement"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participant_conversation" ADD CONSTRAINT "fk_participant_conversation" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participant_conversation" ADD CONSTRAINT "fk_participant_utilisateur" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_annonce" ADD CONSTRAINT "fk_photo_annonce" FOREIGN KEY ("annonce_id") REFERENCES "annonce"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposition" ADD CONSTRAINT "fk_proposition_annonce" FOREIGN KEY ("annonce_id") REFERENCES "annonce"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposition" ADD CONSTRAINT "fk_proposition_commande" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposition" ADD CONSTRAINT "fk_proposition_conversation" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "remboursement" ADD CONSTRAINT "fk_remboursement_administrateur" FOREIGN KEY ("administrateur_id") REFERENCES "administrateur"("utilisateur_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "remboursement" ADD CONSTRAINT "fk_remboursement_commande" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "remboursement" ADD CONSTRAINT "fk_remboursement_paiement" FOREIGN KEY ("paiement_id") REFERENCES "paiement"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "remboursement" ADD CONSTRAINT "fk_remboursement_versement" FOREIGN KEY ("versement_id") REFERENCES "versement"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_administrateur_id_fkey" FOREIGN KEY ("administrateur_id") REFERENCES "administrateur"("utilisateur_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_support" ADD CONSTRAINT "fk_ticket_support_commande" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_support" ADD CONSTRAINT "fk_ticket_support_troc" FOREIGN KEY ("troc_id") REFERENCES "troc"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_support" ADD CONSTRAINT "ticket_support_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "troc" ADD CONSTRAINT "fk_troc_annonce_a" FOREIGN KEY ("annonce_a_id") REFERENCES "annonce"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "troc" ADD CONSTRAINT "fk_troc_annonce_b" FOREIGN KEY ("annonce_b_id") REFERENCES "annonce"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "troc" ADD CONSTRAINT "fk_troc_commande" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "troc" ADD CONSTRAINT "fk_troc_partie_a" FOREIGN KEY ("partie_a_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "troc" ADD CONSTRAINT "fk_troc_partie_b" FOREIGN KEY ("partie_b_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "verification_identite" ADD CONSTRAINT "verification_identite_administrateur_id_fkey" FOREIGN KEY ("administrateur_id") REFERENCES "administrateur"("utilisateur_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "verification_identite" ADD CONSTRAINT "verification_identite_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "versement" ADD CONSTRAINT "fk_versement_administrateur" FOREIGN KEY ("administrateur_id") REFERENCES "administrateur"("utilisateur_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "versement" ADD CONSTRAINT "fk_versement_beneficiaire" FOREIGN KEY ("beneficiaire_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "versement" ADD CONSTRAINT "fk_versement_commande" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Preserve PostgreSQL constraints that Prisma Schema cannot represent.
ALTER TABLE "affiliation" ADD CONSTRAINT "chk_affiliation_remuneration_positive" CHECK ((remuneration_fixe >= (0)::numeric));
ALTER TABLE "annonce" ADD CONSTRAINT "chk_annonce_prix_positif" CHECK ((prix >= (0)::numeric));
ALTER TABLE "annonce" ADD CONSTRAINT "chk_annonce_quantite_positive" CHECK ((quantite > 0));
ALTER TABLE "annonce" ADD CONSTRAINT "chk_annonce_souhait_echange" CHECK (((troc_accepte = false) OR (categorie_souhaitee_id IS NOT NULL) OR (NULLIF(TRIM(BOTH FROM souhait_echange_description), ''::text) IS NOT NULL)));
ALTER TABLE "attribution_affiliation" ADD CONSTRAINT "chk_attribution_prix_base_positif" CHECK ((prix_base_unitaire >= (0)::numeric));
ALTER TABLE "attribution_affiliation" ADD CONSTRAINT "chk_attribution_prix_final_positif" CHECK ((prix_final_unitaire >= (0)::numeric));
ALTER TABLE "attribution_affiliation" ADD CONSTRAINT "chk_attribution_quantite_positive" CHECK ((quantite > 0));
ALTER TABLE "attribution_affiliation" ADD CONSTRAINT "chk_attribution_remuneration_positive" CHECK ((remuneration_unitaire >= (0)::numeric));
ALTER TABLE "code_remise" ADD CONSTRAINT "chk_code_remise_tentatives_positives" CHECK ((tentatives >= 0));
ALTER TABLE "commande" ADD CONSTRAINT "chk_commande_montant_total_positif" CHECK ((montant_total >= (0)::numeric));
ALTER TABLE "commande" ADD CONSTRAINT "chk_commande_prix_unitaire_positif" CHECK ((prix_unitaire >= (0)::numeric));
ALTER TABLE "commande" ADD CONSTRAINT "chk_commande_quantite_positive" CHECK ((quantite > 0));
ALTER TABLE "demande_paiement" ADD CONSTRAINT "chk_demande_paiement_montant_positif" CHECK ((montant >= (0)::numeric));
ALTER TABLE "ecriture_journal" ADD CONSTRAINT "chk_ecriture_journal_montant_positif" CHECK ((montant >= (0)::numeric));
ALTER TABLE "ecriture_journal" ADD CONSTRAINT "chk_ecriture_une_operation" CHECK ((num_nonnulls(paiement_id, versement_id, remboursement_id) = 1));
ALTER TABLE "evenement_outbox" ADD CONSTRAINT "chk_evenement_outbox_tentatives_positives" CHECK ((tentatives >= 0));
ALTER TABLE "litige" ADD CONSTRAINT "chk_litige_cible" CHECK ((num_nonnulls(commande_id, troc_id) <= 1));
ALTER TABLE "paiement" ADD CONSTRAINT "chk_paiement_montant_positif" CHECK ((montant >= (0)::numeric));
ALTER TABLE "photo_annonce" ADD CONSTRAINT "chk_photo_ordre_positif" CHECK ((ordre >= 0));
ALTER TABLE "photo_annonce" ADD CONSTRAINT "chk_photo_taille_positive" CHECK ((taille >= 0));
ALTER TABLE "proposition" ADD CONSTRAINT "chk_proposition_prix_positif" CHECK ((prix_propose >= (0)::numeric));
ALTER TABLE "remboursement" ADD CONSTRAINT "chk_remboursement_montant_positif" CHECK ((montant >= (0)::numeric));
ALTER TABLE "remboursement" ADD CONSTRAINT "chk_remboursement_une_reference" CHECK ((num_nonnulls(paiement_id, versement_id) = 1));
ALTER TABLE "ticket_support" ADD CONSTRAINT "chk_ticket_support_cible" CHECK (((commande_id IS NOT NULL) OR (troc_id IS NOT NULL)));
ALTER TABLE "troc" ADD CONSTRAINT "chk_troc_parties_differentes" CHECK ((partie_a_id <> partie_b_id));
ALTER TABLE "troc" ADD CONSTRAINT "chk_troc_soulte_positive" CHECK ((soulte >= (0)::numeric));
ALTER TABLE "utilisateur" ADD CONSTRAINT "ck_utilisateur_nom" CHECK ((length(TRIM(BOTH FROM nom)) > 0));
ALTER TABLE "utilisateur" ADD CONSTRAINT "ck_utilisateur_prenom" CHECK ((length(TRIM(BOTH FROM prenom)) > 0));
ALTER TABLE "verification_identite" ADD CONSTRAINT "chk_verification_tailles_positives" CHECK (((piece_recto_taille >= 0) AND (piece_verso_taille >= 0) AND (selfie_taille >= 0)));
ALTER TABLE "versement" ADD CONSTRAINT "chk_versement_frais_positifs" CHECK ((frais_transfert >= (0)::numeric));
ALTER TABLE "versement" ADD CONSTRAINT "chk_versement_montant_positif" CHECK ((montant >= (0)::numeric));

CREATE UNIQUE INDEX "uq_utilisateur_email" ON "utilisateur" USING btree (lower(("email")::text)) WHERE ("email" IS NOT NULL);
