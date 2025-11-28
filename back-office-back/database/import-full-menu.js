const pool = require('../config/database');

/**
 * Script pour importer un menu complet depuis votre structure JSON
 *
 * Usage:
 * const menuData = require('./votre-menu.json');
 * importMenu(menuData);
 */

const importMenu = async (menuData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Début de l\'importation du menu...');

    for (const categorie of menuData) {
      await importCategorie(client, categorie, null);
    }

    await client.query('COMMIT');
    console.log('✅ Importation terminée avec succès!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de l\'importation:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

const importCategorie = async (client, categorie, idParent) => {
  // Insérer la catégorie
  const catResult = await client.query(`
    INSERT INTO categories (id_parent, nom, image, promo, ordre)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [idParent, categorie.nom, categorie.image || null, categorie.promo || false, 0]);

  const categorieId = catResult.rows[0].id;
  console.log(`✓ Catégorie créée: ${categorie.nom} (ID: ${categorieId})`);

  // Importer les sous-catégories (items)
  if (categorie.items && categorie.items.length > 0) {
    for (let i = 0; i < categorie.items.length; i++) {
      const item = categorie.items[i];
      await importCategorie(client, item, categorieId);
    }
  }

  // Importer les produits
  if (categorie.produits && categorie.produits.length > 0) {
    for (let i = 0; i < categorie.produits.length; i++) {
      const produit = categorie.produits[i];
      await importProduit(client, produit, categorieId, i);
    }
  }
};

const importProduit = async (client, produit, categorieId, ordre) => {
  // Insérer le produit
  const prodResult = await client.query(`
    INSERT INTO produits (categorie_id, nom, image, prix, promo, description, ordre)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `, [
    categorieId,
    produit.nom,
    produit.image || null,
    produit.prix,
    produit.promo || false,
    produit.description || null,
    ordre
  ]);

  const produitId = prodResult.rows[0].id;
  console.log(`  ✓ Produit créé: ${produit.nom} (ID: ${produitId})`);

  // Importer les steps
  if (produit.steps && produit.steps.length > 0) {
    for (let i = 0; i < produit.steps.length; i++) {
      const step = produit.steps[i];
      await importStep(client, step, produitId, i);
    }
  }
};

const importStep = async (client, step, produitId, ordre) => {
  // Insérer le step
  const stepResult = await client.query(`
    INSERT INTO steps (produit_id, type, nom, description, min_selection, max_selection, required, ordre)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `, [
    produitId,
    step.type,
    step.nom,
    step.description || null,
    step.minSelection || 0,
    step.maxSelection || 1,
    step.required || false,
    ordre
  ]);

  const stepId = stepResult.rows[0].id;
  console.log(`    ✓ Step créé: ${step.nom} (ID: ${stepId})`);

  // Importer les éléments
  if (step.elements && step.elements.length > 0) {
    for (let i = 0; i < step.elements.length; i++) {
      const element = step.elements[i];
      await importElement(client, element, stepId, i);
    }
  }
};

const importElement = async (client, element, stepId, ordre) => {
  // Insérer l'élément
  await client.query(`
    INSERT INTO step_elements (step_id, nom, image, description, prix, included, ordre)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    stepId,
    element.nom,
    element.image || null,
    element.description || null,
    element.prix || 0,
    element.included || false,
    ordre
  ]);

  console.log(`      ✓ Élément créé: ${element.nom}`);
};

// Exemple d'utilisation
// Décommentez et remplacez par votre structure de données

/*
const menuData = [
  {
    "nom": "Burgers",
    "image": "categorie_burger.jpeg",
    "promo": true,
    "items": [
      {
        "nom": "Classics",
        "produits": [
          {
            "nom": "cheese",
            "image": "Cheeseburger.jpeg",
            "prix": 18.5,
            "promo": false,
            "description": "Un délicieux burger classique",
            "steps": [...]
          }
        ]
      }
    ]
  }
];

importMenu(menuData)
  .then(() => console.log('Done'))
  .catch(err => console.error(err));
*/

module.exports = { importMenu };
