# API Backend - Gestion Menu Restaurant

API REST pour gérer un menu de restaurant avec catégories hiérarchiques, produits et personnalisations.

## Structure de la base de données

### Tables

1. **categories** - Catégories avec hiérarchie illimitée
   - `id` : Identifiant
   - `id_parent` : ID de la catégorie parente (NULL pour catégories racines)
   - `nom` : Nom de la catégorie
   - `image` : Image de la catégorie
   - `promo` : Indicateur de promotion
   - `ordre` : Ordre d'affichage

2. **produits** - Produits du menu
   - `id` : Identifiant
   - `categorie_id` : ID de la catégorie
   - `nom`, `image`, `prix`, `promo`, `description`, `ordre`

3. **steps** - Étapes de personnalisation des produits
   - `id` : Identifiant
   - `produit_id` : ID du produit
   - `type`, `nom`, `description`
   - `min_selection`, `max_selection`, `required`, `ordre`

4. **step_elements** - Éléments de personnalisation
   - `id` : Identifiant
   - `step_id` : ID du step
   - `nom`, `image`, `description`, `prix`, `included`, `ordre`

## Installation

### 1. Installer les dépendances

```bash
cd back-office-back
npm install
```

### 2. Configuration

Créer un fichier `.env` à la racine :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
PORT=3001
```

### 3. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE restaurant_db;

# Quitter
\q
```

### 4. Exécuter les migrations

```bash
npm run migrate
```

### 5. Démarrer le serveur

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3001`

## Endpoints API

### Menu Complet

- `GET /api/menu-complet` - Récupère le menu complet avec toute la hiérarchie

### Catégories

- `GET /api/categories` - Toutes les catégories
- `GET /api/categories/racine` - Catégories racines uniquement
- `GET /api/categories/:id` - Une catégorie par ID
- `GET /api/categories/:idParent/sous-categories` - Sous-catégories d'une catégorie
- `POST /api/categories` - Créer une catégorie
- `PUT /api/categories/:id` - Modifier une catégorie
- `DELETE /api/categories/:id` - Supprimer une catégorie

**Body pour créer/modifier :**
```json
{
  "id_parent": 1,
  "nom": "Burgers",
  "image": "burgers.jpg",
  "promo": true,
  "ordre": 1
}
```

### Produits

- `GET /api/categories/:categorieId/produits` - Produits d'une catégorie
- `GET /api/produits/:id` - Un produit par ID
- `POST /api/produits` - Créer un produit
- `PUT /api/produits/:id` - Modifier un produit
- `DELETE /api/produits/:id` - Supprimer un produit

**Body pour créer/modifier :**
```json
{
  "categorie_id": 1,
  "nom": "Cheeseburger",
  "image": "cheese.jpg",
  "prix": 18.5,
  "promo": false,
  "description": "Délicieux burger",
  "ordre": 1
}
```

### Steps (Étapes de personnalisation)

- `GET /api/produits/:produitId/steps` - Steps d'un produit
- `POST /api/steps` - Créer un step
- `PUT /api/steps/:id` - Modifier un step
- `DELETE /api/steps/:id` - Supprimer un step

**Body pour créer/modifier :**
```json
{
  "produit_id": 1,
  "type": "composition_base",
  "nom": "Composition de base",
  "description": "Retirez les ingrédients",
  "min_selection": 0,
  "max_selection": 4,
  "required": false,
  "ordre": 1
}
```

### Step Elements

- `GET /api/steps/:stepId/elements` - Éléments d'un step
- `POST /api/step-elements` - Créer un élément
- `PUT /api/step-elements/:id` - Modifier un élément
- `DELETE /api/step-elements/:id` - Supprimer un élément

**Body pour créer/modifier :**
```json
{
  "step_id": 1,
  "nom": "Fromage",
  "image": "fromage.jpg",
  "description": "Fromage cheddar",
  "prix": 2.5,
  "included": true,
  "ordre": 1
}
```

## Exemple de structure hiérarchique

```
Catégorie Racine: Burgers (id: 1, id_parent: NULL)
├── Sous-catégorie: Classics (id: 11, id_parent: 1)
│   ├── Produit: Cheeseburger
│   └── Produit: Bacon Burger
└── Sous-catégorie: Premium (id: 12, id_parent: 1)
    └── Sous-sous-catégorie: Signature (id: 121, id_parent: 12)
        └── Produit: Premium Beef
```

## Scripts disponibles

- `npm start` - Démarrer le serveur
- `npm run dev` - Démarrer en mode développement
- `npm run migrate` - Créer les tables dans la base de données

## Technologies utilisées

- Node.js
- Express.js
- PostgreSQL (pg)
- dotenv
- cors
- body-parser
