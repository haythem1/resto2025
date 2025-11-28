# Restaurant Kiosk Application

Application de borne de commande pour restaurant développée en React TypeScript.

## Fonctionnalités

- 🎨 Page d'accueil avec carousel de 3 publicités
- 🍽️ Sélection du mode de vente (Sur place / À emporter)
- 📋 Menu avec catégories en sidebar
- 🛒 Panier de commande
- ⚙️ Customisation des produits avec steps et compositions
- 💰 Gestion des promotions

## Installation

```bash
npm install
# ou
yarn install
```

## Démarrage

```bash
npm run dev
# ou
yarn dev
```

L'application sera disponible sur `http://localhost:3002`

## Configuration

Créez un fichier `.env` à la racine du projet :

```
VITE_API_URL=http://localhost:5000
```

## Technologies

- React 18
- TypeScript
- React Router DOM
- Axios
- Vite

## Structure du projet

```
src/
├── components/      # Composants réutilisables
├── pages/          # Pages de l'application
├── hooks/          # Custom hooks
├── types/          # Définitions TypeScript
└── App.tsx         # Composant principal
```
