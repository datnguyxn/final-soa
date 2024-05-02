import nodemailer from 'nodemailer';
import path from "path";
import variables from "../config/variables.js";
import ejs from 'ejs';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: variables.EMAIL_HOST,
    port: variables.EMAIL_PORT,
    secure: true,
    auth: {
        user: variables.EMAIL_USER,
        pass: variables.EMAIL_PASS
    }
})
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Ready for send emails');
    }
})

async function sendMail(options) {
    const {email, subject, message, template, context} = options;
    const templatePath = path.join(process.cwd(), 'src', 'view', `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, context)
    const mailOptions = {
        from: '"' + "POS" + '"' + "<" + variables.EMAIL_USER + ">",
        to: email,
        subject: subject,
        html: html
    }
    await transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent: ' + info.response);
            return info
        }
    })
}

export {
    sendMail
};