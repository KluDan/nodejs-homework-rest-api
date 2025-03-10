const path = require("node:path");
const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const contactRoutes = require("./routes/api/contacts");

const authRoutes = require("./routes/api/auth");

const { auth } = require("./middlewares");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/avatars", express.static(path.join(__dirname, "public", "avatars")));

app.use("/api/users", authRoutes);
app.use("/api/contacts", auth, contactRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(({ status = 500, message }, req, res, next) => {
  res.status(status).json({ message: message });
});

module.exports = app;
