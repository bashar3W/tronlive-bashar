const express = require("express");
const { getUserInfo, getPopUpImg } = require("../../controllers/commonControllers");
const { sendMessage } = require("../../controllers/publicControllers");
const { verifyJWT } = require("../../middleware/authMiddleware");
const router = express.Router();


router.use(verifyJWT);

router.get("/get_user", getUserInfo);
router.get("/get_popup_img", getPopUpImg);

module.exports = router;