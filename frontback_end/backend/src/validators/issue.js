const Joi = require('joi');

  const createIssueSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().allow('', null),
  category: Joi.string().allow('', null),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2)
  }).optional(),
  labels: Joi.array().items(Joi.string()).optional()
});

const updateIssueSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().allow('', null).optional(),
  category: Joi.string().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent', 'Low', 'Medium', 'High', 'Urgent').optional(),
  status: Joi.string().valid(
    'reported', 
    'acknowledged', 
    'in-progress', 
    'resolved', 
    'escalated', 
    'closed',
    'open'
  ).optional(),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2)
  }).optional()
});

module.exports = { createIssueSchema, updateIssueSchema };





