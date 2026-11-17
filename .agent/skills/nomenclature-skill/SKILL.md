---
name: nomenclature
description: Applique et contrôle les conventions de nommage TopDeal pour les packages, dossiers, fichiers, contrats, implémentations, Use Cases, hooks React, composants et exports TypeScript.
---

# Nomenclature Skill — TopDeal

## 1. Objectif

Ce skill définit les conventions de nommage utilisées dans TopDeal.

Il garantit :

- Des noms explicites et cohérents.
- Une identification immédiate de la responsabilité d'un fichier.
- Une distinction claire entre contrats et implémentations.
- Une organisation homogène entre les fonctionnalités.
- Une navigation simple dans le code.

Les noms doivent décrire précisément le rôle de l'élément.

Évite les noms vagues, les abréviations inutiles et les conventions différentes pour des éléments ayant la même responsabilité.

## 2. Conventions générales

| Élément | Convention | Exemple |
|---|---|---|
| Dossiers | kebab-case | `verify-session/` |
| Fichiers TypeScript | PascalCase | `LoginUseCaseImpl.ts` |
| Classes | PascalCase | `LoginUseCaseImpl` |
| Interfaces | PascalCase | `LoginUseCase` |
| Types | PascalCase | `LoginInput` |
| Enums | PascalCase | `UserStatus` |
| Variables | camelCase | `userRepository` |
| Fonctions | camelCase | `verifySession()` |
| Méthodes | camelCase | `execute()` |
| Constantes | UPPER_SNAKE_CASE | `AUTH_ERRORS` |

Les extensions doivent respecter les conventions techniques du projet.

## 3. Contrats de Use Cases

Les contrats de Use Cases sont nommés selon le format :

`<Action><Entity>UseCase.ts`

Exemples :

- `CreateTaskUseCase.ts`
- `UpdateTaskUseCase.ts`
- `DeleteTaskUseCase.ts`
- `LoginUseCase.ts`
- `RegisterUseCase.ts`
- `LogoutUseCase.ts`

Chaque contrat représente une opération métier identifiable.

Ne regroupe pas plusieurs opérations indépendantes dans une interface unique.

## 4. Implémentations de Use Cases

Les implémentations utilisent le suffixe `Impl`.

Format :

`<Action><Entity>UseCaseImpl.ts`

Exemples :

- `CreateTaskUseCaseImpl.ts`
- `UpdateTaskUseCaseImpl.ts`
- `DeleteTaskUseCaseImpl.ts`
- `LoginUseCaseImpl.ts`
- `RegisterUseCaseImpl.ts`
- `LogoutUseCaseImpl.ts`

Exemple :

```typescript
export class CreateTaskUseCaseImpl
  implements CreateTaskUseCase {
  // Implémentation
}
```

Le nom de la classe doit correspondre exactement au contrat implémenté, avec le suffixe `Impl`.

Ne nomme pas une implémentation `CreateTaskService` lorsqu'il s'agit réellement d'un Use Case.

## 5. Contrats de repositories

Les contrats de repositories utilisent le format :

`<Action><Entity>Repository.ts`

Exemples :

- `CreateTaskRepository.ts`
- `UpdateTaskRepository.ts`
- `DeleteTaskRepository.ts`
- `LoginRepository.ts`
- `RegisterRepository.ts`

Ils définissent les opérations d'accès aux données nécessaires au métier.

Ne confonds pas contrat de repository et implémentation technique.

## 6. Implémentations de repositories

Les implémentations utilisent le suffixe `RepositoryImpl`.

Convention :

`<Entity><Action>RepositoryImpl.ts`

Exemples :

- `TaskCreateRepositoryImpl.ts`
- `TaskUpdateRepositoryImpl.ts`
- `TaskDeleteRepositoryImpl.ts`
- `UserLoginRepositoryImpl.ts`
- `UserRegisterRepositoryImpl.ts`

Exemple :

```typescript
export class TaskCreateRepositoryImpl
  implements CreateTaskRepository {
  // Implémentation
}
```

Cette convention permet de distinguer immédiatement :

- `CreateTaskRepository` : contrat.
- `TaskCreateRepositoryImpl` : implémentation.

Ne change pas cette convention selon les fonctionnalités.

## 7. Services

Les services représentent des intégrations ou responsabilités techniques.

Leur nom doit exprimer leur rôle.

Exemples :

- `FirebaseAuthService.ts`
- `FirebaseAdminService.ts`
- `PrismaTaskService.ts`
- `MinioStorageService.ts`

Une classe de service doit rester suffisamment précise pour identifier son domaine d'intervention.

Évite les noms génériques tels que :

- `CommonService`
- `GlobalService`
- `MainService`
- `HelperService`

Ne crée pas un service simplement pour déplacer quelques lignes de code.

## 8. Modèles et types

Les types et modèles doivent posséder des noms descriptifs.

Exemples :

- `User.ts`
- `Session.ts`
- `LoginInput.ts`
- `LoginResult.ts`
- `RegisterInput.ts`
- `Task.ts`
- `TaskStatus.ts`

### Règles

Un modèle métier ne doit pas porter le nom d'une technologie.

Évite les noms comme :

- `FirebaseUser`
- `PrismaTask`
- `NextUser`

Ces noms peuvent être appropriés pour des structures techniques spécifiques, mais pas pour les modèles métier indépendants des fournisseurs.

Les types d'entrée et de sortie doivent exprimer leur utilisation.

Exemples :

- `CreateTaskInput`
- `CreateTaskResult`
- `LoginInput`
- `LoginResult`

Ne définis pas un même type dans plusieurs fichiers.

Ne crée pas un fichier de types global qui rassemble sans distinction tous les types du projet.

Un type doit être placé dans le périmètre auquel il appartient.

## 9. Erreurs

Les erreurs centralisées doivent utiliser des noms explicites.

Exemple :

```typescript
export const AUTH_ERRORS = {
  USER_NOT_FOUND: {
    code: "AUTH_USER_NOT_FOUND",
    message: "Utilisateur introuvable",
  },
} as const;
```

Conventions :

- Catalogue : `<FEATURE>_ERRORS`.
- Code : `FEATURE_ERROR_DESCRIPTION`.
- Propriété : description explicite en UPPER_SNAKE_CASE.

Exemples :

- `AUTH_ERRORS`
- `TASK_ERRORS`
- `USER_NOT_FOUND`
- `INVALID_CREDENTIALS`

Ne crée pas de catalogue supplémentaire si un catalogue adapté existe déjà.

## 10. Presentation

### Screens

Format :

`<Feature><Purpose>Screen.tsx`

Exemples :

- `LoginScreen.tsx`
- `RegisterScreen.tsx`
- `ForgotPasswordScreen.tsx`
- `TaskListScreen.tsx`

### Components

Format :

`<Purpose>Component.tsx`

Exemples :

- `LoginFormComponent.tsx`
- `PasswordFieldComponent.tsx`
- `TaskCardComponent.tsx`

Lorsque le contexte du dossier rend le nom suffisamment explicite, évite les suffixes redondants.

Exemple :

Dans `presentation/components/`, `LoginForm.tsx` peut être préférable à `LoginFormComponent.tsx`.

Privilégie la cohérence du projet plutôt que l'ajout mécanique de suffixes.

### Hooks

Format :

`use<Purpose>.ts`

Exemples :

- `useLogin.ts`
- `useRegister.ts`
- `useAuthSession.ts`

### Styles

Format :

`<Component>.styles.ts`

Exemples :

- `LoginScreen.styles.ts`
- `LoginForm.styles.ts`

Respecte également les conventions de styling déjà utilisées dans le projet.

### Types de présentation

Format :

`<Purpose>Types.ts` uniquement lorsque plusieurs types étroitement liés justifient réellement leur regroupement.

Sinon, privilégie un nom métier explicite :

- `LoginFormValues.ts`
- `PasswordFieldProps.ts`
- `LoginScreenProps.ts`

Ne crée pas systématiquement un fichier de types pour chaque composant.

## 11. Dossiers

Les dossiers utilisent exclusivement le kebab-case.

Exemples :

```text
verify-session/
forgot-password/
reset-password/
task-management/
```

Les noms doivent exprimer une responsabilité ou une opération.

Évite :

- `misc/`
- `common/` sans périmètre défini.
- `stuff/`
- `helpers/` fourre-tout.
- `utils/` sans responsabilité précise.

## 12. Méthodes et propriétés

Les méthodes utilisent le camelCase.

Exemples :

```typescript
execute()
create()
update()
delete()
verifySession()
refreshSession()
```

Les Use Cases peuvent utiliser une méthode commune `execute()` lorsque cela correspond au contrat du projet.

Les propriétés doivent être descriptives :

```typescript
private readonly userRepository: UserRepository;
private readonly authService: FirebaseAuthService;
```

Évite les noms trop courts :

```typescript
private readonly repo;
private readonly svc;
private readonly data;
```

## 13. Cohérence des noms

Un même concept doit conserver le même vocabulaire dans toute la fonctionnalité.

Exemple :

Si le projet utilise `Login`, ne mélange pas arbitrairement :

- `SignIn`
- `Authenticate`
- `Connect`
- `Login`

Ces termes peuvent avoir des significations différentes. Leur utilisation doit correspondre aux opérations métier réellement définies.

Avant de créer un nouveau nom, examine les conventions déjà établies.

Ne renomme pas arbitrairement les éléments existants lorsque leur nom est déjà cohérent.

## 14. Anti-sur-ingénierie

Ne crée pas de noms artificiellement longs pour donner une impression de précision.

Ne multiplie pas les suffixes sans valeur ajoutée.

Ne crée pas :

- `AbstractCreateTaskUseCaseBase`.
- `GenericRepositoryManager`.
- `CommonAuthenticationHelper`.
- `UniversalDataProcessor`.

Un nom doit refléter la responsabilité réelle, pas une architecture hypothétique.

## 15. Vérification finale

Avant de terminer une modification, vérifier :

- Les dossiers utilisent le kebab-case.
- Les fichiers TypeScript utilisent le PascalCase.
- Les classes et interfaces utilisent le PascalCase.
- Les variables et méthodes utilisent le camelCase.
- Les constantes utilisent le UPPER_SNAKE_CASE.
- Les contrats de Use Cases portent le suffixe `UseCase`.
- Les implémentations de Use Cases portent le suffixe `UseCaseImpl`.
- Les contrats de repositories portent le suffixe `Repository`.
- Les implémentations de repositories portent le suffixe `RepositoryImpl`.
- Les noms correspondent aux responsabilités réelles.
- Les types ne sont pas dupliqués.
- Les conventions restent cohérentes entre les fonctionnalités.

## Règle finale

Un bon nom permet de comprendre le rôle d'un élément sans devoir lire toute son implémentation.

Privilégie toujours la précision, la cohérence et la simplicité.