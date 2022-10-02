const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");
const Otp = require("../../models/otpModel");
const Level = require("../../models/levelModel");
const generateString = require("../../config/generateRandomString");
const Withdraw = require("../../models/withdrawModel");
const Topup = require("../../models/topUpModel");
const Wallet = require("../../models/walletModel");
const updateLevelIncome = require("../../config/updateLevelIncome");
const Deposite = require("../../models/depositeModel");
const LevelIncome = require("../../models/levelIncomeModel");
const Reward = require("../../models/rewardModel");
const updateReward = require("../../config/updateReward");
const TransferFund = require("../../models/transferFundModel");
const Roi = require("../../models/roiModel");
const Cloudinary = require("../../config/cloudinary.js");
const SupportTicket = require("../../models/supportTicketModel");
const Contact = require("../../models/contactUsModel");
const Update = require("../../models/updateModel");
const getIstTime = require("../../config/getTime");

// Get refferalInfo
const getRefferalInfo = async (req, res) => {
  try {
    const userId = req.query.user_id;

  const user = await User.findOne({ user_id: userId });

  if (user) {
    res.status(200).json({
      name: user.name,
    });
  } else {
    res.status(400).send({
      message: "Invalid user ID",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

// Get user Information
const getUserInfo = async (req, res) => {
  try {
    // const userId = req.params.user_id;
    let userId = req.auth.id;

  const user = await User.findOne({ user_id: userId })
  const {password, ...userInfo} = user._doc;
  //.populate("team");

  if (userInfo) {
    res.status(200).json({
      data: userInfo,
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

// get level team
const getLevelTeam = async (req, res) => {
  try {
    // const user_id = req.params.user_id;
    const user_id = req.auth.id;
  if (user_id) {
    const levelTeam = await Level.findOne({ user_id: user_id }).populate({
      path: 'level.user',
      model: 'User',
      select: "topup_activation_date"
    });
    // const data = {}
    if (levelTeam) {
      res.status(200).json({
        name: levelTeam.name,
        user_id: levelTeam.user_id,
        email: levelTeam.email,
        sponsor_id: levelTeam.sponsor_id,
        level: levelTeam?.level.reverse(),
      });
    } else {
      res.status(400).json({
          message: "Cannot find any team",
      });
    }
  } else {
    res.status(400).json({
        message: "Cannot find User ID",
    });
  }
  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: error.toString()
    })
  }
};

// Update user Information
const updateUserInfo = async (req, res) => {
  try {
    const data = req.body;
    // const user = User.findOne(({user_id: data.user_id}));
    // if(user){
      const updatedUser = await User.updateOne({ user_id: data.user_id}, data);
      if (updatedUser) {
        res.status(200).json({
          message: "User information updated"
        });
      } else {
        res.status(400).json({
          message: "Cannot update user information",
        });
      }
    // }else{
    //   res.send({
    //     status: 400,
    //     message: "Cannot find user",
    //     error: 400,
    //   });
    // }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: error.toString()
    })
  }
};

// change TRX password
const changeTrxPassword = async (req, res) => {
  try {
    const { current_trx_password, new_trx_password, otpCode } = req.body;
    const user_id = req.auth.id;
    if(!current_trx_password){
      res.status(400).json({
        message: "Current TRX password is missing"
      })
    }
    if(!new_trx_password){
      res.status(400).json({
        message: "New TRX password is missing"
      })
    }
    if(!otpCode){
      res.status(400).json({
        message: "OTP is missing"
      })
    }
    const user = await User.findOne({user_id: user_id});
      // check already have anaccount with this email or not
      const existingUser = await User.findOne({trx_password: new_trx_password});
      // check OTP
      const otp = await Otp.findOne({ email: user.email });
      if (parseInt(otp?.code) === parseInt(otpCode)) {
        if(!existingUser && user && user.trx_password === current_trx_password){
            const updateUser = await User.updateOne(
              { user_id: user_id },
              {
                $set: {
                  trx_password: new_trx_password,
                },
              }
            );
            if (updateUser) {
              res.status(200).json({
                message: "TRX Password changed successfully",
              });
            } else {
              res.status(400).json({
                message: "Cannot update TRX password",
              });
            }
          }else{
            res.status(400).json({
                message: "Invalid current Trx password",
            });
          }
      }else{
        res.status(400).json({
            message: "Invalid OTP",
        });
      }
  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: error.toString()
    })
  }
};

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

// deposite
const depositeAmount = async (req, res) => {
  try {
    const { user_id, amount, trx_password, hash } = req.body;
    if(!req.body) res.status(400).json({
      message: "Please provide data",
    });
    if(!req.file?.path) res.status(400).json({
      message: "Proof image is missing",
    });
    if(!user_id) res.status(400).json({
      message: "User Id is missing",
    });
    if(!amount) res.status(400).json({
      message: "Amount is missing",
    });
    if(!trx_password) res.status(400).json({
      message: "Trx password is missing",
    });

  // find user
  const user = await User.findOne({ user_id: user_id });

  const image = await Cloudinary.uploader.upload(req.file?.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };

  // if(typeof(amount) === "number"){
    if (user && trx_password === user.trx_password) {
      if(parseInt(amount) >= 25){
        // if(avatar){
          // find deposit
          const deposite_exist = await Deposite.findOne({ user_id: user.user_id });
          if (!deposite_exist) {
            const newDeposite = await Deposite.create({
              user: user._id,
              user_id: user.user_id,
              total_deposite: parseInt(amount),
              last_deposite_amount: parseInt(amount),
              history: [
                {
                  user_id: user.user_id,
                  name: user.name,
                  amount: parseInt(amount),
                  status: "pending",
                  date: new Date().toDateString(),
                  transaction_id: generateString(15),
                  hash: hash,
                  proof_pic: avatar,
                  time: getIstTime(),
                },
              ],
            });
            if (newDeposite) {
              // update wallet
              const wallet = await Wallet.findOne({ user_id: user.user_id });
              if (wallet) {
                const updatedDeposite = await Deposite.findOne({ user_id: user.user_id });
                const updateWallet = await Wallet.findByIdAndUpdate(
                  { _id: wallet._id },
                  {
                    $set: {
                      history: updatedDeposite._id,
                    },
                  }
                  );
                  // total_deposite: parseInt(wallet.total_deposite) + parseInt(amount),
                  // current_amount: parseInt(wallet.current_amount) + parseInt(amount),
                  // topupable_balance: parseFloat(wallet.topupable_balance) + parseInt(amount),
                await updateWallet.save();
              } else {
                res.status(400).json({
                    message: "Cannot find wallet",
                });
              }
            }
            res.status(200).json({
              message: "Deposite request successfull",
            });
          } else {
            const updateDeposite = await Deposite.findByIdAndUpdate(
              { _id: deposite_exist._id },
              {
                $set: {
                  total_deposite: parseInt(deposite_exist.total_deposite) + parseInt(amount),
                  last_deposite_amount: parseInt(amount),
                  date: new Date(),
                },
                $push: {
                  history: {
                    user_id: user.user_id,
                    name: user.name,
                    amount: parseInt(amount),
                    status: "pending",
                    date: new Date().toDateString(),
                    transaction_id: generateString(15),
                    proof_pic: avatar,
                    hash: hash,
                    time: getIstTime(),
                  },
                },
              }
            );
            await updateDeposite.save();
            // update wallet
            const wallet = await Wallet.findOne({ user_id: user.user_id });
            if (wallet) {
              const updateWallet = await Wallet.findByIdAndUpdate(
                { _id: wallet._id },
                {
                  $set: {
                    history: updateDeposite._id,
                  },
                }
                );
                // total_deposite: parseInt(wallet.total_deposite) + parseInt(amount),
                // topupable_balance: parseFloat(wallet.topupable_balance) + parseInt(amount),
              await updateWallet.save();
            } else {
              res.status(400).json({
                  message: "Cannot find wallet",
              });
            }
            res.status(200).json({
              message: "Deposite request successfull",
            });
          }
        // }else{
        //   res.status(400).json({
        //     message: "Cannot get proof image"
        //   })
        // }
      }else{
        res.status(400).json({
            message: "Minimum deposite amount is 30"
        })
      }
    } else {
      res.status(400).json({
          message: "Invalid User ID or Transaction Password",
      });
    }
  // }else{
  //   res.status(400).json({
  //       message: "Amount not a number"
  //   })
  // }
  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: error.toString()
    })
  }
};

// get deposite history
const depositeHistory = async (req, res) => {
  try {
    // const user_id = req.params.user_id;
    const user_id = req.auth.id;
  if (!user_id) {
    res.status(400);
    throw new Error("Data not found");
  }
  const depositeInfo = await Deposite.findOne({ user_id: user_id })
  // .populate(
  //   "user"
  // );
  if (depositeInfo) {
    res.status(200).json({
      user: depositeInfo.user,
      transaction_id: depositeInfo.transaction_id,
      history: depositeInfo.history.reverse(),
    });
  } else {
    res.status(400).json({
        message: "Cannot find deposite information",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
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
  if(user_id !== userId){
    res.status(400).json({message: "Invalid user id"})
  }else{
    const user = await User.findOne({ user_id: user_id });
    const existingWallet = await Wallet.findOne({ user_id: user?.user_id });
  
    if (user && trx_password === user.trx_password) {
      const depositeBalance = parseInt(existingWallet.total_deposite);
      const totalIncome = parseFloat(existingWallet.total_income);
      if((depositeBalance + totalIncome) >= parseInt(packages)){
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
                    time: getIstTime(),
                  },
                  ...existingTopup.history,
                ],
              },
            }
            );
            // await updatedTopup.save();
            // Update Wallet
            if (existingWallet) {
              const topup = await Topup.findOne({ user_id: user.user_id });
              if(depositeBalance >= parseInt(packages)){
                const updateWallet = await Wallet.findOneAndUpdate(
                  { user_id: user.user_id },
                  {
                    $set: {
                      total_deposite: parseInt(existingWallet.total_deposite) - parseInt(packages),
                      topup_history: topup._id,
                    },
                  }
                  );
                  // topupable_balance:
                  //   parseFloat(existingWallet.topupable_balance) - parseInt(packages),
                  // withdrawable_balance: parseFloat(existingWallet.withdrawable_balance) >= 0 && parseFloat(existingWallet.withdrawable_balance) - parseInt(packages),
              }
              if(depositeBalance <= parseInt(packages) && (totalIncome + depositeBalance) >= parseInt(packages)){
                const updateWallet = await Wallet.findOneAndUpdate(
                  { user_id: user.user_id },
                  {
                    $set: {
                      total_deposite: 0,
                      total_income: (parseInt(existingWallet.total_income) - (parseInt(packages) - parseInt(existingWallet.total_deposite))),
                      deduct_total_income: (parseFloat(existingWallet.deduct_total_income) + (parseInt(packages) - parseInt(existingWallet.total_deposite))),
                      topup_history: topup._id,
                    },
                  }
                  );
                  // topupable_balance:
                  //   parseFloat(existingWallet.topupable_balance) - parseInt(packages),
                  // withdrawable_balance: parseFloat(existingWallet.withdrawable_balance) >= 0 && parseFloat(existingWallet.withdrawable_balance) - parseInt(packages),
              }
          } else {
            res.status(400).json({
                message: "Cannot update Wallet",
            });
          }
          // // update reward income
          // updateReward(user, packages);
    
          // update user status
          const updatedUser = await User.updateOne(
            { _id: user._id },
            {
              $set: {
                topup_status: true,
                active_package: packages,
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
                time: getIstTime(),
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
                topup_activation_date: new Date().toDateString(),
                active_package: packages,
              },
            }
          );
          if (topup) {
            // Update Wallet
            if (existingWallet) {
              const topup = await Topup.findOne({ user_id: user.user_id });
              if(depositeBalance >= parseInt(packages)){
                const updateWallet = await Wallet.findOneAndUpdate(
                  { user_id: user.user_id },
                  {
                    $set: {
                      total_deposite: parseInt(existingWallet.total_deposite) - parseInt(packages),
                      topup_history: topup._id,
                    },
                  }
                  );
                  // topupable_balance:
                  //   parseFloat(existingWallet.topupable_balance) - parseInt(packages),
                  // withdrawable_balance: parseFloat(existingWallet.withdrawable_balance) >= 0 && parseFloat(existingWallet.withdrawable_balance) - parseInt(packages),
              }
              if(depositeBalance <= parseInt(packages) && (totalIncome + depositeBalance) >= parseInt(packages)){
                const updateWallet = await Wallet.findOneAndUpdate(
                  { user_id: user.user_id },
                  {
                    $set: {
                      total_deposite: 0,
                      total_income: (parseInt(existingWallet.total_income) - (parseInt(packages) - parseInt(existingWallet.total_deposite))),
                      deduct_total_income: (parseFloat(existingWallet.deduct_total_income) + (parseInt(packages) - parseInt(existingWallet.total_deposite))),
                      topup_history: topup._id,
                    },
                  }
                  );
                  // topupable_balance:
                  //   parseFloat(existingWallet.topupable_balance) - parseInt(packages),
                  // withdrawable_balance: parseFloat(existingWallet.withdrawable_balance) >= 0 && parseFloat(existingWallet.withdrawable_balance) - parseInt(packages),
              }
            } else {
              res.status(400).json({
                status: 400,
                error: {
                  message: "Cannot update Wallet",
                },
              });
            }
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

      }else{
        res.status(400).json({
          message: "Insufficient balance"
        })
      }
    } else {
      res.status(400).json({
          message: "Invalid User ID or Transaction Password",
      });
    }

  }
  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: error.toString()
    })
  }
};

// get topup history
const topupHistory = async (req, res) => {
  try {
    // const user_id = req.params.user_id;
    const user_id = req.auth.id;
  if (!user_id) {
    res.status(400);
    throw new Error("Data not found");
  }
  const topupInfo = await Topup.findOne({ user_id: user_id })
  // .populate("user");
  if (topupInfo) {
    res.status(200).json({
      user: topupInfo.user,
      transaction_id: topupInfo.transaction_id,
      history: topupInfo.history,
    });
  } else {
    res.status(400).json({
        message: "Cannot find topup information",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

// Fund transfer
const fundTransfer = async (req, res) => {
  try {
    const { receiver_id, amount } = req.body;
    const  user_id = req.auth.id;
  if (!user_id || !receiver_id || !amount) {
    res.status(400).json({
        message: "Please provide all data",
    });
  }
  // let trx_amount = amount * 14.16;
  // find user
  const user = await User.findOne({ user_id: user_id });
  if (user) {
    // find sender level
    const levelSender = await Level.findOne({ user_id: user_id });
    // find receiver level
    const levelReceiver = await Level.findOne({ user_id: receiver_id });
    // find sender wallet
    const walletSender = await Wallet.findOne({ user_id: user_id });
    if (levelSender && levelReceiver) { // replace || to &&
      const matchReceiver = levelSender?.level.filter(
        (item) => item.user_id === receiver_id
      );
      const matchSender = levelReceiver?.level.filter(
        (item) => item.user_id === user_id
      );

      if(matchReceiver[0] || matchSender[0]){
        if (walletSender && parseFloat(walletSender.total_deposite) + parseFloat(walletSender.total_income) >= amount) {
          const depositeBalance = parseInt(walletSender.total_deposite);
          const totalIncome = parseFloat(walletSender.total_income);
          // check existing transfer fund collection
          const existingFundTransfer = await TransferFund.findOne({
            user_id: user_id,
          });
          if (!existingFundTransfer) {
            // make new fund transfer
            const newFundTransfer = await TransferFund.create({
              user: user._id,
              user_id: user_id,
              receiver_id: receiver_id,
              amount: parseInt(amount),
              // transaction_id: generateString(15),
              history: [
                {
                  user_id: user_id,
                  name: user.name,
                  receiver_id: receiver_id,
                  amount: parseInt(amount),
                  date: new Date().toDateString(),
                  status: "success",
                  transaction_id: generateString(15),
                  time: getIstTime(),
                },
              ],
            });
            if (newFundTransfer) {
              // update sender wallet
              // find wallet
              const senderWallet = await Wallet.findOne({ user_id: user_id });
              if(depositeBalance >= parseInt(amount)){
                const updateSenderWallet = await Wallet.findOneAndUpdate(
                  { user_id: user_id },
                  {
                    $set: {
                      total_deposite: parseInt(senderWallet.total_deposite) - parseInt(amount),
                    },
                  }
                );
              }
              if(depositeBalance <= parseInt(amount) && (totalIncome + depositeBalance) >= parseInt(amount)){
                const updateSenderWallet = await Wallet.findOneAndUpdate(
                  { user_id: user_id },
                  {
                    $set: {
                      total_deposite: 0,
                      total_income: (parseInt(senderWallet.total_income) - (parseInt(amount) - parseInt(senderWallet.total_deposite))),
                      deduct_total_income: (parseFloat(senderWallet.deduct_total_income) + (parseInt(amount) - parseInt(senderWallet.total_deposite))),
                    },
                  }
                  );
                  // topupable_balance:
                  //   parseFloat(existingWallet.topupable_balance) - parseInt(packages),
                  // withdrawable_balance: parseFloat(existingWallet.withdrawable_balance) >= 0 && parseFloat(existingWallet.withdrawable_balance) - parseInt(packages),
              }
              // await updateSenderWallet.save();
  
              // update receiver wallet
              // find wallet
              const receiverWallet = await Wallet.findOne({
                user_id: receiver_id,
              });
              const updateReceiverWallet = await Wallet.findOneAndUpdate(
                { user_id: receiver_id },
                {
                  $set: {
                    total_deposite:
                      parseFloat(receiverWallet.total_deposite) +
                      parseInt(amount),
                  },
                }
              );
              // await updateReceiverWallet.save();
            }
            res.status(200).json({
              message: "Successfully Transfer fund",
            });
          } else {
            // update existing fund transfer collection
            const updateExistingFundTransfer =
              await TransferFund.findOneAndUpdate(
                {
                  user_id: user_id,
                },
                {
                  $set: {
                    amount:
                      parseFloat(existingFundTransfer.amount) +
                      parseInt(amount),
                  },
                  $push: {
                    history: {
                      user_id: user_id,
                      name: user.name,
                      receiver_id: receiver_id,
                      amount: parseInt(amount),
                      date: new Date().toDateString(),
                      transaction_id: generateString(15),
                      status: "success",
                      time: getIstTime(),
                    },
                  },
                }
              );
            // await updateExistingFundTransfer.save();
            if (updateExistingFundTransfer) {
              // update sender wallet
              // find sender wallet
              const senderWallet = await Wallet.findOne({ user_id: user_id });
              if(depositeBalance >= parseInt(amount)){
                const updateSenderWallet = await Wallet.findOneAndUpdate(
                  { user_id: user_id },
                  {
                    $set: {
                      total_deposite: parseInt(senderWallet.total_deposite) - parseInt(amount),
                    },
                  }
                );
              }
              if(depositeBalance <= parseInt(amount) && (totalIncome + depositeBalance) >= parseInt(amount)){
                const updateSenderWallet = await Wallet.findOneAndUpdate(
                  { user_id: user_id },
                  {
                    $set: {
                      total_deposite: 0,
                      total_income: (parseInt(senderWallet.total_income) - (parseInt(amount) - parseInt(senderWallet.total_deposite))),
                      deduct_total_income: (parseFloat(senderWallet.deduct_total_income) + (parseInt(amount) - parseInt(senderWallet.total_deposite))),
                    },
                  }
                  );
                  // topupable_balance:
                  //   parseFloat(existingWallet.topupable_balance) - parseInt(packages),
                  // withdrawable_balance: parseFloat(existingWallet.withdrawable_balance) >= 0 && parseFloat(existingWallet.withdrawable_balance) - parseInt(packages),
              }
              // await updateSenderWallet.save();
              // update receiver wallet
              // find receiver wallet
              const receiverWallet = await Wallet.findOne({
                user_id: receiver_id,
              });
              const updateReceiverWallet = await Wallet.findOneAndUpdate(
                { user_id: receiver_id },
                {
                  $set: {
                    total_deposite:
                      parseFloat(receiverWallet.total_deposite) +
                      parseInt(amount),
                  },
                }
              );
              // await updateReceiverWallet.save();
            }
            res.status(200).json({
              message: "Successfully Transfer fund",
            });
          }
        } else {
          res.status(400).json({
              message:
                "Insufficient balance",
          });
        }
      }else{
        res.status(400).json({
            message:
              "You cannot transfer fund outside of your level",
        });
      }
    } else {
      res.status(400).json({
          message: "Invalid Receiver ID",
      });
    }
  } else {
    res.status(400).json({
        message: "Cannot find user",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

// get transfer fund history
const transferFundHistory = async (req, res) => {
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
  if (userId) {
    const transferFund = await TransferFund.findOne({ user_id: userId });
    if (transferFund) {
      res.status(200).json({
        _id: transferFund._id,
        user: transferFund.user,
        user_id: transferFund.user_id,
        receiver_id: transferFund.receiver_id,
        amount: transferFund.amount,
        status: transferFund.status,
        history: transferFund.history.reverse(),
      });
    } else {
      res.status(400).json({
          message: "Cannot find transfer fund history",
      });
    }
  } else {
    res.status(400).json({
        message: "Cannot find user ID",
    });
  }
  } catch (error) {
    res.status(400).json({
      error: error.toString()
    })
  }
};

// get wallet data
const getWallet = async (req, res) => {
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
  if (userId) {
    const data = await Wallet.findOne({ user_id: userId })
    // complete withdraw
    const withdraw = await Withdraw.find({user_id: userId});
    let totalWithdraw = 0;
    let allWithdraw = [];
    const withdrawHistory = withdraw.map( w=> w.history.map(h=> allWithdraw = [...allWithdraw, h]));
    allWithdraw.map(t=> totalWithdraw = parseInt(totalWithdraw) + parseInt(t.amount));
    const newData = {...data._doc, total_withdraw: totalWithdraw}
    res.status(200).json(newData);
  } else {
    res.send({
      status: 400,
      message: "Cannot get wallet",
      error: 400,
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

// Withdraw
const withdrawAmount = async (req, res) => {
  try {
    const { amount, trx_password, trx_address } = req.body;
    const user_id = req.auth.id;
  // find user
  const user = await User.findOne({ user_id: user_id });

  if (user && user.trx_password === trx_password) {
    if(parseInt(amount) >= 25){
      if (user) {
        const wallet = await Wallet.findOne({ user_id: user_id });
        // res.status(200).json(data);
        if (wallet && parseFloat(wallet.total_income) > parseInt(amount)) {
          // find withdraw
          const withdraw = await Withdraw.findOne({ user_id: user.user_id });
          if (withdraw) {
            const updateWithdraw = await Withdraw.findByIdAndUpdate(
              { _id: withdraw._id },
              {
                $set: {
                  amount: parseInt(withdraw.amount) + parseInt(amount),
                },
                $push: {
                  history: {
                    user_id: user.user_id,
                    amount: amount,
                    trx_address: trx_address,
                    status: "pending",
                    current_amount: parseFloat(wallet.total_income) - parseInt(amount),
                    transaction_id: generateString(15),
                    date: new Date().toDateString(),
                    time: getIstTime(),
                  },
                },
              }
            );
            await updateWithdraw.save();
            // update wallet
            if (updateWithdraw) {
              // const currentAmount = parseFloat(wallet.current_amount) - amount;
              // const currentWithdrawable = parseFloat(wallet.withdrawable_balance) - amount;
              const updateWallet = await Wallet.findOneAndUpdate(
                { _id: wallet._id },
                {
                  $set: {
                    withdraw_history: updateWithdraw._id,
                    total_income: parseFloat(wallet.total_income) - parseInt(amount),
                    total_withdraw: parseInt(wallet.total_withdraw) + parseInt(amount),
                  },
                }
                );
                // current_amount: currentAmount,
              // await updateWallet.save();
              res.status(200).json({
                message: "Withdarw request Successfull",
              });
            } else {
              res.status(400).json({
                  message: "Cannot Update wallet",
              });
            }
          } else {
            const createWithdraw = await Withdraw.create({
              user: user._id,
              user_id: user.user_id,
              amount: amount,
              // status: "pending",
              // transaction_id: generateString(15),
              history: [
                {
                  user_id: user.user_id,
                  amount: amount,
                  trx_address: trx_address,
                  status: "pending",
                  current_amount: parseFloat(wallet.total_income) - parseInt(amount),
                  transaction_id: generateString(15),
                  date: new Date().toDateString(),
                  time: getIstTime(),
                },
              ],
            });
            // update wallet
            if (createWithdraw) {
              // const currentAmount = parseFloat(wallet.current_amount) - amount;
              // const currentWithdrawable = parseFloat(wallet.withdrawable_balance) - amount;
              const updateWallet = await Wallet.findOneAndUpdate(
                { _id: wallet._id },
                {
                  $set: {
                    withdraw_history: createWithdraw._id,
                    total_income: parseFloat(wallet.total_income) - parseInt(amount),
                    total_withdraw: parseInt(wallet.total_withdraw) + parseInt(amount),
                  },
                }
                );
                // await updateWallet.save();
                // current_amount: currentAmount,
              res.status(200).json({
                message: "Withdarw request Successfull",
              });
            } else {
              res.status(400).json({
                  message: "Cannot Update wallet",
              });
            }
          }
        } else {
          res.status(400).json({
            message: "Insufficient balance",
          });
        }
      } else {
        res.status(400).json({
          message: "Cannot withdraw",
        });
      }
    }else{
      res.status(400).json({
        message: "Minimum withdraw amount is 25"
      })
    }
  } else {
    res.status(400).json({
        message: "Transaction password invalid",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

// get withdraw history
const withdrawHistory = async (req, res) => {
  try {
    // const user_id = req.params.user_id;
    const user_id = req.auth.id;
  if (!user_id) {
    res.status(400);
    throw new Error("Data not found");
  }
  const withdrawInfo = await Withdraw.findOne({ user_id: user_id })
  // .populate(
  //   "user"
  // );
  if (withdrawInfo) {
    res.status(200).json({
      user: withdrawInfo.user,
      transaction_id: withdrawInfo.transaction_id,
      history: withdrawInfo.history.reverse(),
    });
  } else {
    res.status(400).json({
        message: "Cannot find withdraw information",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

// get level Income
const getLevelIncome = async (req, res) => {
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
    if (userId) {
      const levelIncome = await LevelIncome.findOne({ user_id: userId }).sort({"level_income.time": -1});
      if (levelIncome) {
        res.status(200).json(levelIncome);
      } else {
        res.status(400).json({
            message: "Cannot find Level Income",
        });
      }
    } else {
      res.status(400).json({
          message: "Cannot find user ID",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

// get level Income
const getRewardIncome = async (req, res) => {
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
  if (userId) {
    const rewardIncome = await Reward.findOne({ user_id: userId });
    if (rewardIncome) {
      res.status(200).json(rewardIncome);
    } else {
      res.status(400).json({
          message: "Cannot find Level Income",
      });
    }
  } else {
    res.status(400).json({
        message: "Cannot find user ID",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

const createRoi = async (req, res) => {
  try {
    const { email, packages } = req.body;
    const  user_id = req.auth.id;
  // if user email is not there then send error
  if (!email) {
    res.status(400).json(
      {message: "User email not found"}
    )
  }
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
    email,
    user_id,
    total_days,
    packages,
    return_per_day,
    current_day: 0,
    return_amount: parseFloat(parseFloat(return_amount).toFixed(3)),
    total_return: 0,
    net_return,
    activation_status: true,
    // transaction_id: generateString(15),
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

// get ROI data
const getRoiData = async (req, res) => {
  try {
    const  userId = req.auth.id;
  if (userId) {
    const data = await Roi.find({ user_id: userId });
    let allRoiIncome = [];
    const roiIncomeHistory = data.map( w=> w.history.map(h=> allRoiIncome = [...allRoiIncome, h]));
    res.status(200).json(allRoiIncome.reverse());
  }
  else{
      res.status(400).json({
        message: "Invalid user ID"
      });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
};

// update user profile picture
const updateProfilePic = async (req, res) => {
  try {
    const user_id = req.auth.id;
    if(!req.file?.path) res.status(400).json({
      message: "Image is missing",
    });
    const findUser = await User.findOne({user_id: user_id});
    if (findUser.avatar_public_url) {
      await Cloudinary.uploader.destroy(findUser.avatar_public_url);
    }
    const image = await Cloudinary.uploader.upload(req.file.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };
    const upImage = await User.findOneAndUpdate({user_id: user_id}, {
      $set: {
        avatar: avatar.avatar,
        avatar_public_url: avatar.avatar_public_url
      }
    });
    // await upImage.save();
    return res.status(200).json({ message: "Image uploaded" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
};

// update user profile picture
const upLoadProofPic = async (req, res) => {
  try {
    // const user_id = req.auth.id;
    const image = await Cloudinary.uploader.upload(req.file.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };
    return res.status(200).json({ avatar });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
};

// update TRX wallet address
const updateTrxAddress = async (req, res) =>{
  try {
    const {trx_address} = req.body;
    const user_id = req.auth.id;
    if(!trx_address){
      res.status(400).json({message: "TRX address is missing"});
    }
    // find User
    const user = await User.findOneAndUpdate({user_id: user_id}, {
      $set: {
        wallet_address: trx_address
      }
    })
    // find wallet
    const wallet = await Wallet.findOneAndUpdate({user_id: user_id}, {
      $set: {
        wallet_address: trx_address
      }
    })
    if(wallet && user){
      res.status(200).json({message: "TRX address changed successfully"})
    }else{
      res.status(400).json({message: "Cannot change TRX address"})
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error.toString()
    })
  }
}

// Support ticket
const createSupportTicket = async (req, res) =>{
  try {
    const {purpose, previous_ticket_reff, question} = req.body;
    const user_id = req.auth.id;

    if(!req.body) res.status(400).json({
      message: "Please provide data",
    });
    if(!req.file?.path) res.status(400).json({
      message: "Image is missing",
    });
    if(!user_id) res.status(400).json({
      message: "User Id is missing",
    });
    if(!purpose) res.status(400).json({
      message: "Purpose is missing",
    });
    if(!previous_ticket_reff) res.status(400).json({
      message: "Previous refference is missing",
    });
    if(!question) res.status(400).json({
      message: "Question is missing",
    });

    // find user 
    const user = await User.findOne({user_id: user_id});

    // upload the image
    const image = await Cloudinary.uploader.upload(req.file?.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };

    if(user){
      // already have support tckect collection or not
      const existingSupport = await SupportTicket.findOne({user_id: user_id});
      if(!existingSupport){
        const newSupportTicket = await SupportTicket.create({
          user_id: user.user_id,
          user_name: user.name,
          history: [
            {
              user_id: user.user_id,
              email: user.email,
              mobile: user.mobile,
              purpose,
              previous_ticket_reff,
              image: avatar,
              question,
              date: new Date().toDateString(),
              time: getIstTime(),
            }
          ]
        });
        if(newSupportTicket){
          res.status(200).json({
            message: "Support ticket created successfully"
          })
        }else{
          res.status(400).json({
            message: "Cannot create support ticket"
          })
        }
      }else{
        // update existing support
        const updateSupport = await SupportTicket.findOneAndUpdate({user_id: user_id}, {
          $push: {
            history: {
              user_id: user.user_id,
              user_name: user.name,
              email: user.email,
              mobile: user.mobile,
              purpose,
              previous_ticket_reff,
              image: avatar,
              question,
              date: new Date().toDateString(),
              time: getIstTime(),
            }
          }
        });
        if(updateSupport){
          res.status(200).json({
            message: "Support ticket created successfully"
          })
        }else{
          res.status(400).json({
            message: "Cannot create support ticket"
          })
        }
      }
    }else{
      res.status(400).json({
        message: "Invalid user credentials"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error.toString()
    })
  }
}

// get support history
const getSupportHistory = async (req, res) =>{
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
  if (userId) {
    const supportTicket = await SupportTicket.findOne({ user_id: userId }).sort({"history.date": -1, "history.time": -1});
    if (supportTicket) {
      res.status(200).json(supportTicket);
    } else {
      res.status(400).json({
          message: "Cannot find support ticket",
      });
    }
  } else {
    res.status(400).json({
        message: "Cannot find user credentials",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// create contact us mesasge
const createContactUs = async (req, res)=>{
  try {
    const {message, name, user_id, email} = req.body;
    const userId = req.auth.id;
    const subject = "about tron";

    if(!req.body) res.status(400).json({
      message: "Please provide data",
    });
    if(!message) res.status(400).json({
      message: "Message is missing",
    });
    if(!name) res.status(400).json({
      message: "Name is missing",
    });
    if(!user_id) res.status(400).json({
      message: "User ID is missing",
    });
    if(!email) res.status(400).json({
      message: "Email is missing",
    });

    // find user 
    const user = await User.findOne({user_id: user_id});

    if(user && user_id === userId){
      // already have Contact collection or not
      const existingContact = await Contact.findOne({user_id: user_id});
      if(!existingContact){
        const newContact = await Contact.create({
          user_id: user.user_id,
          user_name: name,
          history: [
            {
              user_id: user.user_id,
              user_name: name,
              email,
              message,
              subject,
              date: new Date().toDateString(),
              time: getIstTime(),
            }
          ]
        });
        if(newContact){
          res.status(200).json({
            message: "Contact us message created successfully"
          })
        }else{
          res.status(400).json({
            message: "Cannot create contact us message"
          })
        }
      }else{
        // update existing support
        const updateContact = await Contact.findOneAndUpdate({user_id: user_id}, {
          $push: {
            history: {
              user_id: user.user_id,
              user_name: name,
              email,
              message,
              subject,
              date: new Date().toDateString(),
              time: getIstTime(),
            }
          }
        });
        if(updateContact){
          res.status(200).json({
            message: "Contact us message created successfully"
          })
        }else{
          res.status(400).json({
            message: "Cannot create contact us message"
          })
        }
      }
    }else{
      res.status(400).json({
        message: "Invalid user credentials"
      })
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// get contact us history
const getContactUsHistory = async (req, res) =>{
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
  if (userId) {
    const contactUs = await Contact.findOne({ user_id: userId }).sort({"history.date": -1, "history.time": -1});
    if (contactUs) {
      res.status(200).json(contactUs);
    } else {
      res.status(400).json({
          message: "Cannot find Contact us history",
      });
    }
  } else {
    res.status(400).json({
        message: "Cannot find user credentials",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// get updates
const getUpdates = async (req, res) =>{
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
  if (userId) {
    const updates = await Update.find({}).sort({date: -1});
    if (updates) {
      res.status(200).json(updates);
    } else {
      res.status(400).json({
          message: "Cannot find any updates",
      });
    }
  } else {
    res.status(400).json({
        message: "Cannot find user credentials",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// level income chart
const levelIncomeChart = async( req, res ) =>{
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
    if (userId) {
      const levelIncome = await LevelIncome.findOne({ user_id: userId }).sort({"level_income.date": 1});
      let levelIncomeDailyTotal = [];
      let levelIncomeDailyDate = [];
      for (let i = 0; i < 7; i++) {
        let date = new Date();
        let dailyIncome = 0;
        let week = date.setDate(date.getDate() - i);
        let specificDate = new Date(week).toDateString();
        for (let j = 0; j < levelIncome.level_income?.length; j++) {
          const checkingDate = new Date(levelIncome.level_income[j]?.date).toDateString();
          if (specificDate === checkingDate) {
            dailyIncome += levelIncome.level_income[j].amount;
          }
        }
        levelIncomeDailyTotal.push(parseFloat(dailyIncome.toFixed(3)));
        levelIncomeDailyDate.push(specificDate);
      }
      res.status(200).json({
        levelIncomeDailyTotal,
        levelIncomeDailyDate,
      })
    } else {
      res.status(400).json({
          message: "Cannot find user ID",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// roi income chart
const roiIncomeChart = async( req, res ) =>{
  try {
    const  userId = req.auth.id;
    if (userId) {
      const data = await Roi.find({ user_id: userId }).sort({"history.day": 1});
      let allRoiIncome = [];
      const roiIncomeHistory = data.map( w=> w.history.map(h=> allRoiIncome = [...allRoiIncome, h]));
      let roiIncomeDailyTotal = [];
      let roiIncomeDailyDate = [];
      for (let i = 0; i < 7; i++) {
        let date = new Date();
        let dailyIncome = 0;
        let week = date.setDate(date.getDate() - i);
        let specificDate = new Date(week).toDateString();
        for (let j = 0; j < allRoiIncome?.length; j++) {
          const checkingDate = new Date(allRoiIncome[i]?.day).toDateString();
          if (specificDate === checkingDate) {
            dailyIncome += parseFloat(allRoiIncome[j].amount);
          }
        }
        roiIncomeDailyTotal.push(parseFloat(dailyIncome.toFixed(3)));
        roiIncomeDailyDate.push(specificDate);
      }
      res.status(200).json({
        roiIncomeDailyTotal,
        roiIncomeDailyDate,
      })
    }
    else{
        res.status(400).json({
          message: "Invalid user ID"
        });
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

// reward income chart
const rewardIncomeChart = async( req, res ) =>{
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
  if (userId) {
    const rewardIncome = await Reward.findOne({ user_id: userId }).sort({"reward_income.date": 1});
    let rewardIncomeDailyTotal = [];
      let rewardIncomeDailyDate = [];
      for (let i = 0; i < 7; i++) {
        let date = new Date();
        let dailyIncome = 0;
        let week = date.setDate(date.getDate() - i);
        let specificDate = new Date(week).toDateString();
        for (let j = 0; j < rewardIncome.reward_income?.length; j++) {
          const checkingDate = new Date(rewardIncome.reward_income[j]?.date).toDateString();
          if (specificDate === checkingDate) {
            dailyIncome += parseFloat(rewardIncome.reward_income[j].amount);
          }
        }
        rewardIncomeDailyTotal.push(parseFloat(dailyIncome.toFixed(3)));
        rewardIncomeDailyDate.push(specificDate);
      }
      res.status(200).json({
        rewardIncomeDailyTotal,
        rewardIncomeDailyDate,
      })
  } else {
    res.status(400).json({
        message: "Cannot find user ID",
    });
  }
  } catch (error) {
    res.status(400).json({
      message: error.toString()
    })
  }
}

module.exports = {
  getUserInfo,
  updateUserInfo,
  getRefferalInfo,
  changePassword,
  updateEmail,
  changeTrxPassword,
  getLevelTeam,
  depositeAmount,
  depositeHistory,
  makeTopup,
  topupHistory,
  getWallet,
  withdrawAmount,
  withdrawHistory,
  getLevelIncome,
  getRewardIncome,
  fundTransfer,
  transferFundHistory,
  createRoi,
  getRoiData,
  updateProfilePic,
  upLoadProofPic,
  updateTrxAddress,
  createSupportTicket,
  getSupportHistory,
  createContactUs,
  getContactUsHistory,
  getUpdates,
  roiIncomeChart,
  levelIncomeChart,
  rewardIncomeChart,
};
