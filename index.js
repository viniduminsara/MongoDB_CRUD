const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const methodOverride = require('method-override');
const fs = require('fs');
const Product = require('./models/product');
const Supplier = require('./models/supplier');
const catchAsync = require('./util/catchAsync');
const ExpressError = require('./util/ExpressError');
const port = 3000;
const categories = ['fruit','vegetable','bakery','grocery'];

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

mongoose.connect('mongodb://127.0.0.1:27017/CRUD_demo')
    .then(() => {
        console.log('DB Connection Open!!!');
    })
    .catch(err => console.error('DB Connection Error!!!', err));

app.listen(port, () => {
    console.log('Listening on port 3000');
});

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.redirect('/products');
});

//products routes

app.get('/products', catchAsync(async(req, res) => {
    const selectedFilter = req.query.filter || 'All Products';
    let products;
    if(selectedFilter === 'All Products'){
        products = await Product.find();
    }else{
        products = await Product.find({category: selectedFilter});
    }
    res.render('products/index', {products, selectedFilter, categories, currentPage: 'Products'});
}));

app.get('/products/new', (req, res) => {
    res.render('products/new', { categories, currentPage: 'New Product' });
});

app.get('/products/:id/edit', catchAsync(async(req, res) => {
    const { id } = req.params;
    if(mongoose.Types.ObjectId.isValid(id)){
        const product = await Product.findById(id);
        res.render('products/edit', { product, categories, currentPage: 'Edit Product'});
    }else{
        res.render('products/notfound', {currentPage: '404 Not Found'});
    }
}));

app.put('/products/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    const { name, price, qty, category } = req.body;
    const product = await Product.findByIdAndUpdate(
        id,
        { name: name, price: price, qty: qty, category: category },
        { runValidators: true, new:true }
    );
    res.redirect(`/products/${product.id}`);
}));

app.delete('/products/:id', catchAsync(async(req, res) =>{
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
}));

app.get('/products/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    if(mongoose.Types.ObjectId.isValid(id)){
        const product = await Product.findById(id);
        res.render('products/view', { product, currentPage: product.name});
    }else{
        res.render('products/notfound', {currentPage: '404 Not Found'});
    }
}));

app.post('/products', upload.single('image'), catchAsync(async(req, res) => {
    // Access the uploaded file information through req.file
    const { name, price, qty, category } = req.body;
    const imagePath = req.file ? req.file.path : null;

    // Read the image file as binary data
    let imageBuffer = undefined;
    if(imagePath){
        imageBuffer = fs.readFileSync(imagePath);
    }

    const newProduct = new Product({
        name: name,
        price: price,
        qty: qty,
        category: category,
        image: {
            data: imageBuffer,
            contentType: 'image/jpeg'
        }
    }); 

    await newProduct.save();
    res.redirect(`/products/${newProduct.id}`);
}));

// supplier routes

app.get('/suppliers', async(req, res) => {
    const suppliers = await Supplier.find();
    res.render('suppliers/index', {suppliers, currentPage: 'Suppliers'});
});

// app.get('*', (req, res) => {
//     res.render('products/notfound', {currentPage: '404 Not Found'});
// });

app.use((err, req, res, next) => {
    const {message = 'Something went wrong', status = 500} = err;
    res.status(status).send(message);
});



