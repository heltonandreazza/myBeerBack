const db = require('../db');
const Category = db.categoryModel;
const async = require('async');

const createCategory = (req, res, next) => {
    let category = new Category();
    category.name = req.body.name;

    Category.findOne({ name: req.body.name }, function(err, category) {
        if (category) {
            res.json({ message: 'Category already exists' })
        }
    });

    category.save(function(err) {
        if (err) return next(err);
        res.json({ message: 'Successfully added a category' })
    });
}

const getCategory = (req, res, next) => {
    Category.findOne({ name: req.params.name }, function(err, category) {
        if (category) {
            res.json(category);
        } else {
            res.json({ message: 'Category not found' });
        }
    });
}

const getCategoryList = (req, res, next) => {
    Category.find({}, (err, categories) => {
        res.send(categories);
    });
}

const updateCategory = (req, res, next) => {
    async.waterfall([
        (callback) => {
            Category.findOne({ name: req.body.name }, function(err, category) {
                if (err) return next(err);
                callback(null, category);
            });
        },

        (category) => {
            category.name = req.body.newName;

            category.save();
            res.json(category);
        }
    ]);
};

module.exports = {
    createCategory,
    updateCategory,
    getCategory,
    getCategoryList
}