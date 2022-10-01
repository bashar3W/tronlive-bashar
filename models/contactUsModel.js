const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    user_id: { type: String, require: true },
    user_name: { type: String },
    history: { type: [Object], default: [] },
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const Contact = new mongoose.model("Contact", contactUsSchema);

module.exports = Contact;