const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    user_id: String,
    current_activation: { type: String },
    reward_income: { type: [Object] },
  },
  { timestamps: true }
);

const Reward = new mongoose.model("Reward", rewardSchema);

module.exports = Reward;
