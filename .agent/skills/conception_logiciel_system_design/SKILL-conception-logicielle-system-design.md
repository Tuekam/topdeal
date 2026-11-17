---
name: conception-logicielle-system-design
description: Guide la conception logicielle avec POO, modularité, LLD, SOLID, DRY, KISS, YAGNI, design patterns, sécurité et optimisation raisonnée, sans sur-ingénierie.
---

# Skill — Conception logicielle et System Design

## Mission
Aider à concevoir, structurer, évaluer et faire évoluer des logiciels de façon claire, modulaire, maintenable, testable et suffisamment simple. Ne jamais appliquer un principe, une abstraction ou un pattern automatiquement : chaque choix doit répondre à un besoin concret.

## Déclencheurs
Utiliser ce skill pour les demandes portant sur :
- architecture et conception logicielle ;
- programmation orientée objet (POO) ;
- modularité, interfaces et contrats ;
- Low-Level Design (LLD), classes, relations et séquences ;
- SOLID, DRY, KISS et YAGNI ;
- design patterns et choix de patterns ;
- sécurité, performance, qualité et maintenabilité ;
- revue ou refonte de conception.

## Méthode obligatoire
1. Comprendre le besoin, les acteurs, les règles métier et les contraintes.
2. Distinguer exigences fonctionnelles et non fonctionnelles.
3. Commencer par la solution la plus simple qui répond correctement au besoin.
4. Définir clairement les responsabilités et les dépendances.
5. Ajouter des abstractions uniquement lorsqu'elles protègent une frontière, réduisent un couplage réel ou permettent une substitution utile.
6. Vérifier les principes de conception et les patterns potentiellement pertinents.
7. Évaluer sécurité, performance, fiabilité, testabilité et maintenabilité.
8. Valider la conception avec des scénarios, cas limites et tests.
9. Expliquer les compromis et proposer une prochaine étape limitée.

Si une information indispensable manque, poser une seule question ciblée.

## POO
- **Classe et objet :** une classe définit une structure et un comportement ; un objet est une instance.
- **Encapsulation :** protéger l'état interne et contrôler ses modifications.
- **Abstraction :** exposer les opérations utiles sans révéler les détails d'implémentation.
- **Héritage :** spécialiser un type lorsqu'une relation « est-un » est valide.
- **Polymorphisme :** permettre à plusieurs implémentations de respecter un même contrat.

Préférer la composition lorsque l'héritage n'est pas naturellement justifié. Ne pas transformer chaque donnée en classe si un type simple ou un objet de valeur suffit.

## Modularité et interfaces
Un module doit avoir une responsabilité cohérente, cacher ses détails internes, exposer un contrat limité et limiter ses dépendances. Les interfaces décrivent ce qu'un composant attend ou fournit, pas comment il l'implémente. Ne pas créer une interface pour chaque classe par automatisme.

## Low-Level Design
Selon le besoin, décrire :
- classes, types et objets principaux ;
- responsabilités et attributs importants ;
- méthodes et contrats ;
- relations et dépendances ;
- scénarios et séquences d'exécution ;
- erreurs, cas limites, invariants et tests.

Ne pas produire un diagramme volumineux si une liste de responsabilités suffit.

## Principes de conception

### SOLID
- **S — Single Responsibility:** une unité de code a une responsabilité cohérente et une raison principale de changer.
- **O — Open/Closed:** permettre l'extension sans modifier inutilement le code stable, lorsque cela est pertinent.
- **L — Liskov Substitution:** les implémentations dérivées respectent le contrat du type substitué.
- **I — Interface Segregation:** préférer des contrats ciblés aux interfaces trop larges.
- **D — Dependency Inversion:** les règles de haut niveau ne dépendent pas directement des détails techniques ; placer des contrats aux frontières pertinentes.

SOLID ne signifie pas multiplier les classes et les interfaces.

### DRY
Éviter de maintenir plusieurs copies d'une même règle ou connaissance métier. Deux blocs qui se ressemblent ne doivent être fusionnés que s'ils représentent réellement la même règle et sont susceptibles d'évoluer ensemble.

### KISS
Privilégier la solution la plus simple qui reste correcte, lisible, testable et maintenable. La simplicité ne justifie jamais de supprimer les validations ou protections nécessaires.

### YAGNI
Ne pas développer une fonctionnalité ou une abstraction avant qu'un besoin réel la justifie. Garder une évolution future possible sans la construire prématurément.

## Design patterns

### Créationnels
Factory Method, Abstract Factory, Builder, Singleton, Prototype. À envisager lorsque la création d'objets est complexe, variable ou doit être séparée de leur utilisation.

### Structurels
Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy. À envisager pour composer des objets, adapter des interfaces, isoler une dépendance ou simplifier un sous-système.

### Comportementaux
Strategy, Observer, Command, State, Template Method, Chain of Responsibility, Iterator, Mediator, Memento, Visitor, Interpreter. À envisager pour répartir les comportements, organiser la communication entre objets ou gérer la variation d'un algorithme ou d'un état.

### Décision avant d'utiliser un pattern
Répondre à ces questions :
1. Quel problème précis existe ?
2. Quelle partie du pattern résout ce problème ?
3. Une fonction, une condition ou une composition plus simple suffirait-elle ?
4. Quel coût supplémentaire le pattern introduit-il ?
5. Le besoin actuel justifie-t-il ce coût ?

Si le problème n'existe pas, ne pas appliquer le pattern. Exemple : Strategy est inutile pour une règle fiscale unique et fixe ; une méthode simple suffit tant qu'il n'existe pas plusieurs algorithmes à gérer.

## Performance et optimisation
Ne pas optimiser sur intuition seule.
1. Définir le problème et l'objectif mesurable.
2. Profiler ou mesurer pour identifier le goulot d'étranglement.
3. Examiner algorithmes et structures de données.
4. Réduire les accès réseau, disque ou base de données coûteux.
5. Examiner cache, asynchronisme et mémoire uniquement si les mesures le justifient.
6. Mesurer à nouveau.
7. Vérifier que l'optimisation ne dégrade ni sécurité, ni cohérence, ni maintenabilité.

Expliquer les compromis : complexité, mémoire, fraîcheur des données, coûts opérationnels et difficulté de débogage.

## Sécurité dès la conception
Examiner au minimum :
- authentification et autorisation, comme responsabilités distinctes ;
- moindre privilège et contrôle d'accès aux ressources ;
- validation des entrées côté serveur ;
- gestion sûre des secrets ;
- chiffrement des communications et protection des données sensibles ;
- erreurs ne révélant pas d'informations confidentielles ;
- journalisation sans secrets ;
- mises à jour des dépendances ;
- sauvegardes et reprise ;
- risques liés aux services tiers.

Adapter les contrôles au contexte. Une liste générale ne constitue pas un audit de sécurité complet.

## Standards de code et qualité
Favoriser les noms explicites, le formatage uniforme, les fonctions de taille raisonnable, une imbrication limitée, les commentaires expliquant les décisions non évidentes, la gestion explicite des erreurs, les tests pertinents, le lint, l'analyse statique, les revues de code, la refactorisation progressive et la documentation des décisions d'architecture.

Adapter les outils et conventions au langage et au dépôt existant.

## Garde-fous contre la sur-ingénierie
Éviter :
- une interface sans besoin de substitution ou de frontière ;
- une Factory sans vraie logique de création ;
- Strategy pour un seul algorithme fixe ;
- Singleton utilisé uniquement comme accès global ;
- des couches qui ne font que transmettre les appels ;
- une architecture générique pour des besoins hypothétiques ;
- des abstractions ajoutées uniquement pour « faire propre ».

Une abstraction est justifiée si elle réduit un couplage réel, protège une règle métier, clarifie une responsabilité ou rend un changement probable plus sûr.

## Format de réponse
Pour une demande de conception, utiliser lorsque pertinent :
1. Problème compris
2. Solution simple recommandée
3. Responsabilités et dépendances
4. Principes ou patterns réellement utiles
5. Ce qu'il ne faut pas ajouter maintenant
6. Exemple de code ou schéma, si utile
7. Vérifications et tests
8. Prochaine étape

Distinguer ce qui est requis, recommandé et simplement envisageable plus tard. Ne pas imposer toutes les rubriques pour une question simple.

## Contexte TopDeal
Si la demande concerne TopDeal, respecter les décisions déjà établies :
- monorepo pnpm workspaces ;
- Next.js App Router, React et TypeScript ;
- PostgreSQL existant ; Prisma limité aux adaptateurs Data ;
- Firebase Authentication derrière un port défini par l'application ;
- UUID interne TopDeal distinct du Firebase UID ;
- MinIO derrière une abstraction de stockage ;
- Awilix pour l'injection de dépendances dans `apps/web` ;
- architecture feature-first et séparation des responsabilités ;
- pas de wallet ;
- permissions administrateur gérées dans le code selon les rôles établis.

Ne pas modifier ces décisions sans expliquer le problème concret et demander validation avant un changement architectural important. Ne pas supposer qu'un SDK ou service est installé sans confirmation. Avancer progressivement : une étape à la fois, commandes adaptées à Windows si nécessaire, puis attendre le résultat de vérification.

## Principe central
**Comprendre le problème, choisir la solution la plus simple qui le résout correctement, puis introduire une abstraction ou un pattern uniquement lorsqu'un besoin concret le justifie.**
