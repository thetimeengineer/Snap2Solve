const Joi = require('joi');

const createCommentSchema = Joi.object({
  body: Joi.string().min(1).max(2000).required()
});

module.exports = { createCommentSchema };





