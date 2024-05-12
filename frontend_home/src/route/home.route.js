import express from "express";
import HomeController from "../controller/home.controller.js";
const router = express.Router();

router.get("/", HomeController.index.bind(HomeController));

export default router;

