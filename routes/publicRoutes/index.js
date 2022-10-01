const express = require("express");
const { registerUser, getSponsorName, authUser, ForgotPassword, resetPassord, sendOtp, checkMobileNumber, checkEmail, checkSponsorId, sendMessage } = require("../../controllers/publicControllers/index");
const { registerValidators, registerValidationHandler, loginValidators, loginValidationHandler, forgotPasswordValidators, forgotPasswordValidationHandler, resetPasswordValidationHandler, resetPasswordValidators, ContactValidationHandler, ContactValidators } = require("../../validation/inputValidation");
const router = express.Router();

router.post("/register", registerValidators, registerValidationHandler, registerUser);
router.get("/get_sponsor/:user_id", getSponsorName);
router.post("/login",loginValidators, loginValidationHandler, authUser);
router.post("/forgot_password",forgotPasswordValidators, forgotPasswordValidationHandler, ForgotPassword);
router.post("/reset_password/:token",resetPasswordValidators, resetPasswordValidationHandler, resetPassord);
router.post("/send_otp", sendOtp);
router.get("/check_mobile/:mobile", checkMobileNumber);
router.get("/check_email/:email", checkEmail);
router.get("/check_sponsor_id/:sponsor_id", checkSponsorId);
router.post("/send_message",ContactValidators, ContactValidationHandler, sendMessage);

module.exports = router;