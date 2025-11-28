const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menuController');

// ==================== CATÉGORIES ====================

// Récupérer toutes les catégories
router.get('/categories', MenuController.getAllCategories);

// Récupérer les catégories racines (sans parent)
router.get('/categories/racine', MenuController.getCategoriesRacine);

// Récupérer le mapping catégories -> catégories racines
router.get('/categories/mapping-to-root', MenuController.getCategoryToRootMapping);

// Récupérer les sous-catégories d'une catégorie
router.get('/categories/:idParent/sous-categories', MenuController.getSousCategories);

// Récupérer une catégorie par ID
router.get('/categories/:id', MenuController.getCategoryById);

// Créer une nouvelle catégorie
router.post('/categories', MenuController.createCategory);

// Mettre à jour une catégorie
router.put('/categories/:id', MenuController.updateCategory);

// Supprimer une catégorie
router.delete('/categories/:id', MenuController.deleteCategory);

// ==================== PRODUITS ====================

// Récupérer tous les produits
router.get('/produits', MenuController.getAllProduits);

// Récupérer les produits d'une catégorie
router.get('/categories/:categorieId/produits', MenuController.getProduitsByCategorie);

// Récupérer un produit par ID
router.get('/produits/:id', MenuController.getProduitById);

// Créer un nouveau produit
router.post('/produits', MenuController.createProduit);

// Mettre à jour un produit
router.put('/produits/:id', MenuController.updateProduit);

// Supprimer un produit
router.delete('/produits/:id', MenuController.deleteProduit);

// ==================== COMPOSITIONS DE BASE ====================

// Récupérer les compositions d'un produit
router.get('/produits/:produitId/compositions', MenuController.getCompositionsByProduit);

// Définir les compositions d'un produit
router.put('/produits/:produitId/compositions', MenuController.setCompositionsProduit);

// ==================== STEPS ====================

// Récupérer les steps d'un produit
router.get('/produits/:produitId/steps', MenuController.getStepsByProduit);

// Créer un nouveau step
router.post('/steps', MenuController.createStep);

// Mettre à jour un step
router.put('/steps/:id', MenuController.updateStep);

// Supprimer un step
router.delete('/steps/:id', MenuController.deleteStep);

// ==================== STEP ELEMENTS ====================

// Récupérer les éléments d'un step
router.get('/steps/:stepId/elements', MenuController.getElementsByStep);

// Créer un nouveau élément
router.post('/step-elements', MenuController.createStepElement);

// Mettre à jour un élément
router.put('/step-elements/:id', MenuController.updateStepElement);

// Supprimer un élément
router.delete('/step-elements/:id', MenuController.deleteStepElement);

// ==================== MENU COMPLET ====================

// Récupérer le menu complet avec toute la hiérarchie
router.get('/menu-complet', MenuController.getMenuComplet);

module.exports = router;
