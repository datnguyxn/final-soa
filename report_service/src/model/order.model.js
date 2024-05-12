import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    customer_name: {
        type: String,
        ref: 'Customer',
        default: null,
    },
    staff_name: {
        type: String,
        ref: 'User',
        default: null,
    },
    order_code_GHN: {type: String},
    transIdPay: {type: String},
    products: [
        {
            product_name: {
                type: String,
                ref: 'Product',
            },
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            capacity: String,
            color: String,
            quantity: Number,
            unit_price: Number,
            total_price: Number,
        },
    ],
    total_amount: Number,
    amount_given: { type: Number, default: null },
    change_given: { type: Number, default: null },
    discount: { type: Number, default: null},
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
    payment_method: {
        type: String,
    },
    receiver_info: {
        type: String,
        default: null,
    },
    order_type: {
        type: String,
        enum: ['web', 'pos'],
    },
    order_status: {
        type: String,
        enum: ['processing', 'shipped', 'waiting_to_return','completed', 'canceled', 'returning', 'return', 'storing'],
    },
    emailSent: { type: Boolean, default: false },
    vnp_TxnRef:{type: String},
    vnp_date : {type: String},
});
const Order = mongoose.model('Order', orderSchema);

export default Order;