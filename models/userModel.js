const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_id: { type: String, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  sponsor_id: { type: String, required: true },
  sponsor_name: { type: String, required: true },
  token: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  verified: { type: Boolean, default: false },
  topup_status: { type: Boolean, default: false },
  user_status: { type: Boolean, default: true },
  topup_activation_date: {type: String},
  activation_date: String,
  trx_password: String,
  country: String,
  gender: String,
  avatar_public_url: String,
  avatar: String,
  wallet_address: String,
  active_package: String,
  team: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Level",
    },
  ],
  join_date: { type: String, default: new Date().toDateString() },
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// will encrypt password everytime its saved
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
