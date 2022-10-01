const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    user_id: String,
    amount: { type: Number, default: 0 },
    // status: { type: String, enum: ["pending", "complete", "cancel"], default: "pending" },
    // transaction_id: { type: String, unique: true },
    history: { type: [Object], default: [] },
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const Withdraw = new mongoose.model("Withdraw", withdrawSchema);

module.exports = Withdraw;
