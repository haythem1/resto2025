# Système d'État pour Catégories et Produits

## Description

Une colonne `etat` a été ajoutée aux tables `categories` et `produits` pour permettre d'activer ou désactiver des éléments sans les supprimer.

## Valeurs possibles

- **1** : Actif (visible dans l'application)
- **0** : Inactif (masqué dans l'application)

## Utilisation

### Dans le back-office (admin)

Les catégories et produits inactifs sont toujours visibles et modifiables dans le back-office. Un badge "Actif" (vert) ou "Inactif" (rouge) indique l'état actuel.

Vous pouvez changer l'état via le formulaire de modification :
- Sélectionnez "Actif" pour rendre l'élément visible
- Sélectionnez "Inactif" pour le masquer temporairement

### Dans l'application client

Les éléments avec `etat = 0` ne doivent pas être affichés dans l'application cliente. Ajoutez un filtre dans vos requêtes API :

```javascript
// Exemple pour récupérer seulement les catégories actives
const categories = await categoriesApi.getAll();
const categoriesActives = categories.filter(cat => cat.etat === 1);

// Exemple pour récupérer seulement les produits actifs
const produits = await produitsApi.getByCategorie(categorieId);
const produitsActifs = produits.filter(p => p.etat === 1);
```

## Migration

### Base de données existante

Pour ajouter la colonne `etat` à une base de données existante :

```bash
node database/add_etat_column.js
```

Ce script :
- Ajoute la colonne `etat` aux tables `categories` et `produits`
- Définit la valeur par défaut à `1` (actif)
- Ajoute une contrainte CHECK pour autoriser uniquement les valeurs 0 et 1
- Tous les éléments existants sont automatiquement marqués comme actifs

### Nouvelle installation

Pour une nouvelle installation, utilisez le script de migration principal qui inclut déjà la colonne `etat` :

```bash
node database/migrate.js
```

## Cas d'usage

### Masquer temporairement un produit
- Le produit est en rupture de stock → Marquez-le comme inactif
- Le produit est de nouveau disponible → Marquez-le comme actif

### Désactiver une catégorie saisonnière
- Menu d'été terminé → Marquez la catégorie comme inactive
- Prochain été → Réactivez la catégorie

### Tests et préparation
- Préparez de nouveaux produits en avance → Créez-les comme inactifs
- Jour du lancement → Activez-les tous en une fois

## Avantages

1. **Pas de suppression** : Conservation de l'historique et des données
2. **Réversible** : Possibilité de réactiver à tout moment
3. **Rapide** : Simple changement d'état plutôt que recréation
4. **Flexible** : Gestion fine de la visibilité sans perte de données

## API Endpoints

Les endpoints existants continuent de fonctionner normalement. La colonne `etat` fait partie des données retournées :

```json
{
  "id": 1,
  "nom": "Burgers",
  "image": "burgers.jpg",
  "promo": false,
  "ordre": 1,
  "etat": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

Il est de la responsabilité de l'application cliente de filtrer les éléments selon leur état.
