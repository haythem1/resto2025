const pool = require('../config/database');

const createOrdersTables = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Supprimer les anciennes tables si elles existent (pour repartir proprement)
    await client.query('DROP TABLE IF EXISTS selected_elements CASCADE');
    await client.query('DROP TABLE IF EXISTS items CASCADE');
    await client.query('DROP TABLE IF EXISTS orders CASCADE');

    // Table des commandes
    // paymentState: 0 = non encaissé, 1 = encaissé
    // etat: 0 = en attente de confirmation (commande mobile), 1 = confirmée (commande caisse)
    await client.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        total DECIMAL(10, 2) NOT NULL,
        table_number INTEGER,
        note TEXT,
        "paymentState" INTEGER DEFAULT 0 CHECK ("paymentState" IN (0, 1)),
        etat INTEGER DEFAULT 1 CHECK (etat IN (0, 1)),
        sale_mode VARCHAR(50) NOT NULL CHECK (sale_mode IN ('sur_place', 'a_emporter', 'livraison', 'plan_table')),
        payment_mode VARCHAR(50) CHECK (payment_mode IN ('especes', 'carte', 'ticket_restaurant')),
        order_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des items de commande
    await client.query(`
      CREATE TABLE items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER,
        category_id INTEGER,
        nom VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        etat_cuisine INTEGER DEFAULT 0 CHECK (etat_cuisine IN (0, 1, 2)),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des éléments sélectionnés pour chaque item
    await client.query(`
      CREATE TABLE selected_elements (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        nom VARCHAR(255) NOT NULL,
        step_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Index pour améliorer les performances
    await client.query(`
      CREATE INDEX idx_items_order ON items(order_id)
    `);

    await client.query(`
      CREATE INDEX idx_selected_elements_item ON selected_elements(item_id)
    `);

    await client.query(`
      CREATE INDEX idx_orders_date ON orders(order_date)
    `);

    await client.query(`
      CREATE INDEX idx_orders_payment_state ON orders("paymentState")
    `);

    await client.query(`
      CREATE INDEX idx_orders_etat ON orders(etat)
    `);

    await client.query('COMMIT');
    console.log('✅ Tables des commandes créées avec succès!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createOrdersTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
