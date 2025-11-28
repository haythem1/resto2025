const pool = require('../config/database');

// Migration pour ajouter la colonne etat à la table orders
// etat: 0 = en attente de confirmation (commande mobile), 1 = confirmée (commande caisse)
const addEtatColumn = async () => {
  const client = await pool.connect();

  try {
    // Vérifier si la colonne existe déjà
    const checkColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'etat'
    `);

    if (checkColumn.rows.length === 0) {
      // Ajouter la colonne etat
      await client.query(`
        ALTER TABLE orders
        ADD COLUMN etat INTEGER DEFAULT 1 CHECK (etat IN (0, 1))
      `);

      // Créer un index pour améliorer les performances
      await client.query(`
        CREATE INDEX idx_orders_etat ON orders(etat)
      `);

      console.log('✅ Colonne etat ajoutée avec succès!');
    } else {
      console.log('ℹ️ La colonne etat existe déjà');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne etat:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

addEtatColumn()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
