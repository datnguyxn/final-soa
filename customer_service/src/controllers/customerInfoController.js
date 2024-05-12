const Customer = require("../models/customer");
const axios = require("axios");
const moment = require("moment");

const createShippingInfo = async (req, res) => {
    const {fullname, phone, address, customer_id} = req.body;
    const customer = await Customer.findById(customer_id).exec();
    if (customer) {
        customer.shippingInfo.push({
            fullname,
            phone,
            address,
        });
        await customer.save();
    }
    res.json({success: true});
};


const getShippingInfo = async (req, res) => {
    const customer_id = req.body.customer_id || req.query.customer_id || req.params.customer_id;
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

const getCustomer = async (req, res) => {
    const customer = await Customer.find({}).exec();
    if (customer) {
        res.json(customer);
    } else {
        res.json({});
    }
}

const searchCustomer = async (req, res) => {
    const payload = req.query
    let search = await Customer.find({
        phone: {$regex: new RegExp(payload)},
    }).exec();
    search = search.slice(0, 5);
    if (search) {
        res.json(search);
    } else {
        res.json({});
    }
}


const getAllCustomers = async () => {
    try {
        const customers = await Customer.find().exec();
        const plainCustomers = customers.map((customer) => ({
            ...customer.toJSON(),
        }));
        return plainCustomers;
    } catch (err) {
        throw err
    }
};
const createCustomer = async (req, res) => {
    const {name, phone} = req.body;
    try {

        const find = await Customer.findOne({phone: phone})
        if (!find) {
            const newCustomer = new Customer({
                name,
                phone,
            });
            const savedCustomer = await newCustomer.save();
            console.log(savedCustomer)
            res.json({success: true, customer: savedCustomer});
        } else {
            res.json({success: false, customer: find});
        }

    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
};

const getCustomers = async (req, res) => {
    try {
        let {page, pageSize, search} = req.query;

        // Set default values if not provided
        page = page ? parseInt(page, 10) : 1;
        pageSize = pageSize ? parseInt(pageSize, 10) : 10;

        // Create a MongoDB query object based on search criteria
        const query = {};
        if (search) {
            query.name = {$regex: new RegExp(search, "i")}; // Case-insensitive search on the 'name' field
        }

        // Fetch products with pagination and search
        const customers = await Customer.find(query)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec();

        const totalCustomers = await Customer.countDocuments(query);

        const totalPages = Math.ceil(totalCustomers / pageSize);

        const pagination = {
            pages: Array.from({length: totalPages}, (_, i) => ({
                page: i + 1,
                isCurrent: i + 1 === page,
            })),
            pageSize,
            currentPage: page,
            totalCustomers,
        };

        // Include information about the previous and next pages
        if (page > 1) {
            pagination.prevPage = page - 1;
        }

        if (page < totalPages) {
            pagination.nextPage = page + 1;
        }

        const plainCustomers = customers.map((customer) => ({
            ...customer.toJSON(),
        }));
        res.status(200).json({
            customers: plainCustomers,
            totalPages,
            search,
            pagination
        });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const customerDetail = async (req, res) => {
    try {
        const name = req.query.name;
        let order = await axios.get("http://localhost:3458/api/order/order-of-customer?name=" + name);
        let product = await axios.get("http://localhost:3456/api/product/getProductWithOutId");

        order = order.data;
        product = product.data;

        const plainOrder = order.map((order) => ({
            ...order,
            created: moment(order.created).format("DD/MM/YYYY HH:mm:ss"),
        }));

        var _name

        var detail = []
        plainOrder.forEach(element => {
            var pro = []

            var countPd = 0
            _name = element.customer_name,
                element.products.forEach(idPd => {
                    pro.push({
                        product_name: idPd.product_name,
                        product_id: idPd.product_id,
                        quantity: idPd.quantity,
                        discount: element.discount,
                        unit_price: formatCurrency(idPd.unit_price),
                        total_price: formatCurrency(idPd.total_price * (100 - element.discount) / 100),
                        _id: idPd._id
                    })
                    product.forEach(pro => {
                        if (String(idPd.product_id) === String(pro._id)) {
                            countPd += idPd.quantity
                        }
                    });
                });
            detail.push({
                countPd: countPd,
                _id: element._id,
                total_amount: formatCurrency(element.total_amount),
                amount_given: formatCurrency(element.amount_given),
                change_given: formatCurrency(element.change_given),
                created: element.created,
                products: pro,
                order_type: element.order_type
            })
        });
        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }
        res.status(200).json({
            detail,
            _name
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message});
    }
}
const formatCurrency = (amount) => {
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
    return formattedAmount;
};

const updateCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(req.body.address)
        const updateCustomer = await Customer.findByIdAndUpdate(id, {
                name: req.body.nameCt,
                phone: req.body.phone,
                address: req.body.address,
            }, { new: true }
        ).exec();
        if (!updateCustomer) {
            throw new Error("Customer not found");
        }
        res.status(200).json(updateCustomer);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedCustomer = await Customer.findByIdAndDelete(id).exec();
        if (!deletedCustomer) {
            throw new Error("Customer not found");
        }
        res.status(200).json(deletedCustomer);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

module.exports = {
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
};