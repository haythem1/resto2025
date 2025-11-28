const express = require('express');
const router = express.Router();
const controller = require('../controllers/caissierController');

// CRUD routes
router.get('/', controller.getAllCaissiers);
router.get('/:id', controller.getCaissierById);
router.post('/', controller.createCaissier);
router.put('/:id', controller.updateCaissier);
router.delete('/:id', controller.deleteCaissier);

// Login route
router.post('/login', controller.login);

module.exports = router;
