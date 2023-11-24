const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");

const path = require("node:path");
const fs = require("node:fs/promises");

const User = require("../models/user");
const { HttpError, ctrlWrapper } = require("../utils");
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).exec();

  if (user !== null) throw HttpError(409, "Email in use");

  const passwordHash = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  await User.create({ email, password: passwordHash, avatarURL });

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

const updateSubscription = async (req, res, next) => {
  const allowedSubscriptions = ["starter", "pro", "business"];
  const { subscription } = req.body;

  if (!subscription || !allowedSubscriptions.includes(subscription))
    throw HttpError(400, "Invalid subscription value");

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { subscription },
    { new: true }
  );

  if (!updatedUser) throw HttpError(404, "User not found");

  res.send({ subscription: updatedUser.subscription });
};

const updateAvatar = async (req, res, next) => {
  const { id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  const avatar = await Jimp.read(tempUpload);
  await avatar.resize(250, 250);
  await avatar.writeAsync(tempUpload);

  const filename = `${id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tempUpload, resultUpload);

  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(id, { avatarURL });

  res.send({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
