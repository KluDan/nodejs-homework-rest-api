require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const DB_URI =
  "mongodb+srv://kludan:mongo1995@cluster0.dhazxci.mongodb.net/db-contacts?retryWrites=true&w=majority";
mongoose.set("strictQuery", true);
mongoose
  .connect(DB_URI)
  .then(() => {
    app.listen(3000);

    console.info("Database connection successful");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
