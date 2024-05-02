import express from "express";

import EmailController from "../controller/email.controller.js";

const router = express.Router();

router.post("/send_email", EmailController.sendEmail.bind(EmailController));

export default router;