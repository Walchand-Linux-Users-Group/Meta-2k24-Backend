const nodemailer = require('nodemailer')
require('dotenv').config()



const sendEmail = async (email, subject, text) => {
  try {
    let host, username, password, port

    switch (process.env.EVENT) {
      case "Meta":
        console.log("Sending email to "+ email + " for event " + process.env.EVENT)
        host = "server193.iseencloud.com"
        port = 465
        username = "meta@wcewlug.org"
        password = "eventemail@wcewlug"
        break;
      case "LinuxDiary":
        console.log("Sending email to "+ email + " for event " + process.env.EVENT)
        host = "server193.iseencloud.com"
        port = 465
        username = "linuxdiary@wcewlug.org"
        password = "eventemail@wcewlug"
        break;
      case "OSD":
        console.log("Sending email to "+ email + " for event " + process.env.EVENT)
        host = "server193.iseencloud.com"
        port = 465
        username = "linuxdiary@wcewlug.org"
        password = "eventemail@wcewlug"
        break;
      case "TechnoTweet":
        console.log("Sending email to "+ email + " for event " + process.env.EVENT)
        host = "server193.iseencloud.com"
        port = 465
        username = "technotweet@wcewlug.org"
        password = "eventemail@wcewlug"
        break;
      default: 
        host = "server193.iseencloud.com"
        port = 465
        username = "tux@wcewlug.org"
        password = "eventemail@wcewlug"
        break;
    }

    let transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: true,
      auth: {
        user: username,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: `WLUG <${username}>`,
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