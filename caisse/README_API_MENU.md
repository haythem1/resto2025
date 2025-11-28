# Migration du Menu vers l'API Dynamique

## Vue d'ensemble

Le projet `caisse-restaurant` charge maintenant les données du menu dynamiquement depuis l'API backend au lieu d'utiliser des données statiques.

## Modifications apportées

### 1. Service API créé : `src/services/menuApi.ts`

Service pour communiquer avec l'API backend :

```typescript
export const menuApi = {
  getMenuComplet: async (): Promise<Categorie[]> => {
    const response = await fetch('http://localhost:5000/api/menu-complet');
    return response.json();
  }
};
```

### 2. Hook React créé : `src/hooks/useMenu.ts`

Hook personnalisé pour charger le menu avec gestion du loading et des erreurs :

```typescript
export const useMenu = () => {
  const [menuData, setMenuData] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Charge le menu au montage du composant
  }, []);

  return { menuData, loading, error, reloadMenu };
};
```

### 3. App.tsx modifié

Le composant principal utilise maintenant le hook `useMenu` :

**Avant :**
```typescript
import { menuData } from './data/menuData';
```

**Après :**
```typescript
import { useMenu } from './hooks/useMenu';

const App: React.FC = () => {
  const { menuData, loading, error } = useMenu();

  // Affichage du loading et des erreurs
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  // ... reste du code
};
```

## Structure des données

Les données retournées par l'API `/api/menu-complet` correspondent exactement à l'interface `Categorie[]` TypeScript :

```typescript
interface Categorie {
  id: number;
  nom: string;
  image: string; // URL complète construite par l'API
  promo: boolean;
  items?: Categorie[]; // Sous-catégories
  produits?: Produit[];
}

interface Produit {
  id: number;
  nom: string;
  image: string; // URL complète
  prix: number;
  promo: boolean;
  description?: string;
  steps: Step[];
}
```

## Avantages de cette migration

1. **Données centralisées** : Le menu est géré depuis le back-office
2. **Mises à jour en temps réel** : Pas besoin de redéployer l'application caisse
3. **Images complètes** : Les URLs des images sont construites automatiquement
4. **Compositions automatiques** : Les compositions de base sont incluses comme steps
5. **Gestion d'état** : Le menu peut être rechargé dynamiquement si nécessaire

## Configuration

### URL de l'API

L'URL de l'API est définie dans `src/services/menuApi.ts` :

```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

Pour la production, modifiez cette URL :

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.votre-domaine.com/api';
```

## Démarrage

### 1. Démarrer le backend

```bash
cd back-office-back
PORT=5000 node server.js
```

### 2. Démarrer l'application caisse

```bash
cd caisse-restaurant
npm start
```

L'application chargera automatiquement le menu depuis `http://localhost:5000/api/menu-complet`.

## Gestion des erreurs

### Erreur de connexion

Si le backend n'est pas accessible, l'application affiche :

```
❌ Erreur de chargement
HTTP error! status: ...
Vérifiez que le serveur backend est démarré sur http://localhost:5000
```

### Menu vide

Si l'API retourne un tableau vide, l'application fonctionnera mais n'affichera aucune catégorie.

## Structure du projet

```
caisse-restaurant/
├── src/
│   ├── services/
│   │   └── menuApi.ts          # Service API
│   ├── hooks/
│   │   └── useMenu.ts          # Hook pour charger le menu
│   ├── data/
│   │   └── menuData.ts         # Ancien fichier (gardé comme référence)
│   ├── types/
│   │   └── index.ts            # Interfaces TypeScript
│   └── App.tsx                 # Utilise useMenu()
```

## Migration depuis les données statiques

Le fichier `src/data/menuData.ts` contient encore les anciennes données statiques pour référence. Il peut être supprimé une fois que l'API fonctionne correctement.

## Test de l'API

Vous pouvez tester l'API directement :

```bash
curl http://localhost:5000/api/menu-complet | jq
```

Ou dans le navigateur :
```
http://localhost:5000/api/menu-complet
```

## Rechargement du menu

Le hook `useMenu` expose une fonction `reloadMenu()` qui peut être utilisée pour recharger le menu :

```typescript
const { menuData, reloadMenu } = useMenu();

// Recharger le menu
<button onClick={reloadMenu}>🔄 Recharger le menu</button>
```

## Compatibilité

Cette migration est **100% compatible** avec l'ancien code car :
- L'interface TypeScript `Categorie[]` reste identique
- Les composants enfants ne sont pas modifiés
- Seul le chargement des données change

## Prochaines étapes

1. ✅ Migration du menu statique vers l'API
2. 🔄 Ajouter un cache pour éviter les rechargements inutiles
3. 🔄 Implémenter un système de fallback en cas d'erreur API
4. 🔄 Ajouter un bouton de rechargement manuel du menu
5. 🔄 Synchronisation automatique avec le back-office

## Support

En cas de problème :
1. Vérifiez que le backend est démarré : `lsof -i :5000`
2. Vérifiez les logs du backend : `tail -f /tmp/backend.log`
3. Vérifiez la console du navigateur pour les erreurs
4. Testez l'API directement avec curl ou Postman
