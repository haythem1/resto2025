const pool = require('../config/database');

// Migration pour créer la table caissiers
const createCaissiersTable = async () => {
  const client = await pool.connect();

  try {
    // Vérifier si la table existe déjà
    const checkTable = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'caissiers'
    `);

    if (checkTable.rows.length === 0) {
      // Créer la table caissiers
      await client.query(`
        CREATE TABLE caissiers (
          id SERIAL PRIMARY KEY,
          nom VARCHAR(100) NOT NULL,
          prenom VARCHAR(100) NOT NULL,
          password VARCHAR(10) NOT NULL,
          actif BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Créer un index sur le password pour les recherches rapides
      await client.query(`
        CREATE INDEX idx_caissiers_password ON caissiers(password)
      `);

      // Créer un index sur actif pour filtrer les caissiers actifs
      await client.query(`
        CREATE INDEX idx_caissiers_actif ON caissiers(actif)
      `);

      console.log('✅ Table caissiers créée avec succès!');

      // Insérer un caissier par défaut pour les tests
      await client.query(`
        INSERT INTO caissiers (nom, prenom, password)
        VALUES ('Admin', 'Caisse', '1234')
      `);

      console.log('✅ Caissier par défaut créé (password: 1234)');
    } else {
      console.log('ℹ️ La table caissiers existe déjà');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table caissiers:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createCaissiersTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
