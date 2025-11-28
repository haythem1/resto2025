# Démarrage Rapide

## Installation en 5 étapes

### 1. Installer les dépendances
```bash
cd back-office-back
npm install
```

### 2. Configurer PostgreSQL

Assurez-vous que PostgreSQL est installé et démarré.

Créer la base de données :
```bash
psql -U postgres
CREATE DATABASE restaurant_db;
\q
```

### 3. Configurer les variables d'environnement

Le fichier `.env` est déjà créé avec les valeurs par défaut :
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
```

Modifiez `DB_PASSWORD` si nécessaire.

### 4. Créer les tables
```bash
npm run migrate
```

### 5. Insérer des données d'exemple (optionnel)
```bash
npm run seed
```

### 6. Démarrer le serveur
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

## Test rapide

Ouvrez votre navigateur sur `http://localhost:3001` pour voir les endpoints disponibles.

Pour tester le menu complet :
```bash
curl http://localhost:3001/api/menu-complet
```

Ou utilisez le fichier `test-api.http` avec l'extension REST Client de VS Code.

## Commandes disponibles

- `npm start` - Démarrer le serveur en mode production
- `npm run dev` - Démarrer en mode développement (redémarre automatiquement)
- `npm run migrate` - Créer les tables dans la base de données
- `npm run seed` - Insérer des données d'exemple

## Structure de la hiérarchie

La structure utilise un système de catégories avec `id_parent` permettant une hiérarchie illimitée :

```
Catégorie (id_parent = NULL) → Racine
├── Sous-catégorie (id_parent = id_racine)
│   ├── Produits
│   └── Sous-sous-catégorie (id_parent = id_sous_cat)
│       └── Produits
```

## Endpoints principaux

- `GET /api/menu-complet` - Menu complet avec hiérarchie
- `GET /api/categories` - Toutes les catégories
- `GET /api/categories/racine` - Catégories racines
- `POST /api/categories` - Créer une catégorie
- `POST /api/produits` - Créer un produit
- `POST /api/steps` - Créer une étape de personnalisation
- `POST /api/step-elements` - Créer un élément de personnalisation

Consultez `README.md` pour la documentation complète.
