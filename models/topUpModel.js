const mongoose = require("mongoose");

const topupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    user_id: { type: String, require: true },
    package: Number,
    // status: { type: String, default: "pending" },
    // transaction_id: { type: String, unique: true },
    history: { type: [Object], default: [] },
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const Topup = new mongoose.model("Topup", topupSchema);

module.exports = Topup;
