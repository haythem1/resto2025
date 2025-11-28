const Joi = require('joi');

// Schéma pour créer un caissier
const createSchema = Joi.object({
  nom: Joi.string().min(2).max(100).required(),
  prenom: Joi.string().min(2).max(100).required(),
  password: Joi.string().pattern(/^\d{4,10}$/).required().messages({
    'string.pattern.base': 'Le mot de passe doit contenir entre 4 et 10 chiffres'
  }),
  actif: Joi.boolean().default(true)
});

// Schéma pour mettre à jour un caissier
const updateSchema = Joi.object({
  nom: Joi.string().min(2).max(100).optional(),
  prenom: Joi.string().min(2).max(100).optional(),
  password: Joi.string().pattern(/^\d{4,10}$/).optional().messages({
    'string.pattern.base': 'Le mot de passe doit contenir entre 4 et 10 chiffres'
  }),
  actif: Joi.boolean().optional()
});

// Schéma pour le login
const loginSchema = Joi.object({
  password: Joi.string().pattern(/^\d{4,10}$/).required().messages({
    'string.pattern.base': 'Le mot de passe doit contenir entre 4 et 10 chiffres'
  })
});

function validateCreate(obj) {
  return createSchema.validate(obj, { abortEarly: false });
}

function validateUpdate(obj) {
  return updateSchema.validate(obj, { abortEarly: false });
}

function validateLogin(obj) {
  return loginSchema.validate(obj, { abortEarly: false });
}

module.exports = { validateCreate, validateUpdate, validateLogin };
