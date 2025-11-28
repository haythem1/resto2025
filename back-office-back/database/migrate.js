const pool = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Table des catégories avec hiérarchie (id_parent pour sous-catégories illimitées)
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        id_parent INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        nom VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        promo BOOLEAN DEFAULT false,
        ordre INTEGER DEFAULT 0,
        etat INTEGER DEFAULT 1 CHECK (etat IN (0, 1)),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des produits
    await client.query(`
      CREATE TABLE IF NOT EXISTS produits (
        id SERIAL PRIMARY KEY,
        categorie_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        nom VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        prix DECIMAL(10, 2) NOT NULL,
        promo BOOLEAN DEFAULT false,
        description TEXT,
        ordre INTEGER DEFAULT 0,
        etat INTEGER DEFAULT 1 CHECK (etat IN (0, 1)),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des étapes de personnalisation
    await client.query(`
      CREATE TABLE IF NOT EXISTS steps (
        id SERIAL PRIMARY KEY,
        produit_id INTEGER REFERENCES produits(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        min_selection INTEGER DEFAULT 0,
        max_selection INTEGER DEFAULT 1,
        required BOOLEAN DEFAULT false,
        ordre INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des éléments de personnalisation
    await client.query(`
      CREATE TABLE IF NOT EXISTS step_elements (
        id SERIAL PRIMARY KEY,
        step_id INTEGER REFERENCES steps(id) ON DELETE CASCADE,
        nom VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        description TEXT,
        prix DECIMAL(10, 2) DEFAULT 0,
        included BOOLEAN DEFAULT false,
        ordre INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Index pour améliorer les performances
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_categories_parent
      ON categories(id_parent)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_produits_categorie
      ON produits(categorie_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_steps_produit
      ON steps(produit_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_step_elements_step
      ON step_elements(step_id)
    `);

    await client.query('COMMIT');
    console.log('✅ Tables créées avec succès!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
