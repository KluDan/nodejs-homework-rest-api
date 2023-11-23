const Contact = require("../models/contact");

const { HttpError, ctrlWrapper } = require("../utils");

const getAll = async (req, res, next) => {
  console.log({ user: req.user });

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const favoriteFilter =
    req.query.favorite === "false"
      ? false
      : req.query.favorite === "true"
      ? true
      : undefined;

  const query = { owner: req.user.id };

  if (typeof favoriteFilter !== "undefined") {
    query.favorite = favoriteFilter;
  }

  const totalContacts = await Contact.countDocuments({ owner: req.user.id });

  if (skip >= totalContacts)
    throw HttpError(404, "Requested page is beyond the available range");

  const contacts = await Contact.find(query).limit(limit).skip(skip).exec();

  if (contacts.length === 0 && page === 1)
    throw HttpError(404, "No contacts found with the specified criteria");

  res.send(contacts);
};

const getById = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId).exec();

  if (!contact) throw HttpError(404, "Contact not found");

  if (!contact.owner.equals(req.user.id))
    throw HttpError(404, "Contact not found");

  res.send(contact);
};

const add = async (req, res, next) => {
  const contact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    favorite: req.body.favorite,
    owner: req.user.id,
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

  if (!contact.owner.equals(req.user.id))
    throw HttpError(404, "Contact not found");

  res.send(updatedContact);
};

const deleteById = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await Contact.findByIdAndDelete(contactId);

  if (!contact) throw HttpError(404, "Contact not found");

  if (!contact.owner.equals(req.user.id))
    throw HttpError(404, "Contact not found");

  res.send({
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

  const contact = await Contact.findById(contactId).exec();

  if (!contact) {
    throw HttpError(404, "Contact not found");
  }

  if (!contact.owner.equals(req.user.id)) {
    throw HttpError(404, "Contact not found");
  }

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
