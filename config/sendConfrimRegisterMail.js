const nodemailer = require("nodemailer");

const sendConfrimRegistrationMail = (user, initialTrx, userId) => {
  let transpoter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "support@tronlive.club",
      pass: "uzslirubhlprwfcq"
    },
  });

  let mailOption = {
    from: "support@tronlive.club",
    to: user.email,
    subject: "Successfully registered",
    text: `Hello! ${user.name}
            Here is you user information - 
            Full Name: ${user.name}
            user ID: ${userId}
            Sponsor ID: ${user.sponsor_id}
            Sponsor Name: ${user.sponsor_name}
            Mobile: ${user.mobile}
            Email: ${user.email}
            Transaction Password: ${initialTrx}`,
    html: `<div">
              <img src="https://i.ibb.co/KNhptn8/tronlive-Confirmation-header.png" alt="logo" />
              <h1 style="text-align: center;">Welcome to <a href="http://tronlive.club/">tronlive.club</a></h1>
              <div  style="padding: 0 60px; width: 100%;">
                    <h2>Hello! ${user.name},</h2>
                    <p style="text-align: left;">Here is you ID information - </p>
                        <p style="text-align: left; margin-left: 20px">Full Name: ${user.name}</p>
                        <p style="text-align: left; margin-left: 20px">user ID: ${user.user_id}</p>
                        <p style="text-align: left; margin-left: 20px">Sponsor ID: ${user.sponsor_id}</p>
                        <p style="text-align: left; margin-left: 20px">Sponsor Name: ${user.sponsor_name}</p>
                        <p style="text-align: left; margin-left: 20px">Mobile: ${user.mobile}</p>
                        <p style="text-align: left; margin-left: 20px">Email: ${user.email}</p>
                        <p style="text-align: left; margin-left: 20px">Transaction Password: ${initialTrx}</p>        
              </div>
          </div>`,
  };

  transpoter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendConfrimRegistrationMail;
