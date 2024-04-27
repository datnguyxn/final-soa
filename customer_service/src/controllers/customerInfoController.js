const Customer = require("../models/customer");

const createShippingInfo = async (req, res) => {
    const { fullname, phone, address, customer_id } = req.body;
    const customer = await Customer.findById(customer_id).exec();
    if (customer) {
      customer.shippingInfo.push({
        fullname,
        phone,
        address,
      });
      await customer.save();
    }
    res.json({ success: true });
  };


const getShippingInfo = async (req, res) => {
    const customer_id  = req.body.customer_id || req.query.customer_id || req.params.customer_id;
    const customer = await Customer.findById(customer_id).exec();
    if (customer) {
      res.json(customer.shippingInfo);
    } else {
      res.json([]);
    }
  };

const getCustometById = async (req, res) => {
    const customer_id = req.body.customer_id || req.query.customer_id || req.params.customer_id;
    const customer = await Customer.findById(customer_id).exec();
    if (customer) {
      res.json(customer);
    } else {
      res.json({});
    }
}

module.exports = { createShippingInfo, getShippingInfo, getCustometById};