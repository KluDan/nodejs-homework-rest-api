const Joi = require("joi");

const validateEmail = Joi.object({
  email: Joi.string().email().required(),
});

const addUsersSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  addUsersSchema,
  validateEmail,
};
