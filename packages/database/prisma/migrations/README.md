# Historique Prisma

`20261114190000_baseline` est le baseline initial du schéma PostgreSQL TopDeal. Son SQL est généré depuis `schema.prisma`, puis complété avec les 31 contraintes `CHECK` existantes et l’index unique fonctionnel `uq_utilisateur_email` sur `lower(email)`.

Prisma ne représente pas encore ces contraintes `CHECK` ni cet index d’expression dans le schéma. Les changements qui les concernent doivent donc être ajoutés explicitement aux migrations SQL et vérifiés dans PostgreSQL ; `migrate diff` ne suffit pas à détecter leur dérive.

Pour une base vide, `prisma migrate deploy` applique le baseline. Pour une base déjà créée avec ce schéma, ne pas exécuter le baseline : vérifier d’abord l’équivalence du schéma, puis enregistrer la migration comme appliquée avec `prisma migrate resolve --applied 20261114190000_baseline`.

La migration `20261117150000_optimize_annonce_queries` ajoute les index de recherche et de pagination des annonces. Elle installe aussi `pg_trgm`, qui doit être autorisé par l’hébergeur PostgreSQL. Les index sont créés dans la transaction Prisma; sur une base volumineuse, planifier l’application hors période de pointe, car PostgreSQL peut bloquer les écritures pendant leur création. Elle a été appliquée à la base locale `topdeal`; les autres environnements doivent exécuter `prisma migrate deploy`.
