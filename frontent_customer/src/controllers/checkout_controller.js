const axios = require("axios");
const { recompileSchema } = require("../../../order_service/src/models/order");
const { param } = require("../routes/checkout_route");
let name, customer_id, email;
const getPage = async (req, res) => {
  if (!req.session.customer) {
    return res.redirect("/auth");
  }
  name = req.session.customer.name;
  customer_id = req.session.customer._id;
  email = req.session.customer.email;
  const resShippingInfo = await axios.get(
    "http://localhost:3457/api/customer-info/get-shipping-info",
    {
      params: {
        customer_id: req.session.customer._id,
      },
    }
  );
  const shippingInfo = resShippingInfo.data;

  const resCart = await axios.get("http://localhost:3456/api/cart", {
    params: {
      customerId: req.session.customer._id,
    },
  });
  const carts = resCart.data.carts;
  const totalAmount = resCart.data.totalAmount;

  res.render("checkout", {
    shippingInfo,
    carts,
    totalAmount,
    name,
    customer_id,
    email,
  });
};

const createShippingInfo = async (req, res) => {
  const { fullname, phone, address } = req.body;
  const response = await axios.post(
    "http://localhost:3457/api/customer-info/create-shipping-info",
    {
      fullname,
      phone,
      address,
      customer_id: req.session.customer._id,
    }
  );
  if (response.data.success) {
    res.json({ success: true });
  }
};

const callApiIpnMoMo = async (req, res) => {
  const response = await axios.post(
    "http://localhost:3459/api/payment/ipn-momo",
    {
      resultCode: req.body.resultCode,
      message: req.body.message,
      amount: req.body.amount,
      transId: req.body.transId,
      customer_id: customer_id,
      customer_name: name,
      email: email,
    }
  );
  if (response.data.success) {
    res.json({ success: true });
  }
};

const getMomoReturnPage = async (req, res) => {
  const response = await axios.get(
    "http://localhost:3459/api/payment/momo_return"
  );
  console.log(response.data);
  res.render("success", {
    order: response.data.order,
    message: response.data.message,
    name,
    receiverInfo: response.data.receiverInfo,
  });
};

const getVnPayReturnPage = async (req, res) => {
  const name = req.session.customer.name;
  const customer_id = req.session.customer._id;
  const email = req.session.customer.email;
  req.query = {
    ...req.query,
    customer_id,
    name,
    email,
  };
  const response = await axios.get(
    "http://localhost:3459/api/payment/vnpay_return",
    {
      params: req.query,
    }
  );
  console.log(response.data);
  res.render("success", {
    order: response.data.order,
    message: response.data.message,
    name,
    receiverInfo: response.data.receiverInfo,
    code: response.data.code,
  });
};

let order_cod, receiverInfo_cod;

const getCodReturnPay = async (req, res) => {
  const {
    amount,
    receiverInfo,
    products,
    deliveryInfo,
  } = req.body;
  console.log(req.body);
  const response = await axios.post(
    "http://localhost:3459/api/payment/payment-cod",
     {
      amount,
      receiverInfo,
      products,
      deliveryInfo,
      name,
      customer_id,
      email,
     }
  );
  console.log(response.data);
  order_cod = response.data.order;
  receiverInfo_cod = response.data.receiverInfo;
  res.json({ success: true });
};

const getCodReturn = async (req, res) => {
  res.render("success", {
    order: order_cod,
    name,
    msg:"ĐÃ HOÀN THÀNH",
    receiverInfo: receiverInfo_cod,
  });
}

module.exports = {
  getPage,
  createShippingInfo,
  callApiIpnMoMo,
  getMomoReturnPage,
  getVnPayReturnPage,
  getCodReturnPay,
  getCodReturn
};
