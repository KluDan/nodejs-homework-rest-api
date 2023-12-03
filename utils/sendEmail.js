require("dotenv").config();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = (message) => {
  message.from = "danylktv2@gmail.com";
  return sgMail.send(message);
};

module.exports = sendEmail;
