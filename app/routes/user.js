'use strict';

const db = require('../db');
const User = db.userModel;
const Cart = db.cartModel;
const async = require('async');

const login = (req, res, next) => {
    async.waterfall([
        (callback) => {
            let newUser = new User();
            newUser.profileId = req.body.profileId;
            newUser.fullName = req.body.fullName;
            newUser.profilePic = req.body.profilePic;
            newUser.address = req.body.address;
            newUser.email = req.body.email;
            newUser.token = req.body.token;

            User.findOne({ profileId: req.body.profileId }, (err, user) => {
                if (err) return next(err);
                if (user) {
                    user.token = req.body.token;
                    user.save(function(err, user) {
                        if (err) return next(err);
                    });
                    res.json({ message: 'account already saved' });
                } else {
                    newUser.save(function(err, user) {
                        if (err) return next(err);
                        callback(null, user, res);
                    });
                }
            });
        },
        (user) => {
            let cart = new Cart();
            cart.owner = user._id;
            cart.save(function(err) {
                if (err) return next(err);
                res.json({ message: 'account successfully saved' });
            });
        }
    ]);
}

const findUser = (profileId) => {
    return User.findOne({ profileId: profileId }, (err, user) => {
        if (err) return next(err);
    });
}

const history = (req, res, next) => {
    return User.findOne({ profileId: req.body.profileId })
        .populate('history.items.item')
        .exec((err, user) => {
            if (err) res.json(err);
            res.json(user.history);
        });
}

module.exports = {
    login,
    history
}