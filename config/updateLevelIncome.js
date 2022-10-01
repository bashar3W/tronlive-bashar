const LevelIncome = require("../models/levelIncomeModel");
const Roi = require("../models/roiModel");
const Wallet = require("../models/walletModel");
const generateString = require("./generateRandomString");
const getIstTime = require("./getTime");

const updateLevelIncome = async (
  sponsorWallet,
  sponsorLevelIncome,
  userId,
  package,
  levelnumber
) => {
  let bonus;
  const getDateTime = getIstTime();
  if (parseInt(levelnumber) === 1) {
    bonus = (parseInt(package) * 20) / 100;
  }
  if (parseInt(levelnumber) >= 2 && parseInt(levelnumber) <= 10) {
    bonus = (parseInt(package) * 2) / 100;
  }
  if (parseInt(levelnumber) >= 11 && parseInt(levelnumber) <= 20) {
    bonus = (parseInt(package) * 1) / 100;
  }

  // ROI
  let totalNetReturn = 0;
  let currentBonus = 0;
  const roi = await Roi.find({ user_id: sponsorLevelIncome?.user_id });
  const roiIncomeHistory = roi.find( w=> w.activation_status === true);
  const roiActive = roi.filter(r=> r.activation_status === true)
  roiActive.map(r=> totalNetReturn = totalNetReturn + parseFloat(r.net_return))
  if(roiIncomeHistory){
    if (sponsorLevelIncome) {
      if(parseInt(sponsorWallet.level_income) + parseInt(bonus) < totalNetReturn){
        currentBonus = bonus;
      }else{
        currentBonus = (parseFloat(totalNetReturn) - parseInt(sponsorWallet.level_income));
      }
      const updateSponsorIncome = await LevelIncome.findOneAndUpdate(
        { user_id: sponsorLevelIncome.user_id },
        {
          $push: {
            level_income: {
              user_id: userId,
              sponsor_id: sponsorLevelIncome.user_id,
              date: new Date().toDateString(),
              amount: currentBonus,
              level: levelnumber,
              transaction_id: generateString(15),
              time: getDateTime.time,
            },
          },
        }
      );
      // await updateSponsorIncome.save();
    }
    if (sponsorWallet) {
      const updateSponsorWallet = await Wallet.findOneAndUpdate(
        { user_id: sponsorWallet.user_id },
        {
          $set: {
            level_income: parseInt(sponsorWallet.level_income) + currentBonus,
            total_income: parseFloat(sponsorWallet.total_income) + currentBonus,
          },
        }
        );
        // current_amount: parseFloat(sponsorWallet.current_amount) + bonus,
        // topupable_balance: parseFloat(sponsorWallet.topupable_balance) + bonus,
        // withdrawable_balance: parseFloat(sponsorWallet.withdrawable_balance) + bonus,
      // await updateSponsorWallet.save();
    }
  }
};

module.exports = updateLevelIncome;
