const express = require("express");
const { getAllUser, getActiveUser, getBlockedUser, changeUserStatus, userAnalytics, activeUserCount, blockedUserCount, pendingWithdrawCount, completeWithdrawCount, allDepositeHistory, successDepositeHistory, rejectDepositeHistory, allWithdrawHistory, successWithdrawHistory, rejectWithdrawHistory, fundTransferReport, levelIncomeData, totalInvest, roiIncomeData, changePassword, updateEmail, changeDepositeStatus, changeWithdrawStatus, makeTopup, deleteUser, editUser, getAllSupportTicket, getAllContactUs, createUpdates, rewardIncomeData, createRoi, changePopUpImg } = require("../../controllers/privateControllers");
const { verifyJWT, verifyAdmin } = require("../../middleware/authMiddleware");
const multer = require("../../middleware/multer");
const { createUpdateValidationHandler, createUpdateValidators, topupAccountValidators, topupAccountValidationHandler, updatePasswordValidators, updateEmailValidators, updateEmailValidationHandler, updatePasswordValidationHandler } = require("../../validation/inputValidation");
const router = express.Router();

const middleware = [verifyJWT, verifyAdmin]

router.use(middleware);

// router.get("/all_user_list", verifyJWT, verifyAdmin, getAllUser);
router.get("/all_user_list", getAllUser);
router.get("/active_user_list", getActiveUser);
router.get("/block_user_list", getBlockedUser);
router.put("/change_user_status", changeUserStatus);
router.delete("/delete_user", deleteUser);
router.put("/edit_user", editUser);
router.get("/user_analytics", userAnalytics);
router.get("/active_users", activeUserCount);
router.get("/block_users", blockedUserCount);

router.get("/pending_withdraw", pendingWithdrawCount);
router.get("/complete_withdraw", completeWithdrawCount);
router.get("/all_deposite_history", allDepositeHistory);
router.get("/success_deposite_history", successDepositeHistory);
router.get("/reject_deposite_history", rejectDepositeHistory);
router.get("/all_withdraw_history", allWithdrawHistory);
router.get("/success_withdraw_history", successWithdrawHistory);
router.get("/reject_withdraw_history", rejectWithdrawHistory);
router.get("/fund_transfer_report", fundTransferReport);
router.get("/level_income_data", levelIncomeData);
router.get("/total_invest", totalInvest);
router.get("/roi_income_data", roiIncomeData);
router.get("/reward_income_data", rewardIncomeData);
router.put("/change_deposite_status", changeDepositeStatus);
router.put("/change_withdraw_status", changeWithdrawStatus);
router.put("/change_password", updatePasswordValidators, updatePasswordValidationHandler, changePassword);
router.put("/update_email", updateEmailValidators, updateEmailValidationHandler, updateEmail);
router.post("/make_topup", topupAccountValidators, topupAccountValidationHandler, makeTopup);
router.post("/create_investment", createRoi);
router.get("/get_all_support", getAllSupportTicket);
router.get("/get_all_contactus", getAllContactUs);
router.post("/new_update",createUpdateValidators, createUpdateValidationHandler, createUpdates);
router.post("/change_popup_img", multer.single("image"), changePopUpImg);


module.exports = router;