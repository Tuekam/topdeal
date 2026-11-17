---
name: evolutivite
description: Principes d'évolutivité et d'indépendance technologique de TopDeal. À utiliser pour toute création ou modification de code, choix d'architecture, ajout d'une fonctionnalité, intégration technique, refactorisation ou revue. L'agent doit concevoir chaque partie pour que les technologies concrètes (base SQL ou NoSQL, Prisma ou autre ORM, fournisseur d'authentification, stockage, paiement, messagerie, framework) puissent être remplacées avec un impact limité, sans surarchitecture ni abstraction inutile.
---

# Evolutivite Skill — TopDeal

## 1. Objectif

Ce skill définit les règles permettant de faire évoluer TopDeal sans introduire de dépendances techniques inutiles dans le métier.

Il vise à garantir :

- Un faible couplage entre les couches.
- Une séparation claire entre métier et technologie.
- Des dépendances explicites.
- Le remplacement possible des fournisseurs techniques.
- Une évolution progressive des fonctionnalités.
- Une architecture simple et maintenable.

L'évolutivité doit être obtenue par une bonne séparation des responsabilités, et non par une multiplication des abstractions.

## 2. Principe fondamental : dépendre des contrats

Les couches métier ne doivent pas dépendre des implémentations techniques.

Core définit les contrats nécessaires.

Domain implémente les Use Cases en utilisant ces contrats.

Data implémente les contrats techniques avec les fournisseurs concrets.

Exemple :

```text
                 Domain
                    |
                    v
             LoginRepository
                    ^
                    |
                    |
          LoginRepositoryImpl
                    |
                    v
             FirebaseAuthService
```

Le contrat `LoginRepository` ne doit pas connaître Firebase.

L'implémentation `LoginRepositoryImpl` peut utiliser Firebase à travers un service technique.

Ainsi, remplacer Firebase ne nécessite pas de réécrire le Use Case.

## 3. Isolation des technologies

Les technologies doivent rester dans les couches appropriées.

| Technologie | Emplacement |
|---|---|
| Firebase Auth | Data |
| Prisma | Data |
| PostgreSQL | Infrastructure technique de Data |
| MinIO | Data |
| Next.js | apps/web |
| React | Presentation |
| Awilix | Composition Root |

Ne laisse pas les SDK techniques contaminer les contrats métier.

### Exemple incorrect

```typescript
import { UserCredential } from "firebase/auth";

export interface LoginRepository {
  login(email: string, password: string): Promise<UserCredential>;
}
```

Le contrat dépend directement de Firebase.

### Exemple correct

```typescript
export interface LoginRepository {
  login(input: LoginInput): Promise<LoginResult>;
}
```

Les types exposés par le contrat doivent appartenir au domaine métier ou à son Core.

## 4. Responsabilité des repositories

Un repository représente une frontière entre les besoins métier et les mécanismes d'accès aux données.

Il ne doit pas exposer les détails du fournisseur technique.

Exemple :

```typescript
export interface LoginRepository {
  login(input: LoginInput): Promise<LoginResult>;
}
```

Implémentation :

```typescript
export class UserLoginRepositoryImpl
  implements LoginRepository {

  constructor(
    private readonly authService: FirebaseAuthService
  ) {}

  async login(input: LoginInput): Promise<LoginResult> {
    return this.authService.login(input);
  }
}
```

L'implémentation traduit les besoins du contrat vers le fournisseur technique.

Ne transforme pas les repositories en services métier.

Ne leur attribue pas des responsabilités qui appartiennent aux Use Cases.

## 5. Responsabilité des services techniques

Les services encapsulent les communications avec les technologies externes.

Exemples :

- FirebaseAuthService.
- FirebaseAdminService.
- PrismaTaskService.
- MinioStorageService.

Ils doivent masquer les détails techniques à leurs consommateurs.

Un service peut :

- Communiquer avec un SDK.
- Exécuter une requête technique.
- Gérer les particularités du fournisseur.
- Convertir une réponse technique vers une structure adaptée à Data.

Un service ne doit pas décider des règles métier.

Évite les services universels regroupant plusieurs fournisseurs ou plusieurs fonctionnalités indépendantes.

## 6. Injection des dépendances

TopDeal utilise Awilix pour assembler les dépendances.

L'injection doit être explicite.

Exemple :

```typescript
export class LoginUseCaseImpl
  implements LoginUseCase {

  constructor(
    private readonly repository: LoginRepository
  ) {}

  async execute(input: LoginInput) {
    return this.repository.login(input);
  }
}
```

Le Use Case reçoit son contrat par injection.

Il ne doit pas :

- Instancier directement `UserLoginRepositoryImpl`.
- Importer Firebase.
- Accéder directement à Prisma.
- Récupérer ses dépendances dans un conteneur global.
- Utiliser un Service Locator.

### Composition Root

Le Composition Root assemble les dépendances concrètes.

Il appartient à `apps/web`.

Exemple conceptuel :

```typescript
const authService = new FirebaseAuthService();

const loginRepository = new UserLoginRepositoryImpl(
  authService
);

const loginUseCase = new LoginUseCaseImpl(
  loginRepository
);
```

Dans l'application réelle, respecte le mécanisme Awilix déjà adopté.

Ne crée pas un second système d'injection.

## 7. Évolution des fournisseurs techniques

Une technologie doit pouvoir être remplacée sans modifier les règles métier lorsque les contrats restent compatibles.

Exemple :

Aujourd'hui :

```text
LoginRepository
       |
       v
UserLoginRepositoryImpl
       |
       v
FirebaseAuthService
```

Évolution possible :

```text
LoginRepository
       |
       v
UserLoginRepositoryImpl
       |
       v
AlternativeAuthService
```

Le Use Case conserve son contrat et sa responsabilité.

Le remplacement doit être limité aux éléments techniques concernés.

Ne crée cependant pas plusieurs implémentations hypothétiques simplement pour anticiper un remplacement qui n'est pas prévu.

Une abstraction est justifiée lorsqu'elle représente une frontière réelle.

## 8. Évolution des modèles et contrats

Les modèles et contrats doivent rester indépendants des technologies.

Lorsqu'un contrat évolue :

1. Identifier tous ses consommateurs.
2. Identifier toutes ses implémentations.
3. Vérifier les conséquences sur les fonctionnalités concernées.
4. Adapter les éléments nécessaires.
5. Vérifier les tests et les usages existants.

Ne modifie pas un contrat partagé sans examiner son impact sur les autres fonctionnalités.

Évite de faire dépendre un modèle métier de structures techniques.

Ne crée pas de modèles parallèles identiques sans nécessité.

## 9. Gestion des erreurs et découplage

Les erreurs techniques doivent être traduites à la frontière appropriée.

Exemple :

Firebase peut retourner une erreur technique spécifique.

Le service technique identifie cette erreur.

Le repository ou la couche d'intégration la traduit vers une erreur compréhensible par le métier.

Le Use Case ne doit pas connaître les codes internes de Firebase.

Les erreurs métier utilisent le modèle d'erreur défini par le projet.

Les messages et codes réutilisables doivent provenir du catalogue centralisé correspondant.

Ne masque pas les erreurs inattendues.

Préserve les informations techniques utiles au diagnostic, sans les exposer au client.

## 10. Communication entre fonctionnalités

Une fonctionnalité ne doit pas accéder directement aux implémentations internes d'une autre fonctionnalité.

Les échanges doivent passer par des contrats ou mécanismes explicitement définis.

Exemple :

Une fonctionnalité Commande peut avoir besoin de consulter les informations d'un utilisateur.

Elle ne doit pas importer directement le repository concret d'Auth.

Elle doit utiliser une frontière d'accès appropriée.

Ne crée pas de dépendances circulaires entre fonctionnalités.

Ne partage pas automatiquement tous les modèles et services.

Un élément doit être partagé uniquement lorsque plusieurs fonctionnalités ont réellement besoin de la même responsabilité.

## 11. Évolution de Presentation

La présentation doit rester indépendante des fournisseurs techniques.

Les composants ne doivent pas importer Firebase ou Prisma pour exécuter directement des opérations métier.

Les hooks peuvent orchestrer les interactions de présentation et appeler les mécanismes prévus pour déclencher les Use Cases.

Un changement de fournisseur technique ne doit pas nécessiter de réécrire les écrans.

Les composants génériques restent dans `packages/ui`.

Les composants propres à une fonctionnalité restent dans cette fonctionnalité.

## 12. Évolution de la base de données

La persistance est une responsabilité technique.

Prisma et PostgreSQL ne doivent pas devenir des dépendances des règles métier.

Les modifications de schéma doivent être réalisées avec une compréhension des conséquences sur les données existantes.

Règles :

- Préserver la cohérence des données.
- Éviter les changements incompatibles non maîtrisés.
- Examiner les migrations nécessaires.
- Ne pas supprimer des données pour résoudre une erreur sans autorisation.
- Ne pas exposer les types Prisma dans les contrats métier.

Ne construis pas une couche d'abstraction de base de données supplémentaire si les repositories et services existants répondent déjà au besoin.

## 13. Évolution progressive

Une évolution doit être limitée au périmètre nécessaire.

Avant une modification importante :

1. Comprendre l'architecture existante.
2. Identifier les dépendances concernées.
3. Identifier les consommateurs des contrats.
4. Évaluer les risques de régression.
5. Proposer une modification proportionnée.
6. Vérifier le comportement après modification.

Ne refonds pas plusieurs fonctionnalités pour résoudre un problème local.

Ne profite pas d'une modification pour introduire des abstractions sans rapport avec le besoin.

## 14. Anti-sur-ingénierie

L'évolutivité ne justifie pas automatiquement :

- Une Factory.
- Une Strategy.
- Un Adapter supplémentaire.
- Un Manager.
- Un registre de fournisseurs.
- Un système de plugins.
- Une couche générique universelle.
- Plusieurs interfaces pour la même responsabilité.

Introduis ces mécanismes uniquement lorsqu'un besoin réel les justifie.

Avant de créer une abstraction, pose-toi trois questions :

1. Quel problème concret résout-elle ?
2. Quelle dépendance ou duplication élimine-t-elle ?
3. Le code serait-il réellement plus simple sans elle ?

Si elle ajoute plus de complexité qu'elle n'en retire, ne l'introduis pas.

## 15. Vérification finale

Avant de terminer une évolution, vérifier :

- Domain ne dépend pas des fournisseurs techniques.
- Les contrats sont indépendants des SDK.
- Data implémente les contrats de Core.
- Les dépendances sont injectées explicitement.
- Awilix reste dans le Composition Root.
- Les services encapsulent les intégrations techniques.
- Les fonctionnalités ne dépendent pas directement des implémentations internes d'autres fonctionnalités.
- Les erreurs techniques sont traduites correctement.
- Les contrats partagés ne sont pas modifiés sans analyse d'impact.
- Aucune abstraction hypothétique n'a été ajoutée.
- Les changements restent limités au besoin réel.

## Règle finale

L'évolutivité de TopDeal repose sur des frontières claires et des dépendances maîtrisées.

**Le métier doit pouvoir évoluer indépendamment des technologies, sans transformer le projet en architecture inutilement abstraite.**