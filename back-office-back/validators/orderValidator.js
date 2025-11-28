const Joi = require('joi');

const selectedElementSchema = Joi.object({
  nom: Joi.string().required(),
  stepType: Joi.string().required(),
});

const itemSchema = Joi.object({
  productId: Joi.number().required(),
  nom: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().required(),
  totalPrice: Joi.number().required(),
  selectedElements: Joi.array().items(selectedElementSchema).required(),
});

const schema = Joi.object({
  items: Joi.array().items(itemSchema).min(1).required(),
  total: Joi.number().required(),
  table: Joi.number().optional(),
  note: Joi.string().max(1000).allow(null, '').optional(),
  paymentState: Joi.alternatives().try(
    Joi.number().valid(0, 1, 2),
    Joi.string().valid('pending', 'paid', 'cancelled')
  ).allow(null).optional(),
  etat: Joi.number().valid(0, 1).optional(), // 0 = en attente, 1 = confirmée
  saleMode: Joi.string().valid('sur_place', 'a_emporter', 'livraison', 'plan_table').required(),
  paymentMode: Joi.string().valid('especes', 'carte', 'ticket_restaurant').allow(null).optional(),
  date: Joi.date().iso().required(),
  idCaissier: Joi.number().integer().allow(null).optional(), // ID du caissier qui a créé la commande
});

function validateOrder(obj) {
  return schema.validate(obj, { abortEarly: false });
}

const updatePaymentSchema = Joi.object({
  paymentState: Joi.alternatives().try(
    Joi.number().valid(0, 1, 2),
    Joi.string().valid('pending', 'paid', 'cancelled')
  ).required(),
  paymentMode: Joi.string().valid('especes', 'carte', 'ticket_restaurant').required(),
});

function validatePaymentUpdate(obj) {
  return updatePaymentSchema.validate(obj, { abortEarly: false });
}

module.exports = { validateOrder, validatePaymentUpdate };
