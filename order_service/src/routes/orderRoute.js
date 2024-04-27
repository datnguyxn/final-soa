const express = require("express");
const router = express.Router();

const {
  getOrderOfUser,
  getOrderByOrderId,
  createOrder,
  createOrderGHN,
  cancelOrder,
  getAllOrder,
  changeOrderStatus,
  updateOrderStatusWithGHN,
  downloadInvoiceInWeb,
  downloadInvoiceInPos
} = require("../controllers/orderController");

router.get("/order-of-user", getOrderOfUser);
router.post("/getOrder", getOrderByOrderId);
router.post("/create-order", createOrder);
router.post("/create-order-ghn", createOrderGHN);
router.post("/cancel-order", cancelOrder);
router.get("/all-order", getAllOrder);
router.put("/change-order-status", changeOrderStatus);
router.post("/update-order-status-ghn", updateOrderStatusWithGHN);
router.get("/dow-invoice-web/:orderId", downloadInvoiceInWeb);
router.get("/dow-invoice-pos/:orderId", downloadInvoiceInPos);
module.exports = router;
