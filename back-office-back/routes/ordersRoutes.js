const express = require('express');
const router = express.Router();
const controller = require('../controllers/ordersController');

router.post('/', controller.createOrder);
router.get('/', controller.getOrders);
router.get('/cuisine', controller.getOrdersCuisine);
router.patch('/:id', controller.updatePayment);
router.put('/:id', controller.updateOrder);
router.patch('/items/:itemId/etat', controller.updateItemEtat);
router.post('/:id/confirm', controller.confirmOrder); // Confirmer une commande (etat 0 -> 1)

module.exports = router;
