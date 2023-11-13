const { isValidObjectId } = require("mongoose");

const { HttpError } = require("../utils");

const isValidId = (req, res, next) => {
  const { contactId } = req.params;

  if (!isValidObjectId(contactId)) {
    next(HttpError({ status: 400, message: "Contact not found" }));
  }
  next();
};

module.exports = isValidId;
