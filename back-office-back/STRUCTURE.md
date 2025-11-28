# Structure du Projet Backend

## Arborescence

```
back-office-back/
├── config/
│   └── database.js          # Configuration de la connexion PostgreSQL
├── controllers/
│   └── menuController.js    # Contrôleurs pour gérer les requêtes
├── database/
│   ├── migrate.js          # Script de migration (création des tables)
│   └── seed.js             # Script de seed (données d'exemple)
├── models/
│   └── menuModel.js        # Modèle de données (requêtes SQL)
├── routes/
│   └── menuRoutes.js       # Définition des routes API
├── .env                    # Variables d'environnement
├── .env.example           # Exemple de configuration
├── .gitignore             # Fichiers à ignorer par Git
├── package.json           # Dépendances et scripts npm
├── README.md              # Documentation complète
├── QUICK_START.md         # Guide de démarrage rapide
├── server.js              # Point d'entrée de l'application
└── test-api.http          # Tests des endpoints API
```

## Architecture

### Couche Database (database/)
- **migrate.js** : Crée toutes les tables nécessaires
- **seed.js** : Insère des données d'exemple

### Couche Model (models/)
- **menuModel.js** : Contient toutes les requêtes SQL
  - CRUD pour catégories (avec support hiérarchique)
  - CRUD pour produits
  - CRUD pour steps (étapes de personnalisation)
  - CRUD pour step_elements (éléments de personnalisation)
  - Méthode `getMenuComplet()` pour récupérer toute la hiérarchie

### Couche Controller (controllers/)
- **menuController.js** : Gère la logique métier
  - Validation des données
  - Appels aux modèles
  - Formatage des réponses
  - Gestion des erreurs

### Couche Routes (routes/)
- **menuRoutes.js** : Définit les endpoints API
  - Routes pour catégories
  - Routes pour produits
  - Routes pour steps
  - Routes pour step_elements
  - Route pour le menu complet

### Configuration (config/)
- **database.js** : Pool de connexions PostgreSQL

### Serveur (server.js)
- Configuration Express
- Middlewares (CORS, body-parser)
- Montage des routes
- Gestion des erreurs

## Tables de la base de données

### categories
```sql
id SERIAL PRIMARY KEY
id_parent INTEGER (référence categories.id)
nom VARCHAR(255)
image VARCHAR(255)
promo BOOLEAN
ordre INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

### produits
```sql
id SERIAL PRIMARY KEY
categorie_id INTEGER (référence categories.id)
nom VARCHAR(255)
image VARCHAR(255)
prix DECIMAL(10, 2)
promo BOOLEAN
description TEXT
ordre INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

### steps
```sql
id SERIAL PRIMARY KEY
produit_id INTEGER (référence produits.id)
type VARCHAR(100)
nom VARCHAR(255)
description TEXT
min_selection INTEGER
max_selection INTEGER
required BOOLEAN
ordre INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

### step_elements
```sql
id SERIAL PRIMARY KEY
step_id INTEGER (référence steps.id)
nom VARCHAR(255)
image VARCHAR(255)
description TEXT
prix DECIMAL(10, 2)
included BOOLEAN
ordre INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

## Flux de données

1. Client → Routes → Controller → Model → Database
2. Database → Model → Controller → Routes → Client (JSON)

## Exemple de hiérarchie

```
GET /api/menu-complet

[
  {
    "id": 1,
    "nom": "Burgers",
    "image": "categorie_burger.jpeg",
    "promo": true,
    "items": [
      {
        "id": 11,
        "nom": "Classics",
        "produits": [
          {
            "id": 1,
            "nom": "cheese",
            "prix": 18.5,
            "steps": [...]
          }
        ]
      }
    ]
  }
]
```
