const Level = require("../models/levelModel");
const User = require("../models/userModel");

const updateLevel = async (person, user, levelnumber)=>{
    const update = await Level.updateOne({user_id: person?.user_id}, {
        $push: {
            level: {
                user: user._id,
                level: levelnumber,
                user_id: user.user_id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                sponsor_id: user.sponsor_id,
                joining_date: user.join_date,
                activation_date: user.topup_activation_date
            },
        },
    });
    await User.updateOne({user_id: person.user_id}, {
        $push: {
            team: person._id
        }
    });
}

module.exports = updateLevel;