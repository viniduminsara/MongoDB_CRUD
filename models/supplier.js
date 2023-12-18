const mongoose = require('mongoose');
const Product = require('./product');

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

supplierSchema.post('findOneAndDelete', async function(supplier) {
    if(supplier.products.length){
        await Product.deleteMany({id: {$in: supplier.products}});
    }
});

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;