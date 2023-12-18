const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    products: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Product'
        }
    ]

});

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;