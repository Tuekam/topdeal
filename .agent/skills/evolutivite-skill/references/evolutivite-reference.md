# Référence — Évolutivité technologique de TopDeal

## Vocabulaire

- **Domaine** : règles et concepts métier indépendants des outils.
- **Port / contrat** : interface exprimant une capacité requise par le cœur applicatif.
- **Adaptateur** : implémentation qui relie un contrat à une technologie ou un système externe.
- **Composition Root** : point où les implémentations concrètes sont assemblées et injectées.
- **Couplage** : dépendance qui oblige plusieurs parties à changer ensemble.
- **Portabilité** : capacité à changer de technologie sans réécrire les règles métier.

## Frontières à préserver dans TopDeal

- `packages/features/*/domain` : règles et contrats métier de la feature.
- `packages/features/*/data` : implémentations et traductions vers les technologies.
- `packages/features/*/presentation` : état et composants de présentation, sans accès direct à l'infrastructure.
- `packages/core` : éléments réellement transversaux et indépendants des technologies.
- `apps/web` : Next.js, Route Handlers, DI Awilix, Composition Root, configuration et assemblage.

Ne pas déplacer mécaniquement tout contrat dans `packages/core`. Un contrat utilisé par une seule feature reste généralement dans cette feature.

## Exemple de migration Prisma vers un autre adaptateur

1. Conserver le contrat de repository si le besoin métier n'a pas changé.
2. Implémenter le contrat avec le nouveau client ou pilote.
3. Ajouter les nouveaux mappings et tests d'intégration.
4. Enregistrer la nouvelle implémentation dans le Composition Root.
5. Retirer Prisma et ses dépendances de l'assemblage.
6. Vérifier que les Use Cases, Domain et Presentation n'ont pas acquis de dépendances au nouvel outil.

## Exemple de migration SQL vers NoSQL

Avant la migration, établir une matrice des comportements requis :
- contraintes d'unicité ;
- cohérence et atomicité ;
- transactions et opérations multi-entités ;
- relations et agrégats ;
- filtres, tri et pagination ;
- recherche textuelle ;
- concurrence et mises à jour ;
- sauvegarde, reprise et migration des données.

La nouvelle base doit être évaluée par rapport à ces exigences. Un repository stable ne garantit pas à lui seul une équivalence fonctionnelle entre moteurs.

## Tests attendus

- Tests unitaires du Domain et des Use Cases avec doubles de test.
- Tests d'adaptateurs pour vérifier les mappings et traductions d'erreurs.
- Tests d'intégration pour les garanties propres à la base ou au fournisseur.
- Tests de contrat lorsque plusieurs adaptateurs doivent respecter la même interface.

## À ne pas faire

- Un repository générique CRUD pour toutes les entités.
- Des abstractions hypothétiques pour chaque fournisseur potentiel.
- Des interfaces miroir de chaque classe concrète sans raison.
- Une abstraction qui masque les transactions, la cohérence ou les limites d'une technologie.
- Des modèles métier construits directement à partir des types générés par un ORM.
