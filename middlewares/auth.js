const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { HttpError } = require("../utils");

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (typeof authHeader === "undefined") {
    return next(HttpError(401, "Not authorized"));
  }

  const [bearer, token] = authHeader.split(" ", 2);

  if (bearer !== "Bearer") {
    return next(HttpError(401, "Not authorized"));
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
    if (err) {
      return next(HttpError(401, "Not authorized"));
    }

    try {
      req.user = decode;
      const user = await User.findById(decode.id).exec();
      if (user === null) {
        return next(HttpError(401, "Not authorized"));
      }

      if (user.token !== token) {
        return next(HttpError(401, "Not authorized"));
      }

      req.user = { id: user._id };
      next();
    } catch (error) {
      next(error);
    }
  });
};

module.exports = auth;
