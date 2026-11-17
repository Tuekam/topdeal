CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "idx_annonce_publication_cursor"
  ON "annonce" ("visibilite", "date_publication" DESC, "id" DESC);

CREATE INDEX "idx_annonce_proprietaire_cursor"
  ON "annonce" ("utilisateur_id", "date_publication" DESC, "id" DESC);

CREATE INDEX "idx_annonce_titre_trgm"
  ON "annonce" USING GIN ("titre" gin_trgm_ops);

CREATE INDEX "idx_annonce_description_trgm"
  ON "annonce" USING GIN ("description" gin_trgm_ops);

CREATE INDEX "idx_annonce_quartier_trgm"
  ON "annonce" USING GIN ("quartier" gin_trgm_ops);

CREATE INDEX "idx_photo_annonce_ordre"
  ON "photo_annonce" ("annonce_id", "ordre", "id");

DROP INDEX "idx_annonce_utilisateur";
DROP INDEX "idx_photo_annonce";
