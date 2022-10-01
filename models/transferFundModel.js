const mongoose = require("mongoose");

const transferFundSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    user_id: String,
    receiver_id: String,
    amount: { type: Number, default: 0 },
    // status: { type: String, default: "pending" },
    // transaction_id: { type: String, unique: true },
    history: { type: [Object], default: [] },
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const TransferFund = new mongoose.model("TransferFund", transferFundSchema);

module.exports = TransferFund;
