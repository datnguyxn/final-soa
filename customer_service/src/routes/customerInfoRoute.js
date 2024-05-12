const express = require("express");
const router = express.Router();

const {
    createShippingInfo,
    getShippingInfo,
    getCustometById,
    getCustomer,
    getAllCustomers,
    searchCustomer,
    createCustomer,
    getCustomers,
    customerDetail,
    updateCustomer,
    deleteCustomer
} = require("../controllers/customerInfoController");

router.get("/get-customers", getCustomers)
router.post("/create-shipping-info", createShippingInfo);
router.get("/get-shipping-info", getShippingInfo);
router.get("/get-customer", getCustomer)
router.get("/get-all-customers", getAllCustomers)
router.get("/search-customer", searchCustomer)
router.post("/create-customer", createCustomer)
router.get("/get-customer-by-id", getCustometById)
router.get("/customer-detail", customerDetail)
router.post("/update-customer/:id", updateCustomer)
router.get("/delete-customer/:id", deleteCustomer)

module.exports = router