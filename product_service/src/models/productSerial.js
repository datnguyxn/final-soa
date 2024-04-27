const mongoose = require("mongoose");

const productSerialSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
});

module.exports = mongoose.model("ProductSerial", productSerialSchema);