import express from "express";
import {
    getReport,
    reportDetail,
    getOrderOfWeek,
    getAmountOfWeek
} from "../controller/report.controller.js";

const router = express.Router();

router.get("/", getReport);
router.post("/reportDetail", reportDetail);
router.get("/getOrderOfWeek", getOrderOfWeek)
router.get("/getAmountOfWeek", getAmountOfWeek)

export default router;