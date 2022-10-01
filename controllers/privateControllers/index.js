const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");
const Withdraw = require("../../models/withdrawModel");
const Topup = require("../../models/topUpModel");
const Deposite = require("../../models/depositeModel");
const LevelIncome = require("../../models/levelIncomeModel");
const TransferFund = require("../../models/transferFundModel");
const Roi = require("../../models/roiModel");
const Otp = require("../../models/otpModel");
const updateReward = require("../../config/updateReward");
const updateLevelIncome = require("../../config/updateLevelIncome");
const SupportTicket = require("../../models/supportTicketModel");
const Contact = require("../../models/contactUsModel");
const Update = require("../../models/updateModel");
const Reward = require("../../models/rewardModel");
const Wallet = require("../../models/walletModel");
const generateString = require("../../config/generateRandomString");
const PopupImage = require("../../models/popupImageModel");
const Cloudinary = require("../../config/cloudinary.js");

// Get all users
const getAllUser = async (req, res) => {
  try {
    const users = await User.find({}).sort({join_date: -1}).select("-password");
  if (users) {
    res.status(200).json(users);
  } else {
    res.send({
      status: 400,
      message: "Cannot access",
      error: 400,
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

// change user Status
const changeUserStatus = async (req, res) => {
  try {
    const {user_id} = req.body;
    const user = await User.findOne({user_id: user_id});
    const updateUserStatus = await User.findOneAndUpdate({user_id: user_id},{
    $set: {
      user_status: !user.user_status
    }
  });
  if(updateUserStatus){
    res.status(200).json({
      message: "Successfully changed user Status"
    })
  }else{
    res.status(400).json({
      message: "Cannot change user status"
    })
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

// Get active user
const getActiveUser = async (req, res) => {
  try {
    const user = await User.find({ topup_status: true }).sort({join_date: -1}).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

// Get active user
const getBlockedUser = async (req, res) => {
  try {
    const user = await User.find({ user_status: false }).sort({join_date: -1}).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

// All user list
const userAnalytics = async (req, res) =>{
  try {
    // user
    const user = await User.find({}).sort({join_date: -1}).select("-password");
    const activeUser = user.filter(a=> a.topup_status === true);
    const blockUser = user.filter(b=> b.user_status === false);
    // pending withdraw
    const withdraw = await Withdraw.find({});
    let allWithdraw = [];
    let totalPendingWithdraw = 0;
    const pendingWithdrawHistory = withdraw.map( w=> w.history.map(h=> allWithdraw = [...allWithdraw, h]));
    const pendingWithdraws = allWithdraw.filter(p=> p.status === "pending");
    pendingWithdraws.map(t=> totalPendingWithdraw = parseInt(totalPendingWithdraw) + parseInt(t.amount));
    // complete withdraw
    let totalWithdraw = 0;
    // const withdrawHistory = withdraw.map( w=> w.history.map(h=> allWithdraw = [...allWithdraw, h]));
    const completeWithdraws = allWithdraw.filter(p=> p.status === "success");
    completeWithdraws.map(t=> totalWithdraw = parseInt(totalWithdraw) + parseInt(t.amount));
    // all deposite
    const deposite = await Deposite.find({});
    let allDeposite = [];
    let totalDeposite = 0;
    const depositeHistory = deposite.map( w=> w.history.map(h=> allDeposite = [...allDeposite, h]));
    allDeposite.map(t=> totalDeposite = parseInt(totalDeposite) + parseInt(t.amount));
    // Invest
    const topup = await Topup.find({});
    let allTopup = [];
    let totalInvest = 0;
    const topupHistory = topup.map( w=> w.history.map(h=> allTopup = [...allTopup, h]));
    allTopup.map(t=> totalInvest = parseInt(totalInvest) + parseInt(t.packages));
  if(user){
    res.status(200).json({
      allUser: user.length,
      activeUser: activeUser.length,
      blockUser: blockUser.length,
      allWithdraw: totalWithdraw,
      pendingWithdraws: totalPendingWithdraw,
      totalInvest,
      totalDeposite, 
    })
  }
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: error
    })
  }
}

// active user list
const activeUserCount = async (req, res) =>{
  try {
    const user = await Withdraw.update({"history": {
      $elemMatch: {
        transaction_id: "c7507201-0b38-418d-987e-6570055985a2"
      }
    }},{
      $pull: {
        "history": {transaction_id: "c7507201-0b38-418d-987e-6570055985a2"}
      }
    });
  if(user){
    res.status(200).json({
      active_user: user
    })
  }
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: error
    })
  }
}

// active user list
const blockedUserCount = async (req, res) =>{
  try {
    const user = await User.find({user_status: false});
  if(user){
    res.status(200).json({
      blocked_user: user.length
    })
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// get pending whithdraw Count
const pendingWithdrawCount = async (req, res) =>{
  try {
    const withdraw = await Withdraw.find({});
    let allWithdraw = [];
    let totalWithdraw = 0;
    const withdrawHistory = withdraw.map( w=> w.history.map(h=> allWithdraw = [...allWithdraw, h]));
    const pendingWithdraws = allWithdraw.filter(p=> p.status === "pending");
    pendingWithdraws.map(t=> totalWithdraw = parseInt(totalWithdraw) + parseInt(t.amount));
    res.send({
      pending_withdraw: totalWithdraw
    })
  } catch (error) {
    res.send(error)
  }
}

// get complete whithdraw Count
const completeWithdrawCount = async (req, res) =>{
  try {
    const withdraw = await Withdraw.find({});
    let allWithdraw = [];
    let totalWithdraw = 0;
    const withdrawHistory = withdraw.map( w=> w.history.map(h=> allWithdraw = [...allWithdraw, h]));
    const completeWithdraws = allWithdraw.filter(p=> p.status === "success");
    completeWithdraws.map(t=> totalWithdraw = parseInt(totalWithdraw) + parseInt(t.amount));
    res.send({
      complete_withdraw: totalWithdraw
    })
  } catch (error) {
    res.send(error)
  }
}

// get All deposite history
const allDepositeHistory = async (req, res) =>{
  try {
    const deposite = await Deposite.find({}).sort({ updatedAt: -1,"history.date": 1});
    let allDeposite = [];
    const depositeHistory = deposite.map( w=> w.history.map(h=> allDeposite = [...allDeposite, h]));
    res.send(allDeposite)
  } catch (error) {
    res.send(error)
  }
}

// get success deposite history
const successDepositeHistory = async (req, res) =>{
  try {
    const deposite = await Deposite.find({});
    let allDeposite = [];
    const depositeHistory = deposite.map( w=> w.history.map(h=> allDeposite = [...allDeposite, h]));
    const successDeposite = allDeposite.filter(p=> p.status === "success");
    res.send(successDeposite.reverse())
  } catch (error) {
    res.send(error)
  }
}

// get reject deposite history
const rejectDepositeHistory = async (req, res) =>{
  try {
    const deposite = await Deposite.find({});
    let allDeposite = [];
    const depositeHistory = deposite.map( w=> w.history.map(h=> allDeposite = [...allDeposite, h]));
    const rejectDeposite = allDeposite.filter(p=> p.status === "reject");
  res.send(rejectDeposite.reverse())
  } catch (error) {
    res.send(error)
  }
}

// get All withdraw history
const allWithdrawHistory = async (req, res) =>{
  try {
    const withdraw = await Withdraw.find({});
    let allWithdraw = [];
    const withdrawHistory = withdraw.map( w=> w.history.map(h=> allWithdraw = [...allWithdraw, h]));
    res.send(allWithdraw.reverse())
  } catch (error) {
    res.send(error)
  }
}

// get success Withdraw history
const successWithdrawHistory = async (req, res) =>{
  try {
    const withdraw = await Withdraw.find({});
    let allWithdraw = [];
    const withdrawHistory = withdraw.map( w=> w.history.map(h=> allWithdraw = [...allWithdraw, h]));
    const successWithdraw = allWithdraw.filter(p=> p.status === "success");
    res.send(successWithdraw.reverse())
  } catch (error) {
    res.send(error)
  }
}

// get reject withdraw history
const rejectWithdrawHistory = async (req, res) =>{
  try {
    const withdraw = await Withdraw.find({});
    let allWithdraw = [];
    const withdrawHistory = withdraw.map( w=> w.history.map(h=> allWithdraw = [...allWithdraw, h]));
    const rejectWithdraw = allWithdraw.filter(p=> p.status === "reject");
    res.send(rejectWithdraw.reverse())
  } catch (error) {
    res.send(error)
  }
}

// get fund transfer report
const fundTransferReport = async (req, res) =>{
  try {
    const fundTransfer = await TransferFund.find({});
    let allFundTransfer = [];
    const fundTransferHistory = fundTransfer.map( w=> w.history.map(h=> allFundTransfer = [...allFundTransfer, h]));
    res.send(allFundTransfer.reverse())
  } catch (error) {
    res.send(error)
  }
}

// get Level income report
const levelIncomeData = async (req, res) =>{
  try {
    const levelIncome = await LevelIncome.find({});
    let allLevelIncome = [];
    const levelIncomeHistory = levelIncome.map( w=> w.level_income.map(h=> allLevelIncome = [...allLevelIncome, h]));
    res.send(allLevelIncome.reverse())
  } catch (error) {
    res.send(error)
  }
}

// Total invest
const totalInvest = async (req, res) =>{
  try {
    const topup = await Topup.find({});
    let allTopup = [];
    let totalInvest = 0;
    const topupHistory = topup.map( w=> w.history.map(h=> allTopup = [...allTopup, h]));
    allTopup.map(t=> totalInvest = parseInt(totalInvest) + parseInt(t.packages));
    res.send({
      total_invest: totalInvest
    })
  } catch (error) {
    res.send(error)
  }
}

// get Roi income data report
const roiIncomeData = async (req, res) =>{
 try {
  const roiIncome = await Roi.find({});
  let allRoiIncome = [];
  const roiIncomeHistory = roiIncome.map( w=> w.history.map(h=> allRoiIncome = [...allRoiIncome, h]));
  res.status(200).json(allRoiIncome.reverse())
 } catch (error) {
  console.log(error)
  res.status(400).json({
    message: error.toString()
  })
 }
}

// get reward income
const rewardIncomeData = async (req, res)=>{
  try {
    const reardIncome = await Reward.find({});
    let allRewardIncome = [];
    const roiIncomeHistory = reardIncome?.map( w=> w.reward_income?.map(h=> allRewardIncome = [...allRewardIncome, h]));
    const rewarded = allRewardIncome.filter(r=> r.reward > 0);
    res.status(200).json(rewarded.reverse())
   } catch (error) {
    console.log(error)
    res.status(400).json({
      message: error.toString()
    })
   }
}

// Member delete
const deleteUser = async(req, res) =>{
  try {
    const {user_id} = req.body;
    const user = await User.findOneAndDelete({user_id: user_id});
    if(user){
      res.status(200).json({
        message: "Deleted successfully"
      })
    }else{
      res.status(400).json({
        message: "Cannot delete user"
      })
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// edit member
const editUser = async (req, res) =>{
  try {
    const {data} = req.body;
    const user = await User.findOneAndUpdate({user_id: data.user_id}, data);
    if(user){
      res.status(200).json({
        message: "Update user info successfully"
      })
    }else{
      res.status(400).json({
        message: "Cannot update user info"
      })
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// change deposite status
const changeDepositeStatus = async (req, res) =>{
  try {
    const {transaction_id, status} = req.body;
    const existingDeposite = await Deposite.findOneAndUpdate({'history':{$elemMatch: {transaction_id: transaction_id}}}                                                       
    ,{$set: {                                                                             
        'history.$[t].status':status,                             
    }},
    {
      "arrayFilters": [{ "t.transaction_id": transaction_id }] 
    }
  );
  if(existingDeposite){
    // let depositeDetails;
    const deposite = await Deposite.findOne({'history':{$elemMatch: {transaction_id: transaction_id}}});
    let allDeposite = [];
    const depositeHistory = deposite.history?.map( w=> allDeposite = [...allDeposite, w]);
    const targetDeposite = allDeposite.filter(p=> p.transaction_id === transaction_id);
    if(targetDeposite?.length > 0){
      const wallet = await Wallet.findOne({user_id: deposite.user_id});
      if(wallet){ 
        // if(targetDeposite.status === "pending"){
        //   const updateWallet = await Wallet.findOneAndUpdate({user_id: wallet.user_id}, {
        //     $set: {
        //       total_deposite: parseInt(wallet.total_deposite) - parseInt(targetDeposite[0]?.amount),
        //       topupable_balance: parseFloat(wallet.topupable_balance) - parseInt(targetDeposite[0]?.amount),
        //     }
        //   })
        // }
        if(targetDeposite[0].status === "success"){
          const updateWallet = await Wallet.findOneAndUpdate({user_id: wallet.user_id}, {
            $set: {
              total_deposite: parseInt(wallet.total_deposite) + parseInt(targetDeposite[0]?.amount),
            }
          })
          // topupable_balance: parseFloat(wallet.topupable_balance) + parseInt(targetDeposite[0]?.amount),
        }
        // if(targetDeposite.status === "cancel"){
        //   const updateWallet = await Wallet.findOneAndUpdate({user_id: wallet.user_id}, {
        //     $set: {
        //       total_deposite: parseInt(wallet.total_deposite) - parseInt(targetDeposite[0]?.amount),
        //       topupable_balance: parseFloat(wallet.topupable_balance) - parseInt(targetDeposite[0]?.amount),
        //     }
        //   })
        // }
      }else{
        res.status(400).json({
          message: "Cannot find wallet"
        })
      }
    }
      res.status(200).json({
        message: "Update deposite status successfully"
      })
    }else{
      res.status(400).json({
        message: "Cannot update deposite status"
      })
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// change deposite status
const changeWithdrawStatus = async (req, res) =>{
  try {
    const {transaction_id, status} = req.body;
    const ExistingWithdraw = await Withdraw.findOneAndUpdate({'history':{$elemMatch: {transaction_id: transaction_id}}}                                                       
    ,{$set: {                                                                             
        'history.$[t].status':status,                             
    }},
    {
      "arrayFilters": [{ "t.transaction_id": transaction_id }] 
    }
  );
    if(ExistingWithdraw){
      // let depositeDetails;
      const withdraw = await Withdraw.findOne({'history':{$elemMatch: {transaction_id: transaction_id}}});
      let allWithdraw = [];
      const depositeHistory = withdraw.history?.map( w=> allWithdraw = [...allWithdraw, w]);
      const targetWithdraw = allWithdraw.filter(p=> p.transaction_id === transaction_id);
      if(targetWithdraw?.length > 0){
        // find wallet
        const wallet = await Wallet.findOne({user_id: withdraw.user_id});
        if(wallet){ 
          // if(targetDeposite.status === "pending"){
          //   const updateWallet = await Wallet.findOneAndUpdate({user_id: wallet.user_id}, {
          //     $set: {
          //       total_income: parseInt(wallet.total_income) - parseInt(targetDeposite[0]?.amount),
          //     }
          //   })
          //   topupable_balance: parseFloat(wallet.topupable_balance) - parseInt(targetDeposite[0]?.amount),
          // }
          // if(targetWithdraw[0].status === "success"){
          //   const updateWallet = await Wallet.findOneAndUpdate({user_id: wallet.user_id}, {
          //     $set: {
          //       total_income: parseInt(wallet.total_income) - parseInt(targetWithdraw[0]?.amount),
          //     }
          //   })
          //   // topupable_balance: parseFloat(wallet.topupable_balance) + parseInt(targetWithdraw[0]?.amount),
          // }
          if(targetWithdraw[0].status === "reject"){
            const updateWallet = await Wallet.findOneAndUpdate({user_id: wallet.user_id}, {
              $set: {
                total_income: parseInt(wallet.total_income) + parseInt(targetWithdraw[0]?.amount),
              }
            })
          }
        }else{
          res.status(400).json({
            message: "Cannot find wallet"
          })
        }
      }
      res.status(200).json({
        message: "Update withdraw status successfully"
      })
    }else{
      res.status(400).json({
        message: "Cannot update withdraw status"
      })
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// change password
const changePassword = async (req, res) =>{
  try {
    const { current_password, new_password, otpCode} = req.body;
    const user_id = req.auth.id;
    if(!new_password){
      res.status(400).json({
          message: "New password is missing"
      })
    }
    if(!current_password){
      res.status(400).json({
          message: "Current password is missing"
      })
    }
    if(!otpCode){
      res.status(400).json({
          message: "OTP is missing"
      })
    }
    // find user
    const user = await User.findOne({user_id: user_id});
    if(user && (await user.matchPassword(current_password))){  
      // check OTP
      const otp = await Otp.findOne({ email: user.email });
      if (otp && parseInt(otp?.code) === parseInt(otpCode)) {
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(new_password, salt);
        const changePassword = await User.findByIdAndUpdate({_id: user._id}, {
          $set: {
            password: encryptedPassword
          }
        })
        await changePassword.save();
        res.status(200).json({
            message: "Password change successfully"
        })
      }else{
        res.status(400).json({
            message: "Invalid OTP"
        })
      }
    }else{
      res.status(400).json({
          message: "Invalid Current Password"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: error.toString()
    })
  }
}

// update email
const updateEmail = async (req, res) => {
  try {
    if (!req.body.current_email) {
      res.status(400).json({
          message: "Field is required!",
      });
    } else {
      // let userId = req.auth.id;
      let post = req.body;
      const { current_email, new_email, otpCode } = post;
      const user_id = req.auth.id;
      const user = await User.findOne({user_id: user_id});
      // check already have anaccount with this email or not
      const existingUser = await User.findOne({email: new_email});
      // check OTP
      const otp = await Otp.findOne({ email: new_email });
      if (parseInt(otp?.code) === parseInt(otpCode)) {
        if(!existingUser && user && user.email === current_email){
          let updateEmail = await User.findOneAndUpdate(
            { user_id: user_id },
            {
              $set: {
                email: new_email
              },
            },
            { new: true }
          );
          res.status(200).json({
            message: "Email changed Successfully",
          });
        }else{
          res.status(400).json({
              message: "Invalid user ID or email",
          });
        }
      }else{
        res.status(404).json({
            message: "Invalid OTP",
        });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({
        message: e.toString(),
    });
  }
};

// make topup
const makeTopup = async (req, res) => {
  try {
    // const {name, email, username, sponsor_id, position, amount } = req.body;
    const { user_id, packages, trx_password } = req.body;
    const userId = req.auth.id;
    // find user
    // if user ID is not there then send error
    if (!user_id || !packages) {
      res.status(400).json({message: "Please Enter all the Feilds"})
    }
      const user = await User.findOne({ user_id: user_id });
      const admin = await User.findOne({user_id: userId});
      const existingWallet = await Wallet.findOne({ user_id: user.user_id });
        if (user && trx_password === admin.trx_password) {
            // find existing Topup
            const existingTopup = await Topup.findOne({ user_id: user_id });
            if (existingTopup) {
              // Calculate current amount
              const date = new Date().toDateString();
              const status = "success";
              const updatedTopup = await Topup.findOneAndUpdate(
                { user_id: existingTopup?.user_id },
                {
                  $set: {
                    user: user._id,
                    packages: packages,
                    status: status,
                    history: [
                      {
                        user_id: user_id,
                        packages: packages,
                        status: status,
                        date: date,
                        transaction_id: generateString(15),
                      },
                      ...existingTopup.history,
                    ],
                  },
                }
                );
        
              // update user status
              const updatedUser = await User.updateOne(
                { _id: user._id },
                {
                  $set: {
                    topup_status: true,
                  },
                }
              );
              res.status(200).json({
                message: "Topup Successfull",
              });
            } else {
              const topup = await Topup.create({
                user: user._id,
                user_id: user_id,
                packages: packages,
                status: "success",
                date: new Date().toDateString(),
                history: [
                  {
                    user_id: user_id,
                    packages: packages,
                    status: "success",
                    date: new Date().toDateString(),
                    transaction_id: generateString(15),
                  },
                ],
              });
              // create level income
              const levelIncome = await LevelIncome.create({
                name: user.name,
                user_id: user.user_id,
                email: user.email,
                sponsor_id: user.sponsor_id,
                level_income: [],
              });
              // update user status
              const updatedUser = await User.updateOne(
                { _id: user._id },
                {
                  $set: {
                    topup_status: true,
                    activation_date: new Date().getMilliseconds(),
                    topup_activation_date: new Date().toDateString()
                  },
                }
              );
              if (topup) {
                res.status(200).json({
                  message: "Topup successfull"
                });
              } else {
                res.status(400).send({
                  message: "Cannot make topup",
                });
              }
            }
            // update reward income
            updateReward(user_id, packages);
        
            // Update Sposnore Wallet
            const level1 = await Wallet.findOne({ user_id: existingWallet.sponsor_id });
            const level2 = await Wallet.findOne({ user_id: level1?.sponsor_id });
            const level3 = await Wallet.findOne({ user_id: level2?.sponsor_id });
            const level4 = await Wallet.findOne({ user_id: level3?.sponsor_id });
            const level5 = await Wallet.findOne({ user_id: level4?.sponsor_id });
            const level6 = await Wallet.findOne({ user_id: level5?.sponsor_id });
            const level7 = await Wallet.findOne({ user_id: level6?.sponsor_id });
            const level8 = await Wallet.findOne({ user_id: level7?.sponsor_id });
            const level9 = await Wallet.findOne({ user_id: level8?.sponsor_id });
            const level10 = await Wallet.findOne({ user_id: level9?.sponsor_id });
            const level11 = await Wallet.findOne({ user_id: level10?.sponsor_id });
            const level12 = await Wallet.findOne({ user_id: level11?.sponsor_id });
            const level13 = await Wallet.findOne({ user_id: level12?.sponsor_id });
            const level14 = await Wallet.findOne({ user_id: level13?.sponsor_id });
            const level15 = await Wallet.findOne({ user_id: level14?.sponsor_id });
            const level16 = await Wallet.findOne({ user_id: level15?.sponsor_id });
            const level17 = await Wallet.findOne({ user_id: level16?.sponsor_id });
            const level18 = await Wallet.findOne({ user_id: level17?.sponsor_id });
            const level19 = await Wallet.findOne({ user_id: level18?.sponsor_id });
            const level20 = await Wallet.findOne({ user_id: level19?.sponsor_id });
        
            // Update Sposnore level income
            const levelIncome1 = await LevelIncome.findOne({
              user_id: user.sponsor_id,
            });
            const levelIncome2 = await LevelIncome.findOne({
              user_id: levelIncome1?.sponsor_id,
            });
            const levelIncome3 = await LevelIncome.findOne({
              user_id: levelIncome2?.sponsor_id,
            });
            const levelIncome4 = await LevelIncome.findOne({
              user_id: levelIncome3?.sponsor_id,
            });
            const levelIncome5 = await LevelIncome.findOne({
              user_id: levelIncome4?.sponsor_id,
            });
            const levelIncome6 = await LevelIncome.findOne({
              user_id: levelIncome5?.sponsor_id,
            });
            const levelIncome7 = await LevelIncome.findOne({
              user_id: levelIncome6?.sponsor_id,
            });
            const levelIncome8 = await LevelIncome.findOne({
              user_id: levelIncome7?.sponsor_id,
            });
            const levelIncome9 = await LevelIncome.findOne({
              user_id: levelIncome8?.sponsor_id,
            });
            const levelIncome10 = await LevelIncome.findOne({
              user_id: levelIncome9?.sponsor_id,
            });
            const levelIncome11 = await LevelIncome.findOne({
              user_id: levelIncome10?.sponsor_id,
            });
            const levelIncome12 = await LevelIncome.findOne({
              user_id: levelIncome11?.sponsor_id,
            });
            const levelIncome13 = await LevelIncome.findOne({
              user_id: levelIncome12?.sponsor_id,
            });
            const levelIncome14 = await LevelIncome.findOne({
              user_id: levelIncome13?.sponsor_id,
            });
            const levelIncome15 = await LevelIncome.findOne({
              user_id: levelIncome14?.sponsor_id,
            });
            const levelIncome16 = await LevelIncome.findOne({
              user_id: levelIncome15?.sponsor_id,
            });
            const levelIncome17 = await LevelIncome.findOne({
              user_id: levelIncome16?.sponsor_id,
            });
            const levelIncome18 = await LevelIncome.findOne({
              user_id: levelIncome17?.sponsor_id,
            });
            const levelIncome19 = await LevelIncome.findOne({
              user_id: levelIncome18?.sponsor_id,
            });
            const levelIncome20 = await LevelIncome.findOne({
              user_id: levelIncome19?.sponsor_id,
            });
        
            updateLevelIncome(level1, levelIncome1, user.user_id, packages, 1);
            updateLevelIncome(level2, levelIncome2, user.user_id, packages, 2);
            updateLevelIncome(level3, levelIncome3, user.user_id, packages, 3);
            updateLevelIncome(level4, levelIncome4, user.user_id, packages, 4);
            updateLevelIncome(level5, levelIncome5, user.user_id, packages, 5);
            updateLevelIncome(level6, levelIncome6, user.user_id, packages, 6);
            updateLevelIncome(level7, levelIncome7, user.user_id, packages, 7);
            updateLevelIncome(level8, levelIncome8, user.user_id, packages, 8);
            updateLevelIncome(level9, levelIncome9, user.user_id, packages, 9);
            updateLevelIncome(level10, levelIncome10, user.user_id, packages, 10);
            updateLevelIncome(level11, levelIncome11, user.user_id, packages, 11);
            updateLevelIncome(level12, levelIncome12, user.user_id, packages, 12);
            updateLevelIncome(level13, levelIncome13, user.user_id, packages, 13);
            updateLevelIncome(level14, levelIncome14, user.user_id, packages, 14);
            updateLevelIncome(level15, levelIncome15, user.user_id, packages, 15);
            updateLevelIncome(level16, levelIncome16, user.user_id, packages, 16);
            updateLevelIncome(level17, levelIncome17, user.user_id, packages, 17);
            updateLevelIncome(level18, levelIncome18, user.user_id, packages, 18);
            updateLevelIncome(level19, levelIncome19, user.user_id, packages, 19);
            updateLevelIncome(level20, levelIncome20, user.user_id, packages, 20);
        }else {
              res.status(400).json({
                  message: "Invalid User ID or admin Transaction Password",
              });
          }     
  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: error.toString()
    })
  }
};

const createRoi = async (req, res) => {
  try {
    const { user_id, packages } = req.body;
    // const  user_id = req.auth.id;
  // if user email is not there then send error
  if (!user_id) {
    res.status(400).json(
      {message: "User ID not found"}
    )
  }
  const user = await User.findOne({user_id: user_id});
  let return_per_day;
  let total_days;
  if (parseInt(packages) === 25) {
    return_per_day = 0.3;
    total_days = 600;
  } else {
    return_per_day = 0.5;
    total_days = 600;
  }
  // calculation for initial returns
  const return_amount = (return_per_day * parseInt(packages)) / 100;
  const net_return = parseFloat(parseFloat(return_amount).toFixed(3)) * total_days;
  // save data to the database
  const newInvestment = await Roi.create({
    email: user.email,
    user_id,
    total_days,
    packages,
    return_per_day,
    current_day: 0,
    return_amount: parseFloat(parseFloat(return_amount).toFixed(3)),
    total_return: 0,
    net_return,
    // transaction_id: generateString(15),
    activation_status: true,
    history: []
  });

  if (newInvestment) {
    res.status(201).json({message: "ROI created successfully"});
  } else {
    res.status(400).json({message: "Can not create ROI"})
  }
  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: error.toString()
    })
  }
};

// Get all support ticket
const getAllSupportTicket = async (req, res) =>{
  try {
    const supportTicket = await SupportTicket.find({});
    let allSupport = [];
    const supportTicketHistory = supportTicket.map( w=> w.history.map(h=> allSupport = [...allSupport, h]));
    res.status(200).json(allSupport.reverse());
  } catch (error) {
    res.send(error)
  }
}

// get contact us messages
const getAllContactUs = async (req, res)=>{
  try {
    const contactUs = await Contact.find({});
    let allContactUs = [];
    const contactUsHistory = contactUs.map( w=> w.history.map(h=> allContactUs = [...allContactUs, h]));
    res.status(200).json(allContactUs.reverse());
  } catch (error) {
    res.send(error)
  }
}

// publish updates
const createUpdates = async (req, res) =>{
  try {
    const {title, description} = req.body;
    if(!req.body){
      res.status(400).json({
        message: "Please provide data"
      })
    }
    if(!title){
      res.status(400).json({
        message: "Title is missing"
      })
    }
    if(!description){
      res.status(400).json({
        message: "Description is missing"
      })
    }
    const newUpdates = await Update.create({
      title,
      description,
    })

    if(newUpdates){
      res.status(200).json({
        message: "New update published successfully"
      })
    }else{
      res.status(400).json({
        message: "Cannont create new update"
      })
    }

  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

const changePopUpImg = async (req, res) =>{
  try {
    if(!req.file?.path) res.status(400).json({
      message: "Image is missing",
    });
    const findImage = await PopupImage.findOne({image_id: "TLCPOPUPIMAGE"});
    if (findImage?.avatar_public_url) {
      await Cloudinary.uploader.destroy(findImage.avatar_public_url);
    }
    const image = await Cloudinary.uploader.upload(req.file.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };
    if(findImage){
    const upImage = await PopupImage.findOneAndUpdate({image_id: "TLCPOPUPIMAGE"}, {
      $set: {
        avatar: avatar.avatar,
        avatar_public_url: avatar.avatar_public_url
      }
    });
    if(upImage){
      res.status(200).json({ message: "Image uploaded" });
    }else{
      res.status(200).json({ message: "Cannot upload Image"});
    }
  }else{
    const upImage = await PopupImage.create({
        avatar: avatar.avatar,
        avatar_public_url: avatar.avatar_public_url
      }
    );
    if(upImage){
      res.status(200).json({ message: "Image uploaded" });
    }else{
      res.status(200).json({ message: "Cannot upload Image"});
    }
  }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message.toString() });
  }
}

module.exports = {
  getAllUser,
  getActiveUser,
  getBlockedUser,
  changeUserStatus,
  userAnalytics,
  activeUserCount,
  blockedUserCount,
  pendingWithdrawCount,
  completeWithdrawCount,
  allDepositeHistory,
  successDepositeHistory,
  rejectDepositeHistory,
  allWithdrawHistory,
  successWithdrawHistory,
  rejectWithdrawHistory,
  fundTransferReport,
  levelIncomeData,
  totalInvest,
  roiIncomeData,
  rewardIncomeData,
  deleteUser,
  editUser,
  changeDepositeStatus,
  changeWithdrawStatus,
  updateEmail,
  changePassword,
  makeTopup,
  getAllSupportTicket,
  getAllContactUs,
  createUpdates,
  createRoi,
  changePopUpImg,
};
