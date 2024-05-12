import {
    staffPage,
    isAdmin,
    getEditStaff,
    updateStaff,
    createStaff,
    defaultPassword,
    resendMail,
    deleteStaff,
    lockStaff,
    unlockStaff
} from "../controller/staff.controller.js";
import express from "express";

const router = express.Router();

router.get("/", isAdmin, staffPage);
router.post("/resend_mail", resendMail);
router.post("/create", createStaff);
router.get("/edit/:id", getEditStaff);
router.post("/update/:id", updateStaff);
router.get("/default_password/:id", defaultPassword);
router.get("/delete/:id", deleteStaff);
router.get("/lock/:id", lockStaff);
router.get("/unlock/:id", unlockStaff);

export default router;