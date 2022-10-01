const nodemailer = require('nodemailer');

const sendOtpMail = (email, otp)=>{
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
        subject: 'OTP Code',
        html: `<div>
            <p>Here is your OTP code: ${otp}</p>
            <br />
            <p>Regards,</p>
            <p><a href="http://tronlive.club/">Tronlive.club</a></p>
        </div>`
    };

    transpoter.sendMail(mailOption, async (error, info)=>{
        if(error){
            console.log(error);
        }else{
            console.log("Email sent: " + info.response);
        }
    });
}

module.exports = sendOtpMail;