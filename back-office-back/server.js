const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const menuRoutes = require('./routes/menuRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const caissierRoutes = require('./routes/caissierRoutes');
const socket = require('./socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', menuRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/orders', ordersRoutes);
app.use('/caissiers', caissierRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'API Restaurant - Backend fonctionnel',
    version: '1.0.0',
    endpoints: {
      menu_complet: 'GET /api/menu-complet',
      categories: {
        all: 'GET /api/categories',
        racine: 'GET /api/categories/racine',
        byId: 'GET /api/categories/:id',
        sousCategories: 'GET /api/categories/:idParent/sous-categories',
        create: 'POST /api/categories',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id'
      },
      produits: {
        byCategorie: 'GET /api/categories/:categorieId/produits',
        byId: 'GET /api/produits/:id',
        create: 'POST /api/produits',
        update: 'PUT /api/produits/:id',
        delete: 'DELETE /api/produits/:id'
      },
      steps: {
        byProduit: 'GET /api/produits/:produitId/steps',
        create: 'POST /api/steps',
        update: 'PUT /api/steps/:id',
        delete: 'DELETE /api/steps/:id'
      },
      elements: {
        byStep: 'GET /api/steps/:stepId/elements',
        create: 'POST /api/step-elements',
        update: 'PUT /api/step-elements/:id',
        delete: 'DELETE /api/step-elements/:id'
      },
      upload: {
        uploadImage: 'POST /api/upload/:type (multipart/form-data with "image" field)',
        listImages: 'GET /api/upload/:type',
        deleteImage: 'DELETE /api/upload/:type/:filename',
        types: ['categories', 'produits', 'elements'],
        staticFiles: 'GET /uploads/:type/:filename'
      },
      orders: {
        create: 'POST /orders',
        getAll: 'GET /orders',
        getCuisine: 'GET /orders/cuisine',
        updatePayment: 'PATCH /orders/:id',
        update: 'PUT /orders/:id',
        updateItemEtat: 'PATCH /orders/items/:itemId/etat'
      },
      caissiers: {
        getAll: 'GET /caissiers',
        getById: 'GET /caissiers/:id',
        create: 'POST /caissiers',
        update: 'PUT /caissiers/:id',
        delete: 'DELETE /caissiers/:id',
        login: 'POST /caissiers/login'
      }
    }
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Initialize socket.io
socket.init(server);

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

module.exports = app;
