import express from "express";

import  AuthController  from "../controller/auth.controller.js";

const router = express.Router();

router.post("/login", AuthController.authenticate.bind(AuthController));
router.post("/register", AuthController.create.bind(AuthController));

export default router;