const PopupImage = require("../../models/popupImageModel");
const User = require("../../models/userModel");

// Get user Information
const getUserInfo = async (req, res) => {
    try {
      // const userId = req.params.user_id;
      let userId = req.auth.id;
  
    const user = await User.findOne({ user_id: userId }).select(["-trx_password", "-password"])
    // const {password, ...userInfo} = user._doc;
  
    if (user) {
      res.status(200).json({
        data: user,
      });
    } else {
      res.status(404).json({
        message: "Invalid user ID",
      });
    }
    } catch (error) {
      res.status(400).json({
        message: error.toString()
      })
    }
  };

  // get popup image
  const getPopUpImg = async (req, res) =>{
  try {
    const findImage = await PopupImage.findOne({image_id: "TLCPOPUPIMAGE"});
    if(findImage){
      return res.status(200).json({
        avatar: findImage.avatar,
        avatar_public_url: findImage.avatar_public_url,
      });
      
    }else{
      return res.status(400).json({ message: "Cannot find Image" });
    }
    // await upImage.save();
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message.toString() });
  }
}

  module.exports = {
    getUserInfo,
    getPopUpImg
  };