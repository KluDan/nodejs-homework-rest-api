const Contact = require("../models/contact");

const { HttpError, ctrlWrapper } = require("../utils");

const getAll = async (req, res, next) => {
  const contacts = await Contact.find().exec();
  res.send(contacts);
};

const getById = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId).exec();
  if (!contact) throw HttpError(404, "Contact not found");
  res.send(contact);
};

const add = async (req, res, next) => {
  const contact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    favorite: req.body.favorite,
  };

  const result = await Contact.create(contact);
  res.status(201).send(result);
};

const updateById = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    favorite: req.body.favorite,
  };

  const updatedContact = await Contact.findByIdAndUpdate(contactId, contact, {
    new: true,
  });
  if (!updatedContact) throw HttpError(404, "Contact not found");

  res.send(updatedContact);
};

const deleteById = async (req, res, next) => {
  const { contactId } = req.params;

  const contact = await Contact.findByIdAndDelete(contactId);
  if (!contact) throw HttpError(404, "Contact not found");
  res.json({
    message: "Delete success",
  });
};

const updateStatusContact = async (contactId, body) => {
  if (body.favorite === undefined) {
    throw HttpError(400, "Missing field favorite");
  }
  const updatedContact = await Contact.findByIdAndUpdate(
    contactId,
    { favorite: body.favorite },
    { new: true }
  );
  if (!updatedContact) throw HttpError(404, "Contact not found");
  return updatedContact;
};

const updateFavoriteStatus = async (req, res, next) => {
  const { contactId } = req.params;

  const updatedContact = await updateStatusContact(contactId, req.body);

  res.status(200).json(updatedContact);
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  updateById: ctrlWrapper(updateById),
  deleteById: ctrlWrapper(deleteById),
  updateFavoriteStatus: ctrlWrapper(updateFavoriteStatus),
};
