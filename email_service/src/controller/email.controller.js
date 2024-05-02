import {sendMail} from '../service/email.service.js';

class EmailController {
    async sendEmail(req, res) {
        console.log("send email")
        console.log(req.body)
        const { email, subject, message, template, context } = req.body;
        try {
            await sendMail({ email, subject, message, template, context });
            return res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new EmailController();