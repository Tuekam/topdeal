# Référence de nomenclature TopDeal

## Source
Synthèse des conventions explicitement présentes dans la documentation d'architecture technique TopDeal, notamment les sections « Conventions de développement » et « Nommage ».

## Principes confirmés
- Aucun dossier `src` dans les packages TopDeal.
- Packages internes sous l'espace de noms `@topdeal`.
- Packages explicites et homogènes.
- Les noms décrivent le rôle réel du fichier ou dossier.
- Exports publics contrôlés ; éviter les imports profonds non documentés.
- Ne pas créer d'abstraction ou de dossier vide sans besoin concret.
- Chaque package possède un `package.json` et déclare ses dépendances.
- Les imports inter-packages passent par les noms de packages et leurs exports publics.

## Conventions données par la documentation

| Élément | Convention | Exemple |
|---|---|---|
| Contrat repository | Nom métier + `Repository` | `AnnonceRepository` |
| Implémentation repository | Nom du contrat + `Impl` | `AnnonceRepositoryImpl` |
| Use Case | Verbe + objet + `UseCase` | `CreateAnnonceUseCase` |
| Hook React | `use` + action/ressource | `useAnnonces` |
| Composant | PascalCase | `AnnonceCard` |
| Énumération | Nom métier explicite | `StatutAnnonce` |
| Barrel | `index.ts` si utile | `presentation/index.ts` |

Packages : `@topdeal/ui`, `@topdeal/feature-annonce`.

La convention `IOS + nom + Impl` concerne les implémentations spécifiques iOS dans le contexte KMP ; elle ne s'applique pas aux implémentations Web.

## Vocabulaire architectural
`domain`, `data`, `presentation`, `entities`, `value-objects`, `use-cases`, `interfaces`, `errors`, `repositories`, `adapters`, `mappers`, `models`, `components`, `hooks`, `states`.

Les sous-dossiers facultatifs ne sont créés que lorsqu'un besoin réel existe.

## Points non définis dans la source
La documentation ne fixe pas explicitement :
- la casse de tous les noms de fichiers et dossiers ;
- le nommage des variables, fonctions et paramètres ;
- le préfixe `I` pour les interfaces ;
- les suffixes DTO, Model, Type, Schema, Service, Manager ou Factory ;
- les conventions de fichiers de tests ;
- les conventions CSS, Tailwind et variables d'environnement ;
- les conventions de routes et endpoints.

Ces points ne sont pas des règles officielles avant validation.

## Exemple de contrôle
`CreateAnnonceUseCase` est conforme : verbe + objet + `UseCase`.
`AnnonceRepositoryImpl` désigne l'implémentation du contrat `AnnonceRepository`.
Pour `AnnonceService`, ne pas valider automatiquement : déterminer s'il s'agit réellement d'un Use Case, repository, adapter ou autre rôle avant de choisir le nom.
