CREATE UNIQUE INDEX "uq_lien_affiliation_active_user"
  ON "lien_affiliation" ("affiliation_id", "utilisateur_id")
  WHERE ("actif" = TRUE);
