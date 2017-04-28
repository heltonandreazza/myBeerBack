'use strict';

const db = require('../db');
const Category = db.categoryModel;
const Brewery = db.breweryModel;
const Product = db.productModel;
const async = require('async');

const getProduct = (req, res, next) => {
    Product.findOne({ _id: req.params.id })
        .populate('category')
        .populate('brewery')
        .exec((err, product) => {
            console.log(product)
            if (err) return next(err);
            res.json(product);
        });
}

const searchProduct = (req, res, next) => {
    Product.find({
        name: { "$regex": req.body.search_term, "$options": "i" }
    }, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
}

const getBreweryProducts = (req, res, next) => {
    Product.find({
            brewery: req.params.id
        })
        .populate('category')
        .exec((err, results) => {
            if (err) return next(err);
            res.json(results);
        });
}

const createProduct = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Brewery.findOne({ fullName: req.body.brewery.fullName }, function(err, brewery) {
                if (err) return next(err);
                if (brewery) {
                    callback(null, brewery);
                } else {
                    res.send({ message: 'brewery not found' });
                }
            });
        },
        (brewery, callback) => {
            Category.findOne({ name: req.body.category.name }, function(err, category) {
                if (err) return next(err);
                if (category) {
                    callback(null, brewery, category);
                } else {
                    res.send({ message: 'category not found' });
                }
            });
        },
        (brewery, category) => {
            Product.findOne({ name: req.body.name }, function(err, product) {
                if (err) return next(err);
                if (!product) {
                    var product = new Product();
                    product.brewery = brewery._id;
                    product.category = category._id;
                    product.name = req.body.name;
                    product.description = req.body.description;
                    product.price = req.body.price;
                    product.image = req.body.image;

                    product.save();
                    res.json(product);
                } else {
                    res.json({ message: 'product already exists with this name' });
                }
            });

        }
    ]);
}

const updateProduct = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Product.findOne({ _id: req.body._id }, function(err, product) {
                if (err) return next(err);
                if (!product) {
                    res.json({ message: 'product not found' });
                    return next();
                } else {
                    callback(null, product);
                }
            });
        },

        (product) => {
            Category.findOne({ _id: product.category._id }, function(err, category) {
                if (err) return next(err);
                if (!category) {
                    res.json({ message: 'category not found' });
                    return next();
                } else {
                    callback(null, category, product);
                }
            });
        },

        (category, product) => {
            product._id = req._id;
            product.category = category._id;
            product.name = req.body.name;
            product.description = req.body.description;
            product.price = req.body.price;
            product.image = req.body.image;

            product.save();
            res.json(product);
        }
    ]);
};

const rate = (req, res, next) => {
    console.log(req.body._id);
    Product.findOne({ _id: req.body._id }, function(err, product) {
        if (err) return next(err);
        if (!product) {
            res.json({ message: 'product not found' });
        } else {
            //update
            product.qtdRating = product.qtdRating + 1;
            product.rating = ((product.rating + req.body.rating) / 2).toFixed(1);

            product.save();
            res.json(product);
        }
    });
}

module.exports = {
    getProduct,
    searchProduct,
    createProduct,
    updateProduct,
    rate,
    getBreweryProducts
}