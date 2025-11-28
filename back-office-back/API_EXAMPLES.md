# Exemples d'utilisation de l'API

## Base URL
```
http://localhost:3001/api
```

## Catégories

### 1. Récupérer toutes les catégories
```bash
curl http://localhost:3001/api/categories
```

### 2. Récupérer les catégories racines (sans parent)
```bash
curl http://localhost:3001/api/categories/racine
```

### 3. Récupérer une catégorie par ID
```bash
curl http://localhost:3001/api/categories/1
```

### 4. Récupérer les sous-catégories d'une catégorie
```bash
curl http://localhost:3001/api/categories/1/sous-categories
```

### 5. Créer une catégorie racine
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Salades",
    "image": "salades.jpg",
    "promo": false,
    "ordre": 5
  }'
```

### 6. Créer une sous-catégorie
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "id_parent": 1,
    "nom": "Premium Burgers",
    "promo": true,
    "ordre": 2
  }'
```

### 7. Modifier une catégorie
```bash
curl -X PUT http://localhost:3001/api/categories/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Burgers Premium",
    "image": "categorie_burger.jpeg",
    "promo": true,
    "ordre": 1
  }'
```

### 8. Supprimer une catégorie
```bash
curl -X DELETE http://localhost:3001/api/categories/5
```

## Produits

### 1. Récupérer les produits d'une catégorie
```bash
curl http://localhost:3001/api/categories/11/produits
```

### 2. Récupérer un produit par ID
```bash
curl http://localhost:3001/api/produits/1
```

### 3. Créer un produit
```bash
curl -X POST http://localhost:3001/api/produits \
  -H "Content-Type: application/json" \
  -d '{
    "categorie_id": 11,
    "nom": "Double Cheese Burger",
    "image": "double-cheese.jpg",
    "prix": 22.50,
    "promo": true,
    "description": "Double portion de fromage",
    "ordre": 2
  }'
```

### 4. Modifier un produit
```bash
curl -X PUT http://localhost:3001/api/produits/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Cheeseburger Classic",
    "image": "Cheeseburger.jpeg",
    "prix": 19.90,
    "promo": true,
    "description": "Burger revisité",
    "ordre": 1
  }'
```

### 5. Supprimer un produit
```bash
curl -X DELETE http://localhost:3001/api/produits/10
```

## Steps (Étapes de personnalisation)

### 1. Récupérer les steps d'un produit
```bash
curl http://localhost:3001/api/produits/1/steps
```

### 2. Créer un step
```bash
curl -X POST http://localhost:3001/api/steps \
  -H "Content-Type: application/json" \
  -d '{
    "produit_id": 1,
    "type": "taille",
    "nom": "Choisissez la taille",
    "description": "Sélectionnez la taille",
    "min_selection": 1,
    "max_selection": 1,
    "required": true,
    "ordre": 6
  }'
```

### 3. Modifier un step
```bash
curl -X PUT http://localhost:3001/api/steps/1 \
  -H "Content-Type: application/json" \
  -d '{
    "type": "composition_base",
    "nom": "Composition modifiée",
    "description": "Personnalisez",
    "min_selection": 0,
    "max_selection": 5,
    "required": false,
    "ordre": 1
  }'
```

### 4. Supprimer un step
```bash
curl -X DELETE http://localhost:3001/api/steps/10
```

## Step Elements (Éléments de personnalisation)

### 1. Récupérer les éléments d'un step
```bash
curl http://localhost:3001/api/steps/1/elements
```

### 2. Créer un élément
```bash
curl -X POST http://localhost:3001/api/step-elements \
  -H "Content-Type: application/json" \
  -d '{
    "step_id": 1,
    "nom": "Bacon",
    "image": "bacon.jpg",
    "description": "Bacon croustillant",
    "prix": 2.5,
    "included": false,
    "ordre": 4
  }'
```

### 3. Modifier un élément
```bash
curl -X PUT http://localhost:3001/api/step-elements/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Double Fromage",
    "image": "fromage.jpeg",
    "description": "Double portion",
    "prix": 3.0,
    "included": true,
    "ordre": 1
  }'
```

### 4. Supprimer un élément
```bash
curl -X DELETE http://localhost:3001/api/step-elements/50
```

## Menu Complet

### Récupérer le menu complet avec toute la hiérarchie
```bash
curl http://localhost:3001/api/menu-complet
```

Cette requête retourne la structure complète du menu avec :
- Toutes les catégories racines
- Leurs sous-catégories (récursif)
- Tous les produits
- Tous les steps de personnalisation
- Tous les éléments de chaque step

## Exemples avec fetch (JavaScript)

### Récupérer le menu complet
```javascript
fetch('http://localhost:3001/api/menu-complet')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erreur:', error));
```

### Créer une catégorie
```javascript
fetch('http://localhost:3001/api/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nom: 'Desserts',
    image: 'desserts.jpg',
    promo: true,
    ordre: 4
  })
})
  .then(response => response.json())
  .then(data => console.log('Catégorie créée:', data))
  .catch(error => console.error('Erreur:', error));
```

### Créer un produit
```javascript
fetch('http://localhost:3001/api/produits', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    categorie_id: 11,
    nom: 'Veggie Burger',
    image: 'veggie.jpg',
    prix: 16.90,
    promo: false,
    description: 'Burger végétarien',
    ordre: 3
  })
})
  .then(response => response.json())
  .then(data => console.log('Produit créé:', data))
  .catch(error => console.error('Erreur:', error));
```

## Tester avec Postman

1. Importez la collection en créant une nouvelle requête
2. URL de base : `http://localhost:3001/api`
3. Headers : `Content-Type: application/json`
4. Method : GET, POST, PUT ou DELETE selon l'action
5. Body (pour POST/PUT) : Raw JSON

## Codes de réponse HTTP

- `200 OK` - Requête réussie
- `201 Created` - Ressource créée avec succès
- `404 Not Found` - Ressource non trouvée
- `500 Internal Server Error` - Erreur serveur
