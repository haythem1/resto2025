# Guide d'Upload d'Images

## Vue d'ensemble

Le système d'upload permet de télécharger, gérer et servir des images pour :
- **Catégories** : Images des catégories du menu
- **Produits** : Images des plats/produits
- **Elements** : Images des ingrédients/options

## Endpoints

### 1. Upload une image

**POST** `/api/upload/:type`

Types disponibles : `categories`, `produits`, `elements`

**Format :** `multipart/form-data`

**Champ :** `image` (fichier)

**Types acceptés :** JPG, JPEG, PNG, GIF, WEBP

**Taille max :** 5MB

**Exemple avec curl :**
```bash
curl -X POST http://localhost:5000/api/upload/categories \
  -F "image=@/path/to/image.jpg"
```

**Réponse (201) :**
```json
{
  "message": "Image uploadée avec succès",
  "filename": "burger-1732631234567-123456789.jpg",
  "url": "/uploads/categories/burger-1732631234567-123456789.jpg",
  "path": "/absolute/path/to/uploads/categories/burger-1732631234567-123456789.jpg"
}
```

### 2. Lister les images

**GET** `/api/upload/:type`

**Exemple :**
```bash
curl http://localhost:5000/api/upload/categories
```

**Réponse :**
```json
{
  "images": [
    {
      "filename": "burger-1732631234567-123456789.jpg",
      "url": "/uploads/categories/burger-1732631234567-123456789.jpg",
      "path": "/absolute/path/to/file.jpg"
    },
    {
      "filename": "pizza-1732631234567-987654321.jpg",
      "url": "/uploads/categories/pizza-1732631234567-987654321.jpg",
      "path": "/absolute/path/to/file.jpg"
    }
  ]
}
```

### 3. Supprimer une image

**DELETE** `/api/upload/:type/:filename`

**Exemple :**
```bash
curl -X DELETE http://localhost:5000/api/upload/categories/burger-1732631234567-123456789.jpg
```

**Réponse :**
```json
{
  "message": "Image supprimée avec succès",
  "filename": "burger-1732631234567-123456789.jpg"
}
```

### 4. Accéder à une image

**GET** `/uploads/:type/:filename`

Les images sont servies comme fichiers statiques.

**Exemple :**
```
http://localhost:5000/uploads/categories/burger-1732631234567-123456789.jpg
```

## Utilisation avec JavaScript/Fetch

### Upload une image

```javascript
const uploadImage = async (file, type) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`http://localhost:5000/api/upload/${type}`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data;
};

// Utilisation
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

uploadImage(file, 'categories')
  .then(result => {
    console.log('Fichier uploadé:', result.filename);
    console.log('URL:', result.url);
  });
```

### Lister les images

```javascript
const listImages = async (type) => {
  const response = await fetch(`http://localhost:5000/api/upload/${type}`);
  const data = await response.json();
  return data.images;
};

listImages('categories')
  .then(images => {
    images.forEach(img => {
      console.log(`Image: ${img.filename}`);
      console.log(`URL: ${img.url}`);
    });
  });
```

### Supprimer une image

```javascript
const deleteImage = async (type, filename) => {
  const response = await fetch(
    `http://localhost:5000/api/upload/${type}/${filename}`,
    { method: 'DELETE' }
  );
  const data = await response.json();
  return data;
};

deleteImage('categories', 'burger-1732631234567-123456789.jpg')
  .then(result => {
    console.log(result.message);
  });
```

## Structure des dossiers

```
back-office-back/
├── uploads/
│   ├── categories/      # Images des catégories
│   ├── produits/        # Images des produits
│   └── elements/        # Images des éléments
```

## Workflow typique

### 1. Créer une catégorie avec image

```javascript
// 1. Upload l'image
const formData = new FormData();
formData.append('image', file);

const uploadResponse = await fetch('http://localhost:5000/api/upload/categories', {
  method: 'POST',
  body: formData
});

const uploadData = await uploadResponse.json();
const imageFilename = uploadData.filename;

// 2. Créer la catégorie avec le nom de fichier
const categorieResponse = await fetch('http://localhost:5000/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nom: 'Burgers',
    image: imageFilename,  // Utiliser le filename retourné
    promo: true,
    ordre: 1
  })
});
```

### 2. Afficher une image

```html
<!-- L'URL complète de l'image -->
<img src="http://localhost:5000/uploads/categories/burger-1732631234567-123456789.jpg"
     alt="Burger" />
```

Ou avec React :

```jsx
<img
  src={`http://localhost:5000${categorie.image}`}
  alt={categorie.nom}
/>
```

## Gestion des erreurs

### Erreurs possibles

**400 Bad Request** - Aucun fichier fourni
```json
{
  "error": "Aucun fichier fourni"
}
```

**400 Bad Request** - Type de fichier non autorisé
```json
{
  "error": "Type de fichier non autorisé. Seules les images sont acceptées."
}
```

**413 Payload Too Large** - Fichier trop volumineux (>5MB)
```json
{
  "error": "File too large"
}
```

**404 Not Found** - Image non trouvée lors de la suppression
```json
{
  "error": "Fichier non trouvé"
}
```

**500 Internal Server Error** - Erreur serveur
```json
{
  "error": "Erreur lors de l'upload"
}
```

## Sécurité

- ✅ Validation du type MIME
- ✅ Limite de taille de fichier (5MB)
- ✅ Noms de fichiers uniques (timestamp + random)
- ✅ Dossiers séparés par type
- ⚠️ TODO: Redimensionnement automatique des images
- ⚠️ TODO: Validation plus stricte (dimensions, ratio, etc.)

## Notes importantes

1. **Noms de fichiers** : Les fichiers sont automatiquement renommés avec un timestamp pour éviter les collisions

2. **Stockage en base de données** : Stockez uniquement le **nom du fichier** dans la base, pas l'URL complète

3. **URLs** : Pour afficher les images, construisez l'URL : `${API_URL}${image_path}`

4. **Suppression** : Quand vous supprimez une catégorie/produit, pensez à supprimer aussi l'image associée

5. **Backup** : Pensez à sauvegarder régulièrement le dossier `uploads/`

## Tests avec Postman

1. **Upload** :
   - Method: POST
   - URL: `http://localhost:5000/api/upload/categories`
   - Body: form-data
   - Key: `image` (type: File)
   - Value: Sélectionner un fichier image

2. **Liste** :
   - Method: GET
   - URL: `http://localhost:5000/api/upload/categories`

3. **Suppression** :
   - Method: DELETE
   - URL: `http://localhost:5000/api/upload/categories/filename.jpg`

4. **Voir l'image** :
   - Method: GET
   - URL: `http://localhost:5000/uploads/categories/filename.jpg`
