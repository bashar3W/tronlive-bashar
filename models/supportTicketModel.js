const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    user_id: { type: String, require: true },
    user_name: { type: String },
    history: { type: [Object], default: [] },
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const SupportTicket = new mongoose.model("SupportTicket", supportTicketSchema);

module.exports = SupportTicket;
