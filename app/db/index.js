'use strict';

const config = require('../config');
const logger = require('../logger');
const Mongoose = require('mongoose').connect(config.dbURI);
const Schema = Mongoose.Schema;

//Log an error if the connection fails
Mongoose.connection.on('error', error => {
    logger.log('error', 'OPS, Mongoose connection error: ' + error);
})

//Create Schemas that defines the structure for storing user data
const userSchema = new Schema({
    profileId: String,
    fullName: String,
    profilePic: String,
    address: String,
    email: { type: String, unique: true, lowercase: true },
    history: [{
        id: String,
        amount: { type: Number, default: 0 },
        currency: String,
        items: [{
            item: { type: Schema.Types.ObjectId, ref: 'product' },
            quantity: { type: Number, default: 1 },
            price: { type: Number, default: 0 },
            paid: { type: Number, default: 0 }
        }],
        card: {
            brand: String,
            country: String,
            customer: String,
            exp_month: { type: Number, default: 0 },
            exp_year: { type: Number, default: 0 },
            funding: String,
            last4: String
        }
    }],
    token: String
});

const brewerySchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'user' },
    fullName: String,
    profilePic: String,
    backPic: String,
    address: String,
    email: { type: String, unique: true, lowercase: true },
    about: String,
    description: String,
    phoneNumber: Number,
    initDate: Date,
    site: String,
    facebook: String,
    rating: { type: Number, default: 0 },
    qtdRating: { type: Number, default: 0 },
    ratings: [
        { type: Number, default: 0 },
        { type: Number, default: 0 },
        { type: Number, default: 0 },
        { type: Number, default: 0 },
        { type: Number, default: 0 }
    ]
});

const categorySchema = new Schema({
    name: { type: String, unique: true, lowercase: true }
});

const cartSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'user' },
    total: { type: Number, default: 0 },
    items: [{
        item: { type: Schema.Types.ObjectId, ref: 'product' },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
    }]
});

// const mongoosastic = require('mongoosastic');

const productSchema = new Schema({
    brewery: { type: Schema.Types.ObjectId, ref: 'brewery' },
    category: { type: Schema.Types.ObjectId, ref: 'category' },
    name: String,
    description: String,
    price: Number,
    image: String,
    rating: { type: Number, default: 0 },
    qtdRating: { type: Number, default: 0 }
});

// ProductSchema.plugin(mongoosastic, {
//     hosts: [
//         'localhost:9200'
//     ]
// });

//Turn the Schema into a usable model
let userModel = Mongoose.model('user', userSchema);
let productModel = Mongoose.model('product', productSchema);
let cartModel = Mongoose.model('cart', cartSchema);
let categoryModel = Mongoose.model('category', categorySchema);
let breweryModel = Mongoose.model('brewery', brewerySchema);

module.exports = {
    Mongoose,
    userModel,
    productModel,
    cartModel,
    categoryModel,
    breweryModel
}