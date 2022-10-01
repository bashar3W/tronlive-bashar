const mongoose = require("mongoose");

const depositeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    user_id: { type: String, require: true },
    total_deposite: { type: String },
    last_deposite_amount: Number,
    // status: { type: String, default: "pending" },
    // transaction_id: { type: String, unique: true },
    history: { type: [Object], default: [] },
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const Deposite = new mongoose.model("Deposite", depositeSchema);

module.exports = Deposite;
