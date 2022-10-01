const nodemailer = require('nodemailer');

const sendMessageEmail = (name, user_id, email, message, subject, mobile)=>{
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

    let messageBody = `<div>
        <p>${message}</p>
        <br />
        <p>${name}</p>
        <p>${email}</p>
        <p>${user_id}</p>
        <p>${mobile}</p>
    </div>`

    let mailOption = {
        from: email,
        to: "support@tronlive.club",
        subject: subject,
        html: messageBody
    };

    transpoter.sendMail(mailOption, async (error, info)=>{
        if(error){
            console.log(error);
        }else{
            console.log("Email sent: " + info.response);
        }
    });
}

module.exports = sendMessageEmail;