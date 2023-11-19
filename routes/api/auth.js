const express = require("express");

const AuthController = require("../../controllers/auth");

const { validateBody, auth } = require("../../middlewares");

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
router.get("/logout", auth, AuthController.logout);
router.get("/current", auth, AuthController.current);

module.exports = router;
