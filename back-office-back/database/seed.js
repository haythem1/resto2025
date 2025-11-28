const pool = require('../config/database');

const seedData = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Démarrage du seed...');

    // Créer les catégories racines
    const burgerCat = await client.query(`
      INSERT INTO categories (nom, image, promo, ordre)
      VALUES ('Burgers', 'categorie_burger.jpeg', true, 1)
      RETURNING id
    `);
    const burgerCatId = burgerCat.rows[0].id;

    const pizzaCat = await client.query(`
      INSERT INTO categories (nom, image, promo, ordre)
      VALUES ('Pizzas1', 'categorie_pizza.jpeg', false, 2)
      RETURNING id
    `);
    const pizzaCatId = pizzaCat.rows[0].id;

    const boissonsCat = await client.query(`
      INSERT INTO categories (nom, image, promo, ordre)
      VALUES ('Boissons', 'categorie_boissons.jpeg', false, 3)
      RETURNING id
    `);
    const boissonsCatId = boissonsCat.rows[0].id;

    const dessertsCat = await client.query(`
      INSERT INTO categories (nom, image, promo, ordre)
      VALUES ('Desserts', 'categorie_desserts.jpeg', true, 4)
      RETURNING id
    `);
    const dessertsCatId = dessertsCat.rows[0].id;

    console.log('✅ Catégories racines créées');

    // Créer une sous-catégorie pour Burgers
    const classicsCat = await client.query(`
      INSERT INTO categories (id_parent, nom, ordre)
      VALUES ($1, 'Classics', 1)
      RETURNING id
    `, [burgerCatId]);
    const classicsCatId = classicsCat.rows[0].id;

    console.log('✅ Sous-catégorie Classics créée');

    // Créer un produit Cheeseburger dans Classics
    const cheeseProduit = await client.query(`
      INSERT INTO produits (categorie_id, nom, image, prix, promo, description, ordre)
      VALUES ($1, 'cheese', 'Cheeseburger.jpeg', 18.5, false, 'Un délicieux burger classique avec du fromage fondant', 1)
      RETURNING id
    `, [classicsCatId]);
    const cheeseProduitId = cheeseProduit.rows[0].id;

    console.log('✅ Produit Cheeseburger créé');

    // Créer les steps pour le Cheeseburger

    // Step 1: Composition de base
    const step1 = await client.query(`
      INSERT INTO steps (produit_id, type, nom, description, min_selection, max_selection, required, ordre)
      VALUES ($1, 'composition_base', 'Composition de base', 'Retirez les ingrédients que vous ne souhaitez pas', 0, 4, false, 1)
      RETURNING id
    `, [cheeseProduitId]);
    const step1Id = step1.rows[0].id;

    await client.query(`
      INSERT INTO step_elements (step_id, nom, image, description, included, ordre)
      VALUES
        ($1, 'Fromage', 'fromage.jpeg', 'Steak haché pur boeuf 150g', true, 1),
        ($1, 'Salade', 'salade.jpeg', 'Fromage cheddar fondant', true, 2),
        ($1, 'Sauce sweet curry', 'souscury.jpeg', 'Sauce curry douce et crémeuse', true, 3)
    `, [step1Id]);

    // Step 2: Sauce Burger
    const step2 = await client.query(`
      INSERT INTO steps (produit_id, type, nom, description, min_selection, max_selection, required, ordre)
      VALUES ($1, 'Sauc Burger', 'Choisissez Sauc Burger', 'Sélectionnez le type de pain pour votre burger', 0, 4, false, 2)
      RETURNING id
    `, [cheeseProduitId]);
    const step2Id = step2.rows[0].id;

    await client.query(`
      INSERT INTO step_elements (step_id, nom, image, description, ordre)
      VALUES
        ($1, 'Mayonnaise', 'mayonaie.jpeg', 'Pain moelleux et légèrement sucré', 1),
        ($1, 'ketchup', 'pain-sesame.jpg', 'Pain classique avec graines de sésame', 2),
        ($1, 'Sauce algerien', 'pain-complet.jpg', 'Pain santé aux céréales complètes', 3),
        ($1, 'BBQ', 'pain-complet.jpg', 'Pain santé aux céréales complètes', 4)
    `, [step2Id]);

    // Step 3: Suppléments burger
    const step3 = await client.query(`
      INSERT INTO steps (produit_id, type, nom, description, min_selection, max_selection, required, ordre)
      VALUES ($1, 'supp burg', 'supp burg', 'Sélectionnez supp burg', 0, 3, false, 3)
      RETURNING id
    `, [cheeseProduitId]);
    const step3Id = step3.rows[0].id;

    await client.query(`
      INSERT INTO step_elements (step_id, nom, image, description, prix, ordre)
      VALUES
        ($1, 'Galette Pomme', 'steak-classique.jpg', 'Steak haché pur boeuf 150g', 3, 1),
        ($1, 'Fromage', 'steak-double.jpg', 'Steak haché pur boeuf 200g', 3, 2),
        ($1, 'Oeuf', 'poulet-pane.jpg', 'Filet de poulet pané et croustillant', 2, 3)
    `, [step3Id]);

    // Step 4: Frites
    const step4 = await client.query(`
      INSERT INTO steps (produit_id, type, nom, description, min_selection, max_selection, required, ordre)
      VALUES ($1, 'Frites', 'Frites', 'Ajoutez Frites', 1, 1, true, 4)
      RETURNING id
    `, [cheeseProduitId]);
    const step4Id = step4.rows[0].id;

    await client.query(`
      INSERT INTO step_elements (step_id, nom, image, description, prix, ordre)
      VALUES
        ($1, 'frit Small', 'cheddar.jpg', 'Fromage cheddar fondant', 0, 1),
        ($1, 'Frite large', 'emmental.jpg', 'Fromage emmental suisse', 1.5, 2)
    `, [step4Id]);

    // Step 5: Boissons
    const step5 = await client.query(`
      INSERT INTO steps (produit_id, type, nom, description, min_selection, max_selection, required, ordre)
      VALUES ($1, 'boissons', 'Boissons', 'Choisissez votre boisson accompagnement', 0, 2, false, 5)
      RETURNING id
    `, [cheeseProduitId]);
    const step5Id = step5.rows[0].id;

    await client.query(`
      INSERT INTO step_elements (step_id, nom, image, description, prix, ordre)
      VALUES
        ($1, 'Coca Cola', 'coca-cola.jpg', 'Soda au cola rafraîchissant', 3, 1),
        ($1, 'Fanta', 'fanta.jpg', 'Soda à l''orange pétillant', 3, 2),
        ($1, 'Sprite', 'sprite.jpg', 'Soda citron-lime rafraîchissant', 3, 3),
        ($1, 'Eau plate', 'eau-plate.jpg', 'Eau minérale naturelle', 2, 4),
        ($1, 'Eau gazeuse', 'eau-gazeuse.jpg', 'Eau pétillante rafraîchissante', 2.5, 5),
        ($1, 'Ice Tea', 'ice-tea.jpg', 'Thé glacé au citron', 3.5, 6),
        ($1, 'Jus d''orange', 'jus-orange.jpg', 'Jus d''orange pressé', 4, 7),
        ($1, 'Limonade', 'limonade.jpg', 'Limonade maison', 3, 8)
    `, [step5Id]);

    console.log('✅ Steps et éléments du Cheeseburger créés');

    // Créer quelques boissons directement dans la catégorie Boissons
    await client.query(`
      INSERT INTO produits (categorie_id, nom, image, prix, promo, description, ordre)
      VALUES
        ($1, 'Cappuccino', 'cappuccino.jpeg', 4.5, false, 'Cappuccino crémeux avec mousse de lait onctueuse', 1),
        ($1, 'Expresso', 'expresso.jpeg', 3.0, false, 'Café expresso intense et corsé', 2),
        ($1, 'Latte Macchiato', 'latte-macchiato.jpeg', 5.0, true, 'Latte macchiato avec des couches distinctes', 3)
    `, [boissonsCatId]);

    console.log('✅ Produits Boissons créés');

    // Créer quelques desserts
    await client.query(`
      INSERT INTO produits (categorie_id, nom, image, prix, promo, description, ordre)
      VALUES
        ($1, 'Fondant Chocolat', 'fondant-chocolat.jpeg', 7.0, false, 'Fondant au chocolat coulant', 1),
        ($1, 'Tiramisu', 'tiramisu.jpeg', 6.5, true, 'Tiramisu traditionnel italien', 2),
        ($1, 'Crème Brûlée', 'creme-brulee.jpeg', 6.0, false, 'Crème brûlée à la vanille', 3)
    `, [dessertsCatId]);

    console.log('✅ Produits Desserts créés');

    await client.query('COMMIT');
    console.log('✅ Seed terminé avec succès!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
