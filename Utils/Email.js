const nodemailer = require('nodemailer')
const pug = require('pug')
const htmltotext = require('html-to-text')
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0],
            this.url = url
        this.from = `Shubham <${process.env.EMAIL_FROM}>`


    }
    NewTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }

            })
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
            //activate less secure app option

        })

    }

    async send(template, subject) {
        //send the actual email

        //1)render pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })

        //2)define email options

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmltotext.fromString(html),
            // html:
        }

        //create a transport and send email

        //await transporter.sendMail(mailOptions)
        await this.NewTransport().sendMail(mailOptions)


    }

    //type of email we wanna send
    async sendWelcome() {
        await this.send('Welcome', 'Welcome To our website')
    }

    async sendPassRest() {
        await this.send('resetPass', 'Forgot Your Password Reset Here')
    }
}


