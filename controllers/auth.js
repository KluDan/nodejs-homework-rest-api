const bcrypt = require("bcrypt");

const User = require("../models/user");

const { HttpError, ctrlWrapper } = require("../utils");

const register = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).exec();

  if (user !== null) throw HttpError(409, "User already registered!");

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({ email, password: passwordHash });

  res.status(201).send({ message: "Registration successfully" });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).exec();
  if (user === null) throw HttpError(401, "Email or password is wrong!");

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch === false) throw HttpError(401, "Email or password is wrong!");

  res.send({ token: "Token" });
};
module.exports = { register: ctrlWrapper(register), login: ctrlWrapper(login) };
