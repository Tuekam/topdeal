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
| Faire une revue finale des imports, responsabilités et comportements | Partiellement validée | TypeScript et ESLint sur les fichiers `apps/web` modifiés réussissent. La recherche des anciens chemins ne retourne aucun résultat. Les tests n’ont pas été exécutés. ESLint ne prend pas les fichiers du package Auth en charge depuis la configuration `apps/web`; `git diff --check` signale des espaces de fin dans les modifications préexistantes de `AGENTS.md` et du skill Architecture, pas dans les fichiers Auth modifiés. |

## Contraintes de la refonte

- Ne pas modifier les règles métier, les contrats HTTP, les réponses API, les textes d’interface ou les mécanismes de session.
- Ne pas ajouter de couche, interface, fichier ou abstraction sans responsabilité réelle.
- Garder les types Firebase, Prisma et Next.js hors des contrats métier.
- Ajouter des commentaires uniquement pour expliquer une décision ou un invariant non évident.
- Ne pas modifier ni déplacer `packages/database`.

## État courant

La refonte Auth est appliquée. La revue statique est faite ; la validation fonctionnelle de connexion et d’inscription reste à effectuer par le propriétaire. Les étapes ci-dessus seront mises à jour au fil des validations, sans journal daté.
