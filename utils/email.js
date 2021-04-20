const nodemailer = require('nodemailer')


const sendEmail = async options => {

    // 1) Create a transporter (service that will send the email -- SMTP transport)
    const transporter = nodemailer.createTransport({ // we use mailtrap.io for dev !!!
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    // const transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    //     auth: {
    //         user: process.env.EMAIL_USERNAME,
    //         pass: process.env.EMAIL_PASWWORD
    //     }
    //     // Activate in Gmail the "less secure app" option
    //     // We are not using Gmail in this application, because not a good idea for real production app 
    // })

    // let transporter = nodemailer.createTransport({
    //     host: "smtp.ethereal.email",
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //       user: testAccount.user, // generated ethereal user
    //       pass: testAccount.pass, // generated ethereal password
    //     },
    //   });


    // 2) Define the email options
    const mailOptions = {
        from: '"admin 👻" <admin@jonas.io>', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body
        // html: "<b>Hello world?</b>", // html body
    }

    // 3) Actually send the email
    let info = await transporter.sendMail(mailOptions) // asynchronous function so async/await

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

module.exports = sendEmail;