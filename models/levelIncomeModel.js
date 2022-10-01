const mongoose = require("mongoose");

const levelIncomeSchema = new mongoose.Schema(
  {
    name: String,
    user_id: String,
    email: String,
    sponsor_id: String,
    // transaction_id: { type: String, unique: true },
    level_income: { type: [Object] },
  },
  { timestamps: true }
);

const LevelIncome = new mongoose.model("LevelIncome", levelIncomeSchema);

module.exports = LevelIncome;
