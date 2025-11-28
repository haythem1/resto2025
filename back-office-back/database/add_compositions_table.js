const pool = require('../config/database');

const addCompositionsTable = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Table de liaison entre produits et leurs compositions de base
    await client.query(`
      CREATE TABLE IF NOT EXISTS produit_compositions (
        id SERIAL PRIMARY KEY,
        produit_id INTEGER NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
        composition_produit_id INTEGER NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(produit_id, composition_produit_id)
      )
    `);

    // Index pour améliorer les performances
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_produit_compositions_produit
      ON produit_compositions(produit_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_produit_compositions_composition
      ON produit_compositions(composition_produit_id)
    `);

    await client.query('COMMIT');
    console.log('✅ Table produit_compositions créée avec succès!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la création de la table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

addCompositionsTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
