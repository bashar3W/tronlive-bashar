const nodemailer = require('nodemailer');

const sendForgotPasswordMail = (email, token)=>{
    const reset_password_url = `https://tronlive.club/resetpassword/${token}`
    let transpoter = nodemailer.createTransport({
        service: 'Gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "support@tronlive.club",
            pass: "uzslirubhlprwfcq"
        }
    });

    let mailOption = {
        from: "support@tronlive.club",
        to: email,
        subject: 'Forgot Password',
        text: `Go to this link to reset password ${reset_password_url}`
    };

    transpoter.sendMail(mailOption, async (error, info)=>{
        if(error){
            console.log(error);
        }else{
            console.log("Email sent: " + info.response);
        }
    });
}

module.exports = sendForgotPasswordMail;