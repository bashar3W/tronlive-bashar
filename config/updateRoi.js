var cron = require('node-cron');
const Otp = require('../models/otpModel');
const Roi = require('../models/roiModel');
const Wallet = require('../models/walletModel');
const generateString = require('./generateRandomString');
const getIstTime = require('./getTime');

const UpdateRoi = ()=>{
  cron.schedule('00 00 00 * * *', async() => {
    const existingRoi = await Roi.find({activation_status: true});
    if (existingRoi) {
      existingRoi.map(async (exr) => {
        let totalNetReturn = 0;
        let totalAmountReturn = 0;
        const currentUserRoi = await Roi.find({user_id: exr.user_id});
        const returns = currentUserRoi.map(r=> totalNetReturn = totalNetReturn + parseFloat(r.net_return))
        const existingWallet = await Wallet.findOne({ user_id: exr.user_id });
        const new_current_return =
            parseFloat(exr.return_amount) * (parseInt(exr.current_day) + 1);
          if (parseInt(exr.net_return) >= new_current_return && parseFloat(existingWallet.total_income) < totalNetReturn ) {
            console.log(`update roi for ${exr.user_id} package ${exr.packages}`)
            const getDateTime = getIstTime();
            const updatedRoi = await Roi.findOneAndUpdate(
              { _id: exr._id },
              {
                $set: {
                  total_return: parseFloat(new_current_return.toFixed(3)),
                  current_day: parseInt(parseInt(exr.current_day) + 1),
                  activation_status: true,
                },
                $push: {
                  history: {
                    user_id: exr.user_id,
                    day: exr.total_days,
                    packages: exr.packages,
                    roi_per_day: exr.return_per_day,
                    amount: exr.return_amount,
                    total_amount: parseFloat(new_current_return.toFixed(3)),
                    net_return: exr.net_return,
                    current_day: parseInt(parseInt(exr.current_day) + 1),
                    transaction_id: generateString(15),
                    date: getDateTime?.date,
                    time: getDateTime?.time,
                  }
                }
              }
            );

            // update wallet
            const newRoi = await Roi.find({user_id: exr.user_id})
            newRoi.map(r=> totalAmountReturn = totalAmountReturn + parseFloat(r.total_return))
            if (existingWallet) {
              const updateWallet = await Wallet.findOneAndUpdate(
                { user_id: existingWallet.user_id },
                {
                  $set: {
                    roi_bonus: parseFloat(totalAmountReturn.toFixed(3)),
                    total_income: (parseFloat(parseFloat(existingWallet.level_income).toFixed(3)) + parseInt(existingWallet.reward_income) + parseFloat(totalAmountReturn)) - (parseInt(existingWallet.total_withdraw) + parseFloat(parseFloat(existingWallet.deduct_total_income).toFixed(3))),
                  },
                }
                );
            }

          }else{
            const updatedRoi = await Roi.findByIdAndUpdate(
              { _id: exr._id },
              {
                $set: {
                  activation_status: false,
                },
              }
            );
            await updatedRoi.save();
          }
        });
      }

    /// end
  }, {scheduled: true, timezone: "Asia/Kolkata"});
}

module.exports = {UpdateRoi};