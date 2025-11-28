# Fonctionnalité : Copier un Produit dans les Step Elements

## Description

Cette fonctionnalité permet de copier automatiquement les informations d'un produit existant (nom, image, prix, description) lors de la création d'un élément dans un step de personnalisation.

## Cas d'usage

Lorsque vous créez un step de personnalisation (par exemple "Choisir votre boisson"), vous pouvez ajouter des produits existants comme options au lieu de saisir manuellement toutes les informations.

### Exemple concret

**Step**: "Choisir votre boisson"
- Coca-Cola (copié depuis le produit "Coca-Cola 33cl")
- Fanta (copié depuis le produit "Fanta 33cl")
- Sprite (copié depuis le produit "Sprite 33cl")

Au lieu de retaper manuellement le nom, le prix et l'image de chaque boisson, vous sélectionnez simplement le produit existant et toutes les informations sont copiées automatiquement.

## Backend

### Nouveau endpoint

**GET /api/produits**
- Récupère la liste de tous les produits (toutes catégories confondues)
- Utilisé pour alimenter le sélecteur de produits dans le formulaire

```javascript
// Exemple de réponse
[
  {
    "id": 1,
    "categorie_id": 5,
    "nom": "Coca-Cola 33cl",
    "image": "coca-cola.jpg",
    "prix": "2.50",
    "promo": false,
    "description": "Boisson gazeuse",
    "ordre": 1,
    "etat": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  ...
]
```

### Fichiers modifiés

- `models/menuModel.js` : Ajout de `getAllProduits()`
- `controllers/menuController.js` : Ajout de `getAllProduits()`
- `routes/menuRoutes.js` : Ajout de la route `GET /produits`

## Frontend

### Interface utilisateur

Dans le formulaire d'ajout d'élément (Step Element), un nouveau sélecteur permet de :
1. Voir tous les produits disponibles avec leur prix
2. Sélectionner un produit
3. Copier automatiquement ses informations (nom, image, description, prix)
4. Modifier les valeurs copiées si nécessaire

### Fonctionnement

1. L'utilisateur ouvre le formulaire "Nouvel élément"
2. Un menu déroulant "Copier depuis un produit existant" affiche tous les produits
3. Format d'affichage : `Nom du produit - Prix€`
4. En sélectionnant un produit, les champs sont automatiquement remplis
5. L'utilisateur peut modifier les valeurs avant d'enregistrer

### Fichiers modifiés

- `services/api.ts` : Ajout de `produitsApi.getAll()`
- `pages/ProduitSteps.tsx` : 
  - Ajout du state `produits` et `selectedProduitId`
  - Ajout de `loadAllProduits()` et `handleSelectProduit()`
  - Ajout du sélecteur dans le formulaire d'élément

## Avantages

1. **Gain de temps** : Pas besoin de ressaisir les informations
2. **Cohérence** : Les noms, prix et images sont identiques au produit source
3. **Flexibilité** : Les valeurs peuvent être modifiées après la copie
4. **Simplicité** : Un seul clic pour copier toutes les données

## Utilisation

### Exemple pratique

**Scénario** : Créer un menu "Burger + Boisson"

1. Créez un produit "Menu Classic" (18.00€)
2. Ajoutez un step "Choisir votre burger" :
   - Ajoutez "Burger Classic" en copiant le produit
   - Ajoutez "Burger Bacon" en copiant le produit
3. Ajoutez un step "Choisir votre boisson" :
   - Ajoutez "Coca-Cola" en copiant le produit
   - Ajoutez "Fanta" en copiant le produit

Toutes les informations (prix, images) sont copiées automatiquement depuis les produits existants !

## Notes importantes

- Le produit source n'est pas modifié
- Les modifications apportées à l'élément n'affectent pas le produit source
- Si le produit source est supprimé, l'élément reste intact (copie indépendante)
- Vous pouvez toujours créer des éléments manuellement en choisissant "-- Créer manuellement --"
