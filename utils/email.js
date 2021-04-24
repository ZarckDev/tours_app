const nodemailer = require('nodemailer');
const pug = require('pug')
const { htmlToText } = require('html-to-text')


// new Email(user, url).sendWelcome() // user contain email and name 

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0]; // only first name
        this.url = url;
        this.from = `${process.env.EMAIL_FROM}`
    }

    newTransport() { // logic of transport here
        if(process.env.NODE_ENV === 'production'){
            // Sendgrid -- already predefined in nodemailer
            return nodemailer.createTransport({ 
                service: 'SendGrid', // nodemailer already know the host and port
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        // otherwise we use mailtrap.io for dev !!!
        return nodemailer.createTransport({ 
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        // Send the actual email
        // 1) render HTML for the email based on pug template
        // PUG to real HTML
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName: this.firstName,
            url: this.url,
            subject
        }) 

        // 2) Define email options
        const mailOptions = {
            from: this.from, // sender address
            to: this.to, // list of receivers
            subject: subject, // Subject line
            html: html,
            text: htmlToText(html), // plain text body -- important for spam folders and email clients -- convert html to text content using Package html-to-text
        }

        // 3) create a transport and send email 
        await this.newTransport().sendMail(mailOptions) // asynchronous function so async/await
    }

    async sendWelcome() {
        // welcome is the pug file
        await this.send('welcome', 'Welcome to the Tours Family!') // async function
    }

    async sendPasswordReset() {
        // passwordReset is the pug file
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)')
    }
}


