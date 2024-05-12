import express from "express";

import  AuthController  from "../controller/auth.controller.js";

const router = express.Router();

router.post("/login", AuthController.authenticate.bind(AuthController));
router.post("/register", AuthController.create.bind(AuthController));
router.get("/validate/:token", AuthController.validate.bind(AuthController));
router.post("/reset_password/:id", AuthController.resetPassword.bind(AuthController));
router.post("/change_password", AuthController.changePassword.bind(AuthController));
router.post("/resend_mail", AuthController.resendMail.bind(AuthController));
router.get("/logout", AuthController.logout.bind(AuthController));
router.get("/check_auth", AuthController.checkAuth.bind(AuthController));

export default router;