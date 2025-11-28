const pool = require('../config/database');

// Migration pour ajouter la colonne id_caissier à la table orders
const addCaissierColumn = async () => {
  const client = await pool.connect();

  try {
    // Vérifier si la colonne existe déjà
    const checkColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'id_caissier'
    `);

    if (checkColumn.rows.length === 0) {
      // Ajouter la colonne id_caissier
      await client.query(`
        ALTER TABLE orders
        ADD COLUMN id_caissier INTEGER REFERENCES caissiers(id) ON DELETE SET NULL
      `);

      // Créer un index pour améliorer les performances
      await client.query(`
        CREATE INDEX idx_orders_id_caissier ON orders(id_caissier)
      `);

      console.log('✅ Colonne id_caissier ajoutée avec succès!');
    } else {
      console.log('ℹ️ La colonne id_caissier existe déjà');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne id_caissier:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

addCaissierColumn()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
