const validator = require('../validators/orderValidator');
const db = require('../config/database');
const socket = require('../socket');

// paymentState: 0 = non encaissé, 1 = encaissé
function mapPaymentState(input) {
  if (typeof input === 'number') {
    return input === 0 || input === 1 ? input : 0;
  }
  // Si c'est une string, convertir en integer
  if (input === 'paid' || input === 1) return 1;
  return 0; // pending ou autre = 0
}

exports.createOrder = async (req, res) => {
  const { value } = validator.validateOrder(req.body);
  console.log('Creating order with data:', value);

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // etat: 0 = en attente de confirmation (commande mobile), 1 = confirmée (commande caisse)
    const etat = value.etat !== undefined ? value.etat : 1; // Par défaut confirmée

    const insertOrderText = `
      INSERT INTO orders (total, table_number, note, "paymentState", etat, sale_mode, payment_mode, order_date, id_caissier)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id, created_at, etat, id_caissier
    `;

    const orderValues = [
      value.total,
      value.table || null,
      value.note || null,
      mapPaymentState(value.paymentState),
      etat,
      value.saleMode,
      value.paymentMode,
      value.date,
      value.idCaissier || null,
    ];

    const orderRes = await client.query(insertOrderText, orderValues);
    const orderId = orderRes.rows[0].id;

    const createdItems = [];

    const insertItemText = `
      INSERT INTO items (order_id, product_id, category_id, nom, quantity, unit_price, total_price)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, product_id, category_id, nom, quantity, unit_price, total_price
    `;

    const insertSelectedElementText = `
      INSERT INTO selected_elements (item_id, nom, step_type)
      VALUES ($1,$2,$3)
      RETURNING id, nom, step_type
    `;

    for (const it of value.items) {
      const itemValues = [
        orderId,
        it.productId,
        it.category_id,
        it.nom,
        it.quantity,
        it.unitPrice,
        it.totalPrice,
      ];

      const itemRes = await client.query(insertItemText, itemValues);
      const itemRow = itemRes.rows[0];
      const selElems = [];

      for (const se of it.selectedElements || []) {
        const selRes = await client.query(insertSelectedElementText, [
          itemRow.id,
          se.nom,
          se.stepType,
        ]);
        selElems.push(selRes.rows[0]);
      }

      createdItems.push(Object.assign({}, itemRow, { selectedElements: selElems }));
    }

    await client.query('COMMIT');

    const createdOrder = {
      id: orderId,
      total: value.total,
      table: value.table || null,
      note: value.note || null,
      paymentState: value.paymentState || 'pending',
      etat: orderRes.rows[0].etat,
      saleMode: value.saleMode,
      paymentMode: value.paymentMode,
      date: value.date,
      items: createdItems,
      createdAt: orderRes.rows[0].created_at,
      idCaissier: orderRes.rows[0].id_caissier,
    };

    // Emit order to kitchen via socket.io only if etat = 1 (confirmée)
    if (etat === 1) {
      try {
        const io = socket.getIO();
        io.emit('newOrder', createdOrder);
      } catch (e) {
        // If socket not initialized, ignore
        console.warn('Socket not initialized: cannot emit newOrder');
      }
    }

    return res.status(201).json(createdOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
};

exports.getOrders = async (req, res) => {
  try {
    // Filtrer par id_caissier si fourni dans les query params
    // Inclut aussi les commandes avec id_caissier = 0 (commandes app mobile)
    const { idCaissier } = req.query;
    let ordersRes;

    if (idCaissier) {
      const caissierIdInt = parseInt(idCaissier, 10);
      if (Number.isNaN(caissierIdInt)) {
        return res.status(400).json({ error: 'Invalid idCaissier' });
      }
      ordersRes = await db.query(
        'SELECT * FROM orders WHERE id_caissier = $1 OR id_caissier = 0 OR id_caissier IS NULL ORDER BY id DESC',
        [caissierIdInt]
      );
    } else {
      ordersRes = await db.query('SELECT * FROM orders ORDER BY id DESC');
    }

    const orders = [];

    for (const o of ordersRes.rows) {
      const itemsRes = await db.query('SELECT * FROM items WHERE order_id = $1', [o.id]);
      const items = [];
      for (const it of itemsRes.rows) {
        const selRes = await db.query('SELECT nom, step_type FROM selected_elements WHERE item_id = $1', [it.id]);
        items.push(Object.assign({}, it, { selectedElements: selRes.rows }));
      }
      orders.push(Object.assign({}, o, { items }));
    }

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Returns only today's orders for the kitchen view
exports.getOrdersCuisine = async (req, res) => {
  try {
    const ordersRes = await db.query(
      'SELECT * FROM orders WHERE order_date::date = CURRENT_DATE ORDER BY id DESC'
    );
    const orders = [];

    for (const o of ordersRes.rows) {
      const itemsRes = await db.query('SELECT * FROM items WHERE order_id = $1', [o.id]);
      const items = [];
      for (const it of itemsRes.rows) {
        const selRes = await db.query('SELECT nom, step_type FROM selected_elements WHERE item_id = $1', [it.id]);
        items.push(Object.assign({}, it, { selectedElements: selRes.rows }));
      }
      orders.push(Object.assign({}, o, { items }));
    }

    res.json(orders);
  } catch (err) {
    console.error('Error fetching today\'s orders for cuisine:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updatePayment = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const { error, value } = validator.validatePaymentUpdate(req.body);
  if (error) return res.status(400).json({ errors: error.details });

  const paymentState = mapPaymentState(value.paymentState);
  if (!paymentState) return res.status(400).json({ error: 'Invalid paymentState' });

  try {
    const updateRes = await db.query(
      'UPDATE orders SET "paymentState" = $1, payment_mode = $2 WHERE id = $3 RETURNING *',
      [paymentState, value.paymentMode, id]
    );

    if (updateRes.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const o = updateRes.rows[0];

    // fetch items + selectedElements
    const itemsRes = await db.query('SELECT * FROM items WHERE order_id = $1', [o.id]);
    const items = [];
    for (const it of itemsRes.rows) {
      const selRes = await db.query('SELECT nom, step_type FROM selected_elements WHERE item_id = $1', [it.id]);
      items.push(Object.assign({}, it, { selectedElements: selRes.rows }));
    }

    const result = Object.assign({}, o, { items });
    return res.json(result);
  } catch (err) {
    console.error('Error updating payment:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateOrder = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const { value } = validator.validateOrder(req.body);

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Update order
    const updateOrderText = `
      UPDATE orders SET total = $1, table_number = $2, note = $3,  sale_mode = $4, payment_mode = $5, order_date = $6
      WHERE id = $7
      RETURNING id, created_at
    `;

    const orderValues = [
      value.total,
      value.table || null,
      value.note || null,
      value.saleMode,
      value.paymentMode || null,
      value.date,
      id,
    ];
    console.log({orderValues})
    const orderRes = await client.query(updateOrderText, orderValues);
    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderId = orderRes.rows[0].id;

    // Delete old items and selected elements (cascade)
    await client.query('DELETE FROM items WHERE order_id = $1', [orderId]);

    // Insert new items and selected elements
    const createdItems = [];
    const insertItemText = `
      INSERT INTO items (order_id, product_id, category_id, nom, quantity, unit_price, total_price)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, product_id, category_id, nom, quantity, unit_price, total_price
    `;

    const insertSelectedElementText = `
      INSERT INTO selected_elements (item_id, nom, step_type)
      VALUES ($1,$2,$3)
      RETURNING id, nom, step_type
    `;

    for (const it of value.items) {
      const itemValues = [
        orderId,
        it.productId,
        it.category_id,
        it.nom,
        it.quantity,
        it.unitPrice,
        it.totalPrice,
      ];

      const itemRes = await client.query(insertItemText, itemValues);
      const itemRow = itemRes.rows[0];
      const selElems = [];

      for (const se of it.selectedElements || []) {
        const selRes = await client.query(insertSelectedElementText, [
          itemRow.id,
          se.nom,
          se.stepType,
        ]);
        selElems.push(selRes.rows[0]);
      }

      createdItems.push(Object.assign({}, itemRow, { selectedElements: selElems }));
    }

    await client.query('COMMIT');

    const updatedOrder = {
      id: orderId,
      total: value.total,
      table: value.table || null,
      note: value.note || null,
      saleMode: value.saleMode,
      paymentMode: value.paymentMode || null,
      date: value.date,
      items: createdItems,
      createdAt: orderRes.rows[0].created_at,
    };

    return res.json(updatedOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating order:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
};

exports.updateItemEtat = async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (Number.isNaN(itemId)) return res.status(400).json({ error: 'Invalid itemId' });

  const { etat_cuisine } = req.body;
  if (!Number.isFinite(etat_cuisine) || etat_cuisine < 0 || etat_cuisine > 2) {
    return res.status(400).json({ error: 'Invalid etat_cuisine. Must be 0, 1, or 2' });
  }

  try {
    const result = await db.query(
      'UPDATE items SET etat_cuisine = $1 WHERE id = $2 RETURNING id, order_id, etat_cuisine',
      [etat_cuisine, itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedItem = result.rows[0];
    return res.json(updatedItem);
  } catch (err) {
    console.error('Error updating item etat:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Confirmer une commande (passer etat de 0 à 1)
// Cette action envoie aussi la commande vers la cuisine via socket
exports.confirmOrder = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    // Mettre à jour l'état de la commande
    const updateRes = await db.query(
      'UPDATE orders SET etat = 1 WHERE id = $1 RETURNING *',
      [id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const o = updateRes.rows[0];

    // Récupérer les items et selectedElements
    const itemsRes = await db.query('SELECT * FROM items WHERE order_id = $1', [o.id]);
    const items = [];
    for (const it of itemsRes.rows) {
      const selRes = await db.query('SELECT nom, step_type FROM selected_elements WHERE item_id = $1', [it.id]);
      items.push(Object.assign({}, it, { selectedElements: selRes.rows }));
    }

    const confirmedOrder = Object.assign({}, o, { items });

    // Envoyer la commande confirmée vers la cuisine via socket
    try {
      const io = socket.getIO();
      io.emit('newOrder', confirmedOrder);
      io.emit('orderConfirmed', confirmedOrder);
    } catch (e) {
      console.warn('Socket not initialized: cannot emit orderConfirmed');
    }

    return res.json(confirmedOrder);
  } catch (err) {
    console.error('Error confirming order:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
