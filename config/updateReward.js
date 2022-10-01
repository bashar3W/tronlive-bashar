const Reward = require("../models/rewardModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const generateString = require("./generateRandomString");
const getIstTime = require("./getTime");

const updateReward = async (userId, package) => {
  const getDateTime = getIstTime();
  const user = await User.findOne({ user_id: userId });
  // update reward
  const existingReward = await Reward.findOne({ user_id: user.sponsor_id });
  var dayPassed;
  var getReward = 0;
  var currentDate = new Date().getMilliseconds();
  var activationDate = user.activation_date;
  var delta = Math.abs(currentDate - activationDate) / 1000;
  dayPassed = Math.floor(delta / 86400);
  delta -= dayPassed * 86400;

  // reward logic
  if (
    parseInt(dayPassed) <= 30 &&
    parseInt(existingReward?.current_activation) + package >= 50000
  ) {
    getReward = 500;
  }
  if (
    parseInt(dayPassed) <= 75 &&
    parseInt(existingReward?.current_activation) + package >= 100000
  ) {
    getReward = 1000;
  }
  if (
    parseInt(dayPassed) <= 135 &&
    parseInt(existingReward?.current_activation) + package >= 200000
  ) {
    getReward = 2000;
  }
  if (
    parseInt(dayPassed) <= 210 &&
    parseInt(existingReward?.current_activation) + package >= 500000
  ) {
    getReward = 5000;
  }
  if (
    parseInt(dayPassed) <= 300 &&
    parseInt(existingReward?.current_activation) + package >= 1000000
  ) {
    getReward = 10000;
  }
  if (existingReward) {
    const updateExistingReward = await Reward.findOneAndUpdate(
      { user_id: user.sponsor_id },
      {
        $set: {
          current_activation:
            parseInt(existingReward?.current_activation) + package,
        },
        $push: {
          reward_income: {
            user_id: user.user_id,
            date: getDateTime?.date,
            direct_activation: package,
            total_activation:
              parseInt(existingReward?.current_activation) + package,
            reward: parseInt(getReward),
            transaction_id: generateString(),
            time: getDateTime?.time,
          },
        },
      }
    );
    // await updateExistingReward.save();

    // update wallet
    const wallet = await Wallet.findOne({ user_id: user.sponsor_id });
    const updateWallet = await Wallet.findOneAndUpdate(
      { user_id: user.sponsor_id },
      {
        $set: {
          reward_income: parseInt(wallet?.reward_income) + parseInt(getReward),
          total_income: parseFloat(wallet?.total_income) + parseInt(getReward),
        },
      }
      );
      // topupable_balance: parseFloat(wallet?.topupable_balance) + parseInt(getReward),
      // withdrawable_balance: parseFloat(wallet?.withdrawable_balance) + parseInt(getReward),
    // await wallet.save();
  } else {
    const createReward = await Reward.create({
      user_id: user.sponsor_id,
      current_activation: package,
      transaction_id: generateString(15),
      reward_income: [
        {
          user_id: user.user_id,
          date: new Date(),
          direct_activation: package,
          total_activation: package,
          reward: 0,
          transaction_id: generateString(),
          time: getDateTime?.time,
        },
      ],
    });

    // update wallet
    const wallet = await Wallet.findOne({ user_id: user.sponsor_id });
    const updatedWallet = await Wallet.findOneAndUpdate(
      { user_id: user.sponsor_id },
      {
        $set: {
          reward_income: parseInt(getReward),
          total_income: parseFloat(wallet?.total_income) + parseInt(getReward),
        },
      }
    );
    // await wallet.save();
  }
};

module.exports = updateReward;
