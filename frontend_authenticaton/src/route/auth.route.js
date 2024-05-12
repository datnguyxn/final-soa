import express from "express";
import { login, sendData } from "../controller/auth.controller.js";

const router = express.Router();

router.post('/login', login);
router.get('/sendData', sendData);

export default router;