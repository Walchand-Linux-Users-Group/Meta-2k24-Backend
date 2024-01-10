const nodemailer = require('nodemailer')
require('dotenv').config()



const sendEmail = async (email, subject, text) => {
    try {
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL, 
            pass: process.env.EMAIL_APPKEY,  
          },
        });
      await transporter.sendMail({
        from: `WLUG <${process.env.EMAIL}>`,
        to: email,
        subject: subject,
        html: text,
      });
      console.log("Email Sent Sucessfully");
    } catch (error) {
      console.log("Email Not Sent");
      console.log(error);
    }
  };

module.exports = sendEmail