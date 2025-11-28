const MenuModel = require('../models/menuModel');

class MenuController {
  // ==================== CATÉGORIES ====================

  static async getAllCategories(req, res) {
    try {
      const categories = await MenuModel.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error('Erreur getAllCategories:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async getCategoriesRacine(req, res) {
    try {
      const categories = await MenuModel.getCategoriesRacine();
      res.json(categories);
    } catch (error) {
      console.error('Erreur getCategoriesRacine:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async getSousCategories(req, res) {
    try {
      const { idParent } = req.params;
      const sousCategories = await MenuModel.getSousCategories(idParent);
      res.json(sousCategories);
    } catch (error) {
      console.error('Erreur getSousCategories:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await MenuModel.getCategoryById(id);

      if (!category) {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }

      res.json(category);
    } catch (error) {
      console.error('Erreur getCategoryById:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async getCategoryToRootMapping(req, res) {
    try {
      const mapping = await MenuModel.getCategoryToRootMapping();
      res.json(mapping);
    } catch (error) {
      console.error('Erreur getCategoryToRootMapping:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async createCategory(req, res) {
    try {
      const category = await MenuModel.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error('Erreur createCategory:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await MenuModel.updateCategory(id, req.body);

      if (!category) {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }

      res.json(category);
    } catch (error) {
      console.error('Erreur updateCategory:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await MenuModel.deleteCategory(id);

      if (!category) {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }

      res.json({ message: 'Catégorie supprimée', category });
    } catch (error) {
      console.error('Erreur deleteCategory:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // ==================== PRODUITS ====================

  static async getAllProduits(req, res) {
    try {
      const produits = await MenuModel.getAllProduits();
      res.json(produits);
    } catch (error) {
      console.error('Erreur getAllProduits:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async getProduitsByCategorie(req, res) {
    try {
      const { categorieId } = req.params;
      const produits = await MenuModel.getProduitsByCategorie(categorieId);
      res.json(produits);
    } catch (error) {
      console.error('Erreur getProduitsByCategorie:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async getProduitById(req, res) {
    try {
      const { id } = req.params;
      const produit = await MenuModel.getProduitById(id);

      if (!produit) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }

      res.json(produit);
    } catch (error) {
      console.error('Erreur getProduitById:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async createProduit(req, res) {
    try {
      const produit = await MenuModel.createProduit(req.body);
      res.status(201).json(produit);
    } catch (error) {
      console.error('Erreur createProduit:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async updateProduit(req, res) {
    try {
      const { id } = req.params;
      const produit = await MenuModel.updateProduit(id, req.body);

      if (!produit) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }

      res.json(produit);
    } catch (error) {
      console.error('Erreur updateProduit:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async deleteProduit(req, res) {
    try {
      const { id } = req.params;
      const produit = await MenuModel.deleteProduit(id);

      if (!produit) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }

      res.json({ message: 'Produit supprimé', produit });
    } catch (error) {
      console.error('Erreur deleteProduit:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // ==================== COMPOSITIONS DE BASE ====================

  static async getCompositionsByProduit(req, res) {
    try {
      const { produitId } = req.params;
      const compositions = await MenuModel.getCompositionsByProduit(produitId);
      res.json(compositions);
    } catch (error) {
      console.error('Erreur getCompositionsByProduit:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async setCompositionsProduit(req, res) {
    try {
      const { produitId } = req.params;
      const { compositionIds } = req.body;

      await MenuModel.setCompositionsProduit(produitId, compositionIds);
      const compositions = await MenuModel.getCompositionsByProduit(produitId);

      res.json({ message: 'Compositions mises à jour', compositions });
    } catch (error) {
      console.error('Erreur setCompositionsProduit:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // ==================== STEPS ====================

  static async getStepsByProduit(req, res) {
    try {
      const { produitId } = req.params;
      const steps = await MenuModel.getStepsByProduit(produitId);
      res.json(steps);
    } catch (error) {
      console.error('Erreur getStepsByProduit:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async createStep(req, res) {
    try {
      const step = await MenuModel.createStep(req.body);
      res.status(201).json(step);
    } catch (error) {
      console.error('Erreur createStep:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async updateStep(req, res) {
    try {
      const { id } = req.params;
      const step = await MenuModel.updateStep(id, req.body);

      if (!step) {
        return res.status(404).json({ error: 'Step non trouvé' });
      }

      res.json(step);
    } catch (error) {
      console.error('Erreur updateStep:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async deleteStep(req, res) {
    try {
      const { id } = req.params;
      const step = await MenuModel.deleteStep(id);

      if (!step) {
        return res.status(404).json({ error: 'Step non trouvé' });
      }

      res.json({ message: 'Step supprimé', step });
    } catch (error) {
      console.error('Erreur deleteStep:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // ==================== STEP ELEMENTS ====================

  static async getElementsByStep(req, res) {
    try {
      const { stepId } = req.params;
      const elements = await MenuModel.getElementsByStep(stepId);
      res.json(elements);
    } catch (error) {
      console.error('Erreur getElementsByStep:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async createStepElement(req, res) {
    try {
      const element = await MenuModel.createStepElement(req.body);
      res.status(201).json(element);
    } catch (error) {
      console.error('Erreur createStepElement:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async updateStepElement(req, res) {
    try {
      const { id } = req.params;
      const element = await MenuModel.updateStepElement(id, req.body);

      if (!element) {
        return res.status(404).json({ error: 'Element non trouvé' });
      }

      res.json(element);
    } catch (error) {
      console.error('Erreur updateStepElement:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async deleteStepElement(req, res) {
    try {
      const { id } = req.params;
      const element = await MenuModel.deleteStepElement(id);

      if (!element) {
        return res.status(404).json({ error: 'Element non trouvé' });
      }

      res.json({ message: 'Element supprimé', element });
    } catch (error) {
      console.error('Erreur deleteStepElement:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // ==================== MENU COMPLET ====================

  static async getMenuComplet(req, res) {
    try {
      const menu = await MenuModel.getMenuComplet();
      res.json(menu);
    } catch (error) {
      console.error('Erreur getMenuComplet:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

module.exports = MenuController;
