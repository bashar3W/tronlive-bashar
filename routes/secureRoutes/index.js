const express = require("express");
const { changePassword, getUserInfo, updateUserInfo, getRefferalInfo, updateEmail, changeTrxPassword, getLevelTeam, depositeAmount, depositeHistory, makeTopup, topupHistory, fundTransfer, transferFundHistory, withdrawAmount, withdrawHistory, getLevelIncome, getRewardIncome, createRoi, getRoiData, getWallet, upLoadProofPic, updateProfilePic, updateTrxAddress, createSupportTicket, getSupportHistory, createContactUs, getContactUsHistory, getUpdates, levelIncomeChart, roiIncomeChart, rewardIncomeChart } = require("../../controllers/secureControllers");
const { verifyJWT, verifyUser } = require("../../middleware/authMiddleware");
const multer = require("../../middleware/multer");
const { updatePasswordValidationHandler, updatePasswordValidators, updateTrxPasswordValidators, updateTrxPasswordValidationHandler, updateEmailValidators, updateEmailValidationHandler, topupValidators, topupValidationHandler, fundTransferValidationHandler, fundTransferValidators, depositAmountValidators, depositAmountValidationHandler, withdrawAmountValidationHandler, withdrawAmountValidators, updateTxrAddressValidators, updateTxrAddressValidationHandler, supportTicketValidationHandler, supportTicketValidators, contactusValidationHandler, contactusValidators } = require("../../validation/inputValidation");

const router = express.Router();
const middleware = [verifyJWT, verifyUser]

router.use(middleware);

router.put("/change_password",updatePasswordValidators, updatePasswordValidationHandler, changePassword);
router.get("/get_user", getUserInfo);
router.put("/update_user_info", updateUserInfo);
router.get("/register/refferal", getRefferalInfo);
router.put("/update_email",updateEmailValidators, updateEmailValidationHandler, updateEmail);
router.post("/change_trx_password",updateTrxPasswordValidators, updateTrxPasswordValidationHandler, changeTrxPassword);
router.get("/level_team", getLevelTeam);

router.post("/deposite", multer.single("image"), depositeAmount);
router.get("/deposite_history", depositeHistory);
router.post("/make_topup",topupValidators,topupValidationHandler, makeTopup);
router.get("/topup_history", topupHistory);
router.post("/transfer_fund",fundTransferValidators, fundTransferValidationHandler, fundTransfer);
router.get("/transfer_fund_history", transferFundHistory);
router.get("/get_wallet/", getWallet);
router.post("/withdraw",withdrawAmountValidators, withdrawAmountValidationHandler, withdrawAmount);
router.get("/withdraw_history", withdrawHistory);
router.get("/level_income", getLevelIncome);
router.get("/reward_income", getRewardIncome);

router.post("/create_investment", createRoi);
router.get("/get_investment", getRoiData);
router.post("/upload_proof_pic", multer.single("image"), upLoadProofPic);
router.put("/update_profile_pic", multer.single("image"), updateProfilePic);
router.put("/update_trx_address",updateTxrAddressValidators, updateTxrAddressValidationHandler, updateTrxAddress);

router.post("/create_support", multer.single("image"), createSupportTicket);
router.get("/get_support_history", getSupportHistory);
router.post("/contactus_message",contactusValidators, contactusValidationHandler, createContactUs);
router.get("/get_contactus_history", getContactUsHistory);
router.get("/get_updates", getUpdates);
router.get("/level_income_chart", levelIncomeChart);
router.get("/roi_income_chart", roiIncomeChart);
router.get("/reward_income_chart", rewardIncomeChart);

module.exports = router;