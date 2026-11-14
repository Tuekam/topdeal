---
name: evolutivite
description: Principes d'évolutivité et d'indépendance technologique de TopDeal. À utiliser pour toute création ou modification de code, choix d'architecture, ajout d'une fonctionnalité, intégration technique, refactorisation ou revue. L'agent doit concevoir chaque partie pour que les technologies concrètes (base SQL ou NoSQL, Prisma ou autre ORM, fournisseur d'authentification, stockage, paiement, messagerie, framework) puissent être remplacées avec un impact limité, sans surarchitecture ni abstraction inutile.
---

# Concevoir TopDeal pour évoluer et remplacer ses technologies

## Objectif

TopDeal est un projet en évolution. Les choix techniques actuels sont des choix d'implémentation, pas des dépendances irréversibles.

Le code doit permettre de remplacer une technologie par une autre avec un impact localisé et maîtrisé. Par exemple :

- PostgreSQL peut être remplacé par une base NoSQL.
- Prisma peut être remplacé par Drizzle, un autre ORM ou un accès natif.
- Firebase Auth peut être remplacé par un autre fournisseur d'identité.
- MinIO peut être remplacé par S3, un stockage local ou un autre fournisseur.
- Un prestataire de paiement, de notification ou de messagerie peut changer.
- Next.js ou l'interface Web peuvent évoluer sans déplacer les règles métier dans le framework.

**Règle centrale : le métier TopDeal ne doit pas dépendre des détails des technologies utilisées pour l'exécuter.**

L'évolutivité ne signifie pas prévoir toutes les technologies futures ni créer une abstraction pour chaque classe. Elle signifie séparer correctement les responsabilités, isoler les décisions techniques et garder les frontières explicites.

## 1. Règles non négociables

1. Le Domain ne dépend d'aucun framework, ORM, fournisseur externe ou détail d'infrastructure.
2. Les contrats utilisés par le métier sont définis du côté intérieur de l'architecture, pas imposés par la technologie concrète.
3. Les dépendances pointent vers les abstractions et le métier, jamais du métier vers les implémentations.
4. Les technologies concrètes restent confinées dans la couche Data ou dans les adaptateurs d'infrastructure appropriés.
5. Les Use Cases expriment les actions métier et orchestrent les contrats nécessaires ; ils ne manipulent pas directement Prisma, Firebase, MinIO ou les SDK de prestataires.
6. Les Route Handlers et composants React ne contiennent pas de logique métier persistante.
7. Un changement de fournisseur doit conduire principalement au remplacement d'un adaptateur et à sa configuration, pas à une réécriture du métier.
8. Ne pas créer d'abstraction sans besoin réel : appliquer KISS, YAGNI et DRY avec discernement.
9. Ne jamais prétendre qu'un remplacement sera « sans aucun changement ». L'objectif est de limiter et maîtriser les changements, pas de promettre une compatibilité magique.
10. Toute nouvelle dépendance technologique doit avoir une frontière claire et une raison documentée.

## 2. Direction des dépendances

La règle de dépendance est orientée vers le cœur métier :

```text
Presentation / Entrées
        |
        v
     Use Cases
        |
        v
      Domain
        ^
        |
Ports / contrats nécessaires au métier
        ^
        |
Adaptateurs Data / Infrastructure
        |
        v
Technologies concrètes
(Prisma, PostgreSQL, Firebase, MinIO...)
```

Le schéma exprime une règle de dépendance, pas nécessairement une arborescence exacte.

- Le Domain ne connaît que le métier et les contrats dont il a besoin.
- Les Use Cases dépendent des contrats, pas des classes concrètes.
- Les adaptateurs implémentent ces contrats et traduisent entre le monde externe et les modèles internes.
- Le Composition Root assemble les implémentations concrètes.
- La Presentation transmet les entrées et affiche les résultats ; elle ne choisit pas comment les données sont stockées.

## 3. Exemple : rendre le stockage remplaçable

### À éviter

```ts
// Use Case couplé à Prisma
import { prisma } from "@/lib/prisma";

export class CreateAnnonceUseCase {
  async execute(input: CreateAnnonceInput) {
    return prisma.annonce.create({
      data: input,
    });
  }
}
```

Problèmes :
- Le métier connaît Prisma.
- Le modèle de persistance risque de devenir le modèle métier.
- Le remplacement de Prisma ou de la base touche directement le Use Case.
- Les tests métier nécessitent de connaître l'infrastructure.

### Préférer

Contrat défini dans la frontière intérieure appropriée :

```ts
export interface CreateAnnonceRepository {
  create(annonce: Annonce): Promise<Annonce>;
}
```

Use Case indépendant de l'implémentation :

```ts
export class CreateAnnonceUseCase {
  constructor(
    private readonly repository: CreateAnnonceRepository,
  ) {}

  async create(input: CreateAnnonceInput): Promise<Annonce> {
    const annonce = Annonce.create(input);
    return this.repository.create(annonce);
  }
}
```

Implémentation Prisma confinée à Data :

```ts
export class CreateAnnonceRepositoryImpl
  implements CreateAnnonceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(annonce: Annonce): Promise<Annonce> {
    const record = await this.prisma.annonce.create({
      data: toPrismaData(annonce),
    });

    return toDomainAnnonce(record);
  }
}
```

Si Prisma est remplacé, l'agent crée une autre implémentation du contrat et adapte le mapping. Le Use Case ne change que si le besoin métier ou le contrat métier change.

Les noms et signatures sont des exemples illustratifs : respecter la nomenclature et les interfaces réellement définies dans TopDeal.

## 4. Remplacer SQL par NoSQL : ne pas confondre indépendance et équivalence

Une base relationnelle et une base NoSQL n'offrent pas nécessairement les mêmes garanties, transactions, contraintes, requêtes ou modèles de données.

Pour faciliter une migration :

- Ne pas exposer les objets Prisma, les types SQL ou les documents MongoDB dans le Domain.
- Ne pas faire remonter les relations Prisma (`include`, `select`, objets générés) dans les Use Cases.
- Définir les contrats selon les besoins métier : créer une annonce, retrouver une annonce, lister avec filtres, changer un statut.
- Retourner des modèles métier ou des résultats applicatifs stables, pas des enregistrements de base.
- Garder les mappings entre modèle de persistance et modèle métier dans l'adaptateur.
- Éviter que le métier dépende de particularités d'une base, comme un identifiant auto-incrémenté, un champ JSON propre à un moteur ou une jointure SQL.
- Identifier explicitement les besoins de cohérence, d'unicité, de transaction, de pagination et de recherche.
- Vérifier comment la nouvelle base peut satisfaire ces besoins avant de déclarer le remplacement simple.

Ne pas construire un « plus petit dénominateur commun » qui détruit les capacités utiles des bases. Les différences techniques doivent être gérées dans l'adaptateur et documentées lorsqu'elles ont un effet sur le comportement.

## 5. Ports et adaptateurs par domaine technique

Créer une frontière lorsque le métier ou l'application dépend d'une capacité externe.

| Capacité | Ce que le cœur doit exprimer | Ce qui reste à l'extérieur |
|---|---|---|
| Persistance | opérations métier de lecture/écriture | SQL, NoSQL, ORM, requêtes |
| Authentification | identité authentifiée et contexte utilisateur nécessaires | Firebase Auth, autre IdP, SDK |
| Fichiers | enregistrer, lire ou supprimer un fichier via un contrat adapté | MinIO, S3, fournisseur cloud |
| Paiement | initier ou suivre une opération selon les règles métier | API et SDK du prestataire |
| Notifications | demander l'envoi d'une notification | Firebase Cloud Messaging, e-mail, SMS |
| Temps | obtenir l'heure courante si le cas d'usage doit la contrôler | horloge système |
| Identifiants | obtenir un identifiant selon le besoin | stratégie de génération concrète |

Ne pas créer automatiquement tous ces ports dès le départ. Les introduire lorsqu'une fonctionnalité les utilise réellement.

## 6. Composition Root et injection de dépendances

- Les implémentations concrètes sont instanciées et associées aux contrats dans le Composition Root / conteneur Awilix de `apps/web`.
- Les Use Cases reçoivent leurs dépendances par injection.
- Les features ne doivent pas importer directement le conteneur global.
- Aucun Use Case ne doit appeler `container.resolve()` lui-même.
- Les composants React ne doivent pas construire des repositories ni instancier des clients d'infrastructure.
- Le remplacement d'un fournisseur doit se faire en modifiant l'assemblage et l'adaptateur, sans propager le changement dans toutes les features.
- Ne pas transformer l'injection de dépendances en service locator global.

## 7. Modèles et contrats stables

- Séparer les modèles métier des DTO HTTP, modèles de base et objets SDK.
- Ne pas retourner un objet Prisma directement depuis une Route Handler ou un Use Case.
- Convertir les entrées externes en types applicatifs contrôlés à la frontière.
- Convertir les résultats internes en DTO de sortie à la frontière HTTP.
- Les types partagés dans `packages/core` doivent être réellement transversaux ; ne pas y déplacer les modèles propres à une technologie.
- Ne pas exposer un type d'ORM dans une interface de repository.
- Les contrats doivent représenter les besoins réels de la feature, pas recopier l'API d'un fournisseur.

## 8. Transactions, erreurs et capacités spécifiques

L'abstraction ne doit pas cacher les garanties importantes.

- Définir les frontières transactionnelles selon les invariants métier.
- Ne pas laisser les Use Cases dépendre d'une transaction Prisma.
- Si une opération nécessite une transaction, définir un contrat adapté à cette unité de travail, ou une opération atomique cohérente dans le repository.
- Ne pas supposer qu'une transaction SQL peut être reproduite à l'identique en NoSQL.
- Traduire les erreurs techniques en erreurs applicatives compréhensibles à la frontière de l'adaptateur.
- Ne pas faire dépendre le métier des codes d'erreur d'un fournisseur.
- Si une technologie fournit une capacité spécifique indispensable, l'exprimer clairement dans un contrat dédié plutôt que de prétendre qu'elle est universelle.

## 9. Éviter la surarchitecture

L'évolutivité n'est pas une excuse pour multiplier les couches.

Ne pas :
- créer une interface pour chaque classe sans besoin de substitution ou de frontière ;
- créer un GenericRepository universel qui masque les besoins métier ;
- créer des abstractions génériques pour des scénarios hypothétiques ;
- introduire des factories, stratégies, managers ou providers sans variation réelle ;
- concevoir dès aujourd'hui une compatibilité simultanée avec toutes les bases et tous les fournisseurs ;
- ajouter des packages ou dossiers vides « au cas où » ;
- faire passer des données à travers plusieurs DTO identiques sans raison.

Faire :
- isoler les technologies aux frontières ;
- commencer par le contrat minimal nécessaire ;
- garder les opérations proches du vocabulaire métier ;
- choisir la solution la plus simple qui préserve une possibilité réaliste de remplacement ;
- ajouter une abstraction lorsque deux implémentations existent, qu'un remplacement est prévu, qu'une dépendance externe doit être isolée ou que les tests l'exigent réellement.

Exemple : si TopDeal n'a qu'une seule règle fixe de calcul de frais, une méthode métier simple suffit. Ne pas introduire Strategy avant qu'il existe plusieurs algorithmes à choisir ou une vraie variation.

## 10. Procédure obligatoire avant d'ajouter une technologie

Pour chaque nouvelle intégration, l'agent doit :

1. Identifier le besoin métier ou applicatif précis.
2. Identifier le code qui ne doit pas connaître la technologie.
3. Définir le contrat minimal côté intérieur, si une frontière est nécessaire.
4. Implémenter l'adaptateur dans la couche externe appropriée.
5. Ajouter le mapping entre types externes et types internes.
6. Enregistrer l'implémentation dans le Composition Root.
7. Tester le comportement métier sans démarrer la technologie réelle.
8. Tester l'adaptateur avec la technologie réelle ou un environnement d'intégration adapté.
9. Documenter les contraintes non portables : transactions, cohérence, limites, pagination, coûts ou formats.
10. Vérifier qu'aucune dépendance concrète ne s'est propagée dans le Domain ou les Use Cases.

## 11. Checklist de revue avant de terminer

- [ ] Le Domain compile et fonctionne sans importer de framework, ORM ou SDK externe.
- [ ] Les Use Cases dépendent de contrats, pas d'implémentations concrètes.
- [ ] Aucun type Prisma, SQL, NoSQL ou SDK fournisseur ne traverse une frontière interne.
- [ ] Les adaptateurs traduisent les modèles et erreurs externes.
- [ ] Les implémentations sont assemblées dans le Composition Root.
- [ ] La Presentation ne contient pas de logique métier ni d'accès direct à la base.
- [ ] Les transactions et garanties de cohérence sont explicites.
- [ ] Les tests du métier peuvent fonctionner avec des implémentations de test simples.
- [ ] L'abstraction répond à un besoin réel et n'est pas une anticipation gratuite.
- [ ] Le changement de technologie aurait un périmètre de modification identifiable.

## 12. Exemples de couplage à détecter

| Mauvais signe | Direction attendue |
|---|---|
| `import { PrismaClient }` dans un Use Case | injection d'un contrat de repository |
| `Prisma.AnnnonceWhereInput` dans le Domain | critères métier indépendants |
| `FirebaseUser` dans un modèle métier | identité applicative contrôlée |
| `NextRequest` dans un Use Case | entrée applicative indépendante du protocole HTTP |
| `Minio.Client` dans une feature métier | contrat de stockage si nécessaire |
| composant React qui appelle Prisma | appel via une frontière serveur |
| `container.resolve()` dans le Domain | injection depuis le Composition Root |
| réponse API contenant un document de base brut | DTO de sortie explicite |

## 13. Règle de décision finale

Avant de valider du code, pose-toi ces questions :

1. Si Prisma disparaît demain, quelles parties devront changer ?
2. Si PostgreSQL est remplacé par MongoDB, les règles métier restent-elles intactes ?
3. Si Firebase Auth est remplacé, les Use Cases doivent-ils être réécrits ?
4. Si le framework Web change, le Domain reste-t-il utilisable ?
5. L'abstraction créée aujourd'hui répond-elle à un besoin réel ou seulement à une hypothèse ?

Si une technologie peut être remplacée uniquement en modifiant son adaptateur, son mapping, sa configuration et éventuellement les tests d'intégration, la séparation est bonne. Si le changement traverse les règles métier et toutes les features, le couplage doit être corrigé.

En cas de conflit, les décisions explicites du projet et `AGENTS.md` priment. Ce skill complète les skills d'architecture, de nomenclature et de design system ; il ne les remplace pas.
