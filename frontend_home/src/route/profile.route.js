import express from "express";
import {
    index,
    getEditProfile,
    updateProfile,
    getChangePassword,
    changePassword
} from "../controller/proflie.controller.js";

const router = express.Router();

router.get("/", index);
router.get("/edit/:id", getEditProfile);
router.post("/update/:id", updateProfile);
router.get("/get_change_password/:id", getChangePassword);
router.post("/change_password/:id", changePassword);

export default router;