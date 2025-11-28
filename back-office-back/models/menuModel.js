const pool = require('../config/database');

class MenuModel {
  // Helper pour construire l'URL complète de l'image
  static getImageUrl(filename, type = 'produits') {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    if (filename.startsWith('/uploads')) {
      return `${process.env.BASE_URL || 'http://localhost:5000'}${filename}`;
    }
    return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${type}/${filename}`;
  }

  // ==================== CATÉGORIES ====================

  static async getAllCategories() {
    const query = `
      SELECT * FROM categories
      ORDER BY ordre ASC, id ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getCategoriesRacine() {
    const query = `
      SELECT * FROM categories
      WHERE id_parent IS NULL
      ORDER BY ordre ASC, id ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getSousCategories(idParent) {
    const query = `
      SELECT * FROM categories
      WHERE id_parent = $1
      ORDER BY ordre ASC, id ASC
    `;
    const result = await pool.query(query, [idParent]);
    return result.rows;
  }

  static async getCategoryById(id) {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Récupérer la catégorie racine pour une catégorie donnée
  static async getRootCategoryId(categoryId) {
    if (!categoryId) return null;

    const query = `
      WITH RECURSIVE category_tree AS (
        -- Cas de base: la catégorie elle-même
        SELECT id, id_parent, nom
        FROM categories
        WHERE id = $1

        UNION ALL

        -- Remonter la hiérarchie
        SELECT c.id, c.id_parent, c.nom
        FROM categories c
        INNER JOIN category_tree ct ON c.id = ct.id_parent
      )
      SELECT id, nom
      FROM category_tree
      WHERE id_parent IS NULL
      LIMIT 1
    `;

    const result = await pool.query(query, [categoryId]);
    return result.rows[0] || null;
  }

  // Obtenir le mapping de toutes les catégories vers leur catégorie racine
  static async getCategoryToRootMapping() {
    const query = `
      WITH RECURSIVE category_tree AS (
        -- Toutes les catégories comme point de départ
        SELECT id, id_parent, nom, id as original_id
        FROM categories

        UNION ALL

        -- Remonter la hiérarchie
        SELECT c.id, c.id_parent, c.nom, ct.original_id
        FROM categories c
        INNER JOIN category_tree ct ON c.id = ct.id_parent
      )
      SELECT DISTINCT
        original_id as category_id,
        (SELECT id FROM category_tree WHERE original_id = ct.original_id AND id_parent IS NULL LIMIT 1) as root_id,
        (SELECT nom FROM category_tree WHERE original_id = ct.original_id AND id_parent IS NULL LIMIT 1) as root_nom
      FROM category_tree ct
      ORDER BY original_id
    `;

    const result = await pool.query(query);

    // Créer un objet mapping { category_id: root_id }
    const mapping = {};
    result.rows.forEach(row => {
      mapping[row.category_id] = {
        root_id: row.root_id,
        root_nom: row.root_nom
      };
    });

    return mapping;
  }

  static async createCategory(data) {
    const { id_parent = null, nom, image, promo = false, ordre = 0, etat = 1 } = data;
    const query = `
      INSERT INTO categories (id_parent, nom, image, promo, ordre, etat)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [id_parent, nom, image, promo, ordre, etat]);
    return result.rows[0];
  }

  static async updateCategory(id, data) {
    const { id_parent, nom, image, promo, ordre, etat } = data;
    const query = `
      UPDATE categories
      SET id_parent = $1, nom = $2, image = $3, promo = $4, ordre = $5, etat = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [id_parent, nom, image, promo, ordre, etat, id]);
    return result.rows[0];
  }

  static async deleteCategory(id) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // ==================== PRODUITS ====================

  static async getAllProduits() {
    const query = `
      SELECT * FROM produits
      ORDER BY ordre ASC, id ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getProduitsByCategorie(categorieId) {
    const query = `
      SELECT * FROM produits
      WHERE categorie_id = $1
      ORDER BY ordre ASC, id ASC
    `;
    const result = await pool.query(query, [categorieId]);
    return result.rows;
  }

  static async getProduitById(id) {
    const query = 'SELECT * FROM produits WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async createProduit(data) {
    const {
      categorie_id,
      nom,
      image,
      prix,
      promo = false,
      description,
      ordre = 0,
      etat = 1
    } = data;

    const query = `
      INSERT INTO produits (categorie_id, nom, image, prix, promo, description, ordre, etat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [
      categorie_id,
      nom,
      image,
      prix,
      promo,
      description,
      ordre,
      etat
    ]);
    return result.rows[0];
  }

  static async updateProduit(id, data) {
    const { categorie_id, nom, image, prix, promo, description, ordre, etat } = data;
    const query = `
      UPDATE produits
      SET categorie_id = $1, nom = $2, image = $3, prix = $4, promo = $5, description = $6, ordre = $7, etat = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    const result = await pool.query(query, [categorie_id, nom, image, prix, promo, description, ordre, etat, id]);
    return result.rows[0];
  }

  static async deleteProduit(id) {
    const query = 'DELETE FROM produits WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // ==================== COMPOSITIONS DE BASE ====================

  static async getCompositionsByProduit(produitId) {
    const query = `
      SELECT p.* FROM produits p
      INNER JOIN produit_compositions pc ON p.id = pc.composition_produit_id
      WHERE pc.produit_id = $1
      ORDER BY p.nom ASC
    `;
    const result = await pool.query(query, [produitId]);
    return result.rows;
  }

  static async addCompositionToProduit(produitId, compositionProduitId) {
    const query = `
      INSERT INTO produit_compositions (produit_id, composition_produit_id)
      VALUES ($1, $2)
      ON CONFLICT (produit_id, composition_produit_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [produitId, compositionProduitId]);
    return result.rows[0];
  }

  static async removeCompositionFromProduit(produitId, compositionProduitId) {
    const query = `
      DELETE FROM produit_compositions
      WHERE produit_id = $1 AND composition_produit_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [produitId, compositionProduitId]);
    return result.rows[0];
  }

  static async setCompositionsProduit(produitId, compositionIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Supprimer toutes les compositions existantes
      await client.query('DELETE FROM produit_compositions WHERE produit_id = $1', [produitId]);

      // Ajouter les nouvelles compositions
      if (compositionIds && compositionIds.length > 0) {
        for (const compositionId of compositionIds) {
          await client.query(
            'INSERT INTO produit_compositions (produit_id, composition_produit_id) VALUES ($1, $2)',
            [produitId, compositionId]
          );
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== STEPS ====================

  static async getStepsByProduit(produitId) {
    const query = `
      SELECT * FROM steps
      WHERE produit_id = $1
      ORDER BY ordre ASC, id ASC
    `;
    const result = await pool.query(query, [produitId]);
    return result.rows;
  }

  static async createStep(data) {
    const {
      produit_id,
      type,
      nom,
      description,
      min_selection = 0,
      max_selection = 1,
      required = false,
      ordre = 0
    } = data;

    const query = `
      INSERT INTO steps (produit_id, type, nom, description, min_selection, max_selection, required, ordre)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [
      produit_id,
      type,
      nom,
      description,
      min_selection,
      max_selection,
      required,
      ordre
    ]);
    return result.rows[0];
  }

  static async updateStep(id, data) {
    const { type, nom, description, min_selection, max_selection, required, ordre } = data;
    const query = `
      UPDATE steps
      SET type = $1, nom = $2, description = $3, min_selection = $4, max_selection = $5, required = $6, ordre = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    const result = await pool.query(query, [
      type,
      nom,
      description,
      min_selection,
      max_selection,
      required,
      ordre,
      id
    ]);
    return result.rows[0];
  }

  static async deleteStep(id) {
    const query = 'DELETE FROM steps WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // ==================== STEP ELEMENTS ====================

  static async getElementsByStep(stepId) {
    const query = `
      SELECT * FROM step_elements
      WHERE step_id = $1
      ORDER BY ordre ASC, id ASC
    `;
    const result = await pool.query(query, [stepId]);
    return result.rows;
  }

  static async createStepElement(data) {
    const {
      step_id,
      nom,
      image,
      description,
      prix = 0,
      included = false,
      ordre = 0
    } = data;

    const query = `
      INSERT INTO step_elements (step_id, nom, image, description, prix, included, ordre)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      step_id,
      nom,
      image,
      description,
      prix,
      included,
      ordre
    ]);
    return result.rows[0];
  }

  static async updateStepElement(id, data) {
    const { nom, image, description, prix, included, ordre } = data;
    const query = `
      UPDATE step_elements
      SET nom = $1, image = $2, description = $3, prix = $4, included = $5, ordre = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [nom, image, description, prix, included, ordre, id]);
    return result.rows[0];
  }

  static async deleteStepElement(id) {
    const query = 'DELETE FROM step_elements WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // ==================== MENU COMPLET ====================

  static async getMenuComplet() {
    const client = await pool.connect();

    try {
      // Récupérer toutes les catégories racines (sans parent)
      const categoriesResult = await client.query(`
        SELECT * FROM categories
        WHERE id_parent IS NULL and etat=1
        ORDER BY ordre ASC, id ASC
      `);

      const menu = [];

      for (const categorie of categoriesResult.rows) {
        const categorieData = await this.buildCategorieComplete(client, categorie);
        menu.push(categorieData);
      }

      return menu;
    } finally {
      client.release();
    }
  }

  static async buildCategorieComplete(client, categorie) {
    const categorieData = {
      id: categorie.id,
      nom: categorie.nom,
      image: this.getImageUrl(categorie.image, 'categories'),
      promo: categorie.promo
    };

    // Récupérer les sous-catégories
    const sousCategoriesResult = await client.query(`
      SELECT * FROM categories
      WHERE id_parent = $1
      ORDER BY ordre ASC, id ASC
    `, [categorie.id]);

    if (sousCategoriesResult.rows.length > 0) {
      // Si la catégorie a des sous-catégories
      categorieData.items = [];

      for (const sousCategorie of sousCategoriesResult.rows) {
        const sousCategorieData = await this.buildCategorieComplete(client, sousCategorie);
        categorieData.items.push(sousCategorieData);
      }
    }

    // Récupérer les produits de cette catégorie
    const produitsResult = await client.query(`
      SELECT * FROM produits
      WHERE categorie_id = $1
      ORDER BY ordre ASC, id ASC
    `, [categorie.id]);

    if (produitsResult.rows.length > 0) {
      categorieData.produits = [];

      for (const produit of produitsResult.rows) {
        const produitData = await this.buildProduitComplet(client, produit);
        categorieData.produits.push(produitData);
      }
    }

    return categorieData;
  }

  static async buildProduitComplet(client, produit) {
    const produitData = {
      id: produit.id,
      nom: produit.nom,
      categorie_id: produit.categorie_id,
      image: this.getImageUrl(produit.image, 'produits'),
      prix: parseFloat(produit.prix),
      promo: produit.promo,
      description: produit.description,
      steps: []
    };

    // Récupérer les compositions de base du produit
    const compositionsResult = await client.query(`
      SELECT p.* FROM produits p
      INNER JOIN produit_compositions pc ON p.id = pc.composition_produit_id
      WHERE pc.produit_id = $1
      ORDER BY p.nom ASC
    `, [produit.id]);

    // Si des compositions existent, créer un step "Composition de base"
    if (compositionsResult.rows.length > 0) {
      const compositionStep = {
        type: 'composition',
        nom: 'Composition de base',
        description: 'Ingrédients inclus dans ce produit',
        minSelection: 0,
        maxSelection: compositionsResult.rows.length,
        required: false,
        elements: []
      };

      for (const composition of compositionsResult.rows) {
        const compositionElement = {
          id: composition.id,
          nom: composition.nom,
          image: this.getImageUrl(composition.image, 'produits'),
          description: composition.description,
          included: true
        };

        // Ajouter le prix seulement si > 0
        if (composition.prix > 0) {
          compositionElement.prix = parseFloat(composition.prix);
        }

        compositionStep.elements.push(compositionElement);
      }

      produitData.steps.push(compositionStep);
    }

    // Récupérer les steps du produit
    const stepsResult = await client.query(`
      SELECT * FROM steps
      WHERE produit_id = $1
      ORDER BY ordre ASC, id ASC
    `, [produit.id]);

    for (const step of stepsResult.rows) {
      const stepData = {
        type: step.type,
        nom: step.nom,
        description: step.description,
        minSelection: step.min_selection,
        maxSelection: step.max_selection,
        required: step.required,
        elements: []
      };

      // Récupérer les éléments du step
      const elementsResult = await client.query(`
        SELECT * FROM step_elements
        WHERE step_id = $1
        ORDER BY ordre ASC, id ASC
      `, [step.id]);

      for (const element of elementsResult.rows) {
        const elementData = {
          id: element.id,
          nom: element.nom,
          image: this.getImageUrl(element.image, 'elements'),
          description: element.description
        };

        if (element.prix > 0) {
          elementData.prix = parseFloat(element.prix);
        }

        if (element.included) {
          elementData.included = element.included;
        }

        stepData.elements.push(elementData);
      }

      produitData.steps.push(stepData);
    }

    return produitData;
  }
}

module.exports = MenuModel;
