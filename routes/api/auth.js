const express = require("express");

const AuthController = require("../../controllers/auth");

const { validateBody } = require("../../middlewares");

const schemas = require("../../schemas/users");

const router = express.Router();
const jsonParser = express.json();
router.post(
  "/register",
  jsonParser,
  validateBody(schemas.addUsersSchema),
  AuthController.register
);
router.post(
  "/login",
  jsonParser,
  validateBody(schemas.addUsersSchema),
  AuthController.login
);

module.exports = router;
