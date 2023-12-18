const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    qty: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['fruit','vegetable','bakery','grocery']
    },
    image: {
        data: Buffer, // Binary image data
        contentType: String // Mime type of the image (e.g., 'image/jpeg')
    },
    supplier: {
        type: mongoose.Types.ObjectId,
        ref: 'Supplier'
    }

});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;