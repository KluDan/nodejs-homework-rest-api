const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");

const path = require("node:path");
const fs = require("node:fs/promises");

const User = require("../models/user");
const { HttpError, ctrlWrapper } = require("../utils");
const avatarsDir = path.join(__dirname, "../", "public", "avatars");
const sendEmail = require("../utils/sendEmail");

const register = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).exec();

  if (user !== null) throw HttpError(409, "Email in use");

  const passwordHash = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = crypto.randomUUID();

  await sendEmail({
    to: email,
    subject: "Welcome to PhoneBook",
    html: `To confirm your registration please click on <a href="http://localhost:3000/api/users/verify/${verificationToken}">link</a>`,
    text: `To confirm your registration please open the link http://localhost:3000/api/users/verify/${verificationToken}`,
  });

  await User.create({
    email,
    verificationToken,
    password: passwordHash,
    avatarURL,
  });

  res.status(201).send({ message: "Registration successfully" });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).exec();
  if (user === null) throw HttpError(401, "Email or password is wrong!");

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch === false) throw HttpError(401, "Email or password is wrong!");

  if (user.verify !== true)
    throw HttpError(401, "Your account is not verified");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: 60 * 60,
  });
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { token },
    { new: true }
  ).exec();

  if (!updatedUser) {
    throw new Error("Failed to update user's token.");
  }
  res.status(200).send({
    token: updatedUser.token,
    user: {
      email: updatedUser.email,
      subscription: updatedUser.subscription,
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

  if (!req.file) {
    return res.status(400).send({
      message:
        "No file uploaded. Please attach an image file for avatar update.",
    });
  }

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

const verify = async (req, res, next) => {
  const { token } = req.params;
  const user = await User.findOne({ verificationToken: token }).exec();
  if (user === null) throw HttpError(404, "User not found");
  await User.findByIdAndUpdate(user.id, {
    verify: true,
    verificationToken: null,
  });
  res.status(200).send({ message: "Verification successful" });
};

const verifyRepeat = async (req, res, next) => {
  const { email } = req.body;
  if (!email) throw HttpError(400, "Missing required field: email");

  const user = await User.findOne({ email }).exec();

  if (!user) throw HttpError(404, "User not found");

  if (user.verify === true)
    throw HttpError(400, "Verification has already been passed");

  await sendEmail({
    to: email,
    subject: "Welcome to PhoneBook - Verification Email (Resend)",
    html: `To confirm your registration please click on <a href="http://localhost:3000/api/users/verify/${user.verificationToken}">link</a>`,
    text: `To confirm your registration please open the link http://localhost:3000/api/users/verify/${user.verificationToken}`,
  });

  res.status(200).send({ message: "Verification email sent" });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
  verify: ctrlWrapper(verify),
  verifyRepeat: ctrlWrapper(verifyRepeat),
};
