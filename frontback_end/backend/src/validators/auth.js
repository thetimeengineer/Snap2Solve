const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin'),
  phone: Joi.string().allow('', null),
  department: Joi.string().allow('', null),
  employeeId: Joi.string().allow('', null)
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().required(),
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema
};





