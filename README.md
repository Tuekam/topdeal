# TopDeal

TopDeal est une marketplace de proximité destinée à Bafoussam, au Cameroun. Le dépôt est un monorepo pnpm ; l’application Web utilise Next.js, React et TypeScript.

## Démarrer

Installer les dépendances puis lancer l’application Web :

```bash
pnpm install
pnpm dev
```

L’application est disponible sur [http://localhost:3000](http://localhost:3000).

Commandes disponibles à la racine :

```bash
pnpm build
pnpm lint
```

Les variables d’environnement nécessaires doivent être configurées localement. Ne jamais versionner leur valeur.

`DATABASE_POOL_MAX` règle le nombre maximal de connexions PostgreSQL par processus Web (10 par défaut, entre 1 et 50). En production, choisir sa valeur selon le nombre maximal d’instances Web et le budget de connexions de PostgreSQL ou de son pooler.

## Organisation actuelle

- `apps/web` : routes Next.js, endpoints HTTP, configuration et Composition Root Awilix.
- `packages/features/auth` : présentation Auth, règles et cas d’utilisation dans `domain`, intégrations dans `data`.
- `packages/database` : schéma Prisma, migrations et client de base de données.
- `packages/ui` : composants visuels, tokens et styles partagés.
- `docs` : spécifications fonctionnelles, règles métier, base de données et direction visuelle.
- `.agent/skills` : consignes spécialisées de conception et de développement du projet.

Les packages de fonctionnalité et les éléments transversaux sont ajoutés quand un besoin concret les justifie. Les règles d’architecture complètes figurent dans `AGENTS.md`.

## État Auth

Les pages `/connexion` et `/design-system/auth-profile` sont des aperçus de présentation. Le serveur possède une première tranche de création de session ; l’inscription et la complétion de profil ne sont pas encore des parcours fonctionnels.

Consulter `MEMOIRE1.md` pour l’état de travail, les décisions validées, les points en attente et la prochaine étape.
