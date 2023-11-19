const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { HttpError, ctrlWrapper } = require("../utils");

const register = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).exec();

  if (user !== null) throw HttpError(409, "Email in use");

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

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: 60 * 60,
  });
  User.findByIdAndUpdate(user._id, { token }).exec();
  res.status(200).send({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { token: null }).exec();

  res.status(204).end();
};

const current = async (req, res, next) => {
  const currentUser = await User.findById(req.user.id).exec();
  if (!currentUser) throw HttpError(401, "Not authorized");

  res
    .status(200)
    .send({ email: currentUser.email, subscription: currentUser.subscription });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
};
