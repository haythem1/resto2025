const db = require('../config/database');
const validator = require('../validators/caissierValidator');

// Récupérer tous les caissiers
exports.getAllCaissiers = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nom, prenom, password, actif, created_at, updated_at FROM caissiers ORDER BY id DESC'
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Error fetching caissiers:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Récupérer un caissier par ID
exports.getCaissierById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const result = await db.query(
      'SELECT id, nom, prenom, password, actif, created_at, updated_at FROM caissiers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Caissier not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching caissier:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Créer un nouveau caissier
exports.createCaissier = async (req, res) => {
  const { error, value } = validator.validateCreate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }

  try {
    // Vérifier si le password existe déjà
    const existingPassword = await db.query(
      'SELECT id FROM caissiers WHERE password = $1',
      [value.password]
    );

    if (existingPassword.rows.length > 0) {
      return res.status(400).json({ error: 'Ce code PIN est déjà utilisé par un autre caissier' });
    }

    const result = await db.query(
      `INSERT INTO caissiers (nom, prenom, password, actif)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nom, prenom, password, actif, created_at, updated_at`,
      [value.nom, value.prenom, value.password, value.actif ?? true]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating caissier:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Mettre à jour un caissier
exports.updateCaissier = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const { error, value } = validator.validateUpdate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }

  try {
    // Vérifier si le caissier existe
    const existingCaissier = await db.query(
      'SELECT id FROM caissiers WHERE id = $1',
      [id]
    );

    if (existingCaissier.rows.length === 0) {
      return res.status(404).json({ error: 'Caissier not found' });
    }

    // Si le password est modifié, vérifier qu'il n'est pas déjà utilisé
    if (value.password) {
      const existingPassword = await db.query(
        'SELECT id FROM caissiers WHERE password = $1 AND id != $2',
        [value.password, id]
      );

      if (existingPassword.rows.length > 0) {
        return res.status(400).json({ error: 'Ce code PIN est déjà utilisé par un autre caissier' });
      }
    }

    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (value.nom !== undefined) {
      updates.push(`nom = $${paramIndex++}`);
      values.push(value.nom);
    }
    if (value.prenom !== undefined) {
      updates.push(`prenom = $${paramIndex++}`);
      values.push(value.prenom);
    }
    if (value.password !== undefined) {
      updates.push(`password = $${paramIndex++}`);
      values.push(value.password);
    }
    if (value.actif !== undefined) {
      updates.push(`actif = $${paramIndex++}`);
      values.push(value.actif);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(
      `UPDATE caissiers SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, nom, prenom, password, actif, created_at, updated_at`,
      values
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating caissier:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Supprimer un caissier
exports.deleteCaissier = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const result = await db.query(
      'DELETE FROM caissiers WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Caissier not found' });
    }

    return res.json({ message: 'Caissier deleted successfully', id });
  } catch (err) {
    console.error('Error deleting caissier:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Login caissier (authentification par code PIN)
exports.login = async (req, res) => {
  const { error, value } = validator.validateLogin(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }

  try {
    const result = await db.query(
      'SELECT id, nom, prenom, actif FROM caissiers WHERE password = $1',
      [value.password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Code PIN invalide' });
    }

    const caissier = result.rows[0];

    if (!caissier.actif) {
      return res.status(401).json({ error: 'Ce compte caissier est désactivé' });
    }

    return res.json({
      success: true,
      caissier: {
        id: caissier.id,
        nom: caissier.nom,
        prenom: caissier.prenom
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
