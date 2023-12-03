const express = require("express");

const AuthController = require("../../controllers/auth");

const { validateBody, auth, upload } = require("../../middlewares");

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
router.patch("", auth, AuthController.updateSubscription);
router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  AuthController.updateAvatar
);
router.get("/verify/:token", AuthController.verify);
router.post(
  "/verify",
  validateBody(schemas.validateEmail),
  AuthController.verifyRepeat
);

module.exports = router;
