const mongoose = require("mongoose");

const roiSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    user_id: { type: String, required: true },
    total_days: { type: Number, required: true, default: 600 },
    packages: { type: Number, required: true, default: 25 },
    return_per_day: { type: Number, required: true, default: 0.5 },
    current_day: String,
    return_amount: String,
    net_return: String,
    total_return: String,
    activation_status: {type: Boolean, default: false},
    // transaction_id: { type: String },
    history: {type: [Object]},
    join_date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const Roi = new mongoose.model("Roi", roiSchema);

module.exports = Roi;
