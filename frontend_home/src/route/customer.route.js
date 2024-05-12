import {
    getCustomer,
    getCustomerById,
    getEditCustomer,
    updateCustomer,
    deleteCustomer
} from "../controller/customer.controller.js";
import express from "express";

const router = express.Router();

router.get("/", getCustomer);
router.get("/customerDetail", getCustomerById);
router.get("/edit/:id", getEditCustomer);
router.post("/update/:id", updateCustomer);
router.get("/delete/:id", deleteCustomer);

export default router;