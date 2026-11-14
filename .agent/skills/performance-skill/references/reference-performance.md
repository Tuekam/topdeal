# Référence Performance — TopDeal

Ce document complète le skill `performance` et donne des repères pratiques pour les listes, recherches et accès aux données.

## A. Contrat simple de pagination

Une réponse paginée peut contenir, selon le besoin :

- `items` : éléments de la page ;
- `pageSize` : taille de page appliquée ;
- `hasNextPage` : présence d'une page suivante ;
- `nextCursor` : curseur à transmettre pour continuer, si pagination par curseur ;
- `total` : total exact uniquement si nécessaire et calculable à un coût acceptable.

Ne pas ajouter tous ces champs systématiquement. Le contrat doit correspondre au type de pagination et au besoin de l'interface.

## B. Choix de pagination

| Besoin | Approche à envisager |
|---|---|
| Aller directement à une page précise | Décalage / numéro de page |
| Petite collection avec faible décalage | Décalage / limite |
| Grande collection ou défilement continu | Curseur |
| Flux fréquemment alimenté | Curseur basé sur un ordre stable |
| Afficher seulement « charger plus » | Curseur ou page suivante selon le stockage |

Le choix final dépend du volume, des index, du tri et des capacités de la base utilisée.

## C. Exemple conceptuel d'une recherche paginée

Pour une recherche d'annonces :
1. Valider les critères de recherche.
2. Construire les filtres côté serveur.
3. Appliquer un ordre stable, par exemple date de création puis identifiant unique.
4. Appliquer la limite et le curseur ou décalage.
5. Sélectionner uniquement les champs affichés dans la carte.
6. Retourner la page et les informations de navigation nécessaires.

Ne pas récupérer toutes les annonces puis filtrer, trier et paginer dans le navigateur.

## D. Signaux d'alerte

- Une liste récupère toutes les lignes sans limite.
- Le frontend utilise `slice` pour simuler une pagination sur une collection complète.
- Une recherche déclenche une requête à chaque frappe sans debounce.
- Les changements de filtre conservent un curseur devenu invalide.
- Le tri ne possède pas de critère secondaire unique.
- Une page charge toutes les relations de chaque élément.
- Une API renvoie des enregistrements complets alors que la vue n'utilise que quelques champs.
- Le même composant déclenche plusieurs fois la même requête.
- Une requête effectue un comptage exact coûteux sans nécessité produit.
- Un cache privé n'est pas séparé par utilisateur ou autorisation.
- Redis ou une file de tâches est introduit sans problème mesuré.

## E. Vérifications fonctionnelles de pagination

Tester au minimum :
- première page ;
- page suivante ;
- dernière page ;
- page vide ;
- collection vide ;
- filtre sans résultat ;
- changement de filtre après navigation ;
- tri avec plusieurs éléments ayant la même valeur ;
- nouveaux éléments insérés pendant la navigation, si le cas est pertinent ;
- taille de page invalide ou excessive ;
- accès non autorisé aux données d'un autre utilisateur.

## F. Indicateurs à relever

| Indicateur | Ce qu'il aide à détecter |
|---|---|
| Durée de requête SQL | Requête lente ou index manquant |
| Nombre de requêtes par page | Appels répétitifs ou N+1 |
| Taille de réponse API | Transfert excessif |
| Temps de réponse API | Coût serveur global |
| Temps de rendu | Coût React ou DOM |
| Taille du JavaScript client | Bundle trop volumineux |
| Temps de chargement de page | Expérience utilisateur globale |

Comparer les mêmes parcours, volumes et conditions autant que possible. Une mesure locale isolée ne représente pas nécessairement les performances en production.

## G. Règle de priorité

Avant d'ajouter une technologie d'optimisation, appliquer cet ordre d'examen :

1. Ne pas récupérer de données inutiles.
2. Paginer côté serveur.
3. Filtrer et trier dans la requête.
4. Sélectionner uniquement les champs nécessaires.
5. Corriger les requêtes répétées et N+1.
6. Examiner les index et le plan d'exécution.
7. Réduire les transferts et ressources frontend.
8. Mesurer à nouveau.
9. Envisager le cache ou un traitement asynchrone seulement si un problème mesuré subsiste.
