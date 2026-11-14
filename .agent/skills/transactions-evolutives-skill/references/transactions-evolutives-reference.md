
# Référence — Transactions manuelles aujourd'hui, automatisables demain

## Schéma conceptuel

```text
                    FEATURE MÉTIER TOPDEAL
                              |
                         Use Cases
                              |
                   Port défini par TopDeal
                              |
                   Sélection via DI (Awilix)
                              |
             +----------------+----------------+
             |                |                |
       Adaptateur manuel  Adaptateur A    Adaptateur B
             |                |                |
       Validation/       API agrégateur   API opérateur
       traitement        / SDK            / SDK
       interne
```

Les flèches représentent les dépendances d'exécution. Le domaine et les Use Cases ne
connaissent pas les fournisseurs concrets.

## Exemple de séparation des responsabilités

| Élément | Responsabilité | Ne doit pas faire |
|---|---|---|
| Use Case métier | Appliquer les règles TopDeal et orchestrer l'opération | Appeler directement une API opérateur |
| Port | Définir la capacité attendue par TopDeal | Reproduire tout le SDK fournisseur |
| Adaptateur manuel | Implémenter le traitement manuel actuel | Définir seul les règles métier |
| Adaptateur fournisseur | Communiquer avec un fournisseur et convertir ses réponses | Décider seul qu'une règle métier est satisfaite |
| Webhook handler | Recevoir, authentifier et transmettre un événement | Faire confiance au payload sans vérification |
| DI / Composition Root | Choisir et assembler les implémentations | Contenir les règles de transaction |
| Interface | Présenter l'état et guider l'utilisateur | Déclarer un paiement réussi |

## Exemple de flux conceptuel

1. Un Use Case reçoit une demande métier.
2. Il vérifie les règles TopDeal et crée ou retrouve l'opération interne.
3. Il demande au port de traitement d'exécuter la capacité requise.
4. L'adaptateur actif (manuel ou fournisseur) traite la demande.
5. Le résultat est traduit en résultat interne.
6. Si une confirmation asynchrone est requise, l'opération reste dans un état d'attente.
7. Une confirmation fiable est vérifiée, dédupliquée puis appliquée au cycle de vie métier.
8. L'interface lit l'état interne.

Ce flux est illustratif : les étapes exactes dépendent du fournisseur et des règles
métier confirmées.

## Évolution sans rupture

| Étape | État de l'application |
|---|---|
| Version actuelle | Le port est implémenté par l'adaptateur manuel |
| Ajout fournisseur | Un adaptateur est développé et testé sans changer le domaine |
| Activation | La DI/configuration sélectionne le nouvel adaptateur pour le périmètre décidé |
| Coexistence éventuelle | Manuel et automatique peuvent coexister si le produit le demande |
| Changement de fournisseur | Un nouvel adaptateur remplace ou complète l'ancien, sans propager son SDK |

## Rappel essentiel

L'objectif n'est pas de construire dès maintenant une plateforme de paiement universelle.
L'objectif est de ne pas enfermer TopDeal dans le traitement manuel : une abstraction
métier stable, un adaptateur manuel simple, puis des adaptateurs automatiques lorsque
les fournisseurs et les règles seront connus.
