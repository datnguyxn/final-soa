import express from "express";

import {
    getAllOrder
} from "../controller/order.controller.js";

const router = express.Router();

router.get("/", getAllOrder);

export default router;