const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    user_id: { type: String, require: true },
    sponsor_id: { type: String, require: true },
    level_income: { type: Number, default: 0 },
    reward_income: { type: String },
    current_amount: { type: String },
    roi_bonus: { type: String },
    total_income: { type: String, default: "0" },
    topupable_balance: { type: String, default: "0" },
    withdrawable_balance: { type: String, default: "0" },
    total_deposite: { type: Number, default: 0 },
    total_withdraw: { type: String, default: "0" },
    deduct_total_income: { type: String, default: "0" },
    wallet_address: String,
    deposite_history: {
      type: mongoose.Types.ObjectId,
      ref: "Deposite",
    },
    topup_history: {
      type: mongoose.Types.ObjectId,
      ref: "Topup",
    },
    withdraw_history: {
      type: mongoose.Types.ObjectId,
      ref: "Withdraw",
    },
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const Wallet = new mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
