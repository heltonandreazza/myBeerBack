const db = require('../db');
const User = db.userModel;
const Cart = db.cartModel;
const async = require('async');

const addToCart = (req, res, next) => {
    async.waterfall([
        (callback) => {
            console.log(req.body.profileId);
            User.findOne({ profileId: req.body.profileId }, (err, user) => {
                if (err) return next(err);
                if (user) {
                    callback(null, user);
                } else {
                    res.json({ message: 'user not found' });
                }
            });
        },
        (user, callback) => {
            Cart.findOne({ owner: user._id }, function(err, cart) {
                if (err) return next(err);
                if (cart) {
                    callback(null, cart);
                } else {
                    res.json({ message: 'cart not found' });
                }
            })
        },
        (cart) => {

            let item = cart.items.find(o => o.item == req.body._id);
            console.log(item);
            if (!item) {
                cart.items.push({
                    item: req.body._id,
                    price: parseFloat(req.body.price),
                    quantity: parseInt(req.body.quantity)
                });
            } else {
                item.quantity = item.quantity + req.body.quantity;
            }

            cart.total = cart.items.map(i => i.price * i.quantity).reduce((a, b) => a + b, 0).toFixed(2);

            cart.save(function(err) {
                if (err) return next(err);
                return res.json(cart);
            });
        }
    ]);
}

const plusOne = (req, res, next) => {
    async.waterfall([
        (callback) => {
            User.findOne({ profileId: req.body.profileId }, (err, user) => {
                if (err) return next(err);
                if (user) {
                    callback(null, user);
                } else {
                    res.json({ message: 'user not found' });
                }
            });
        },
        (user, callback) => {
            Cart.findOne({ owner: user._id }, function(err, cart) {
                if (err) return next(err);
                if (cart) {
                    callback(null, cart);
                } else {
                    res.json({ message: 'cart not found' });
                }
            })
        },
        (cart) => {
            console.log(req.body._id)
            let item = cart.items.find(o => o.item == req.body._id);
            if (item) {
                item.quantity = item.quantity + 1;

                cart.total = cart.items.map(i => i.price * i.quantity).reduce((a, b) => a + b, 0).toFixed(2);
                cart.save(function(err) {
                    if (err) return next(err);
                    return res.json(cart);
                });
            } else {
                res.json({ message: 'was not possible to plus one' });
            }

        }
    ]);
}

const minusOne = (req, res, next) => {
    async.waterfall([
        (callback) => {
            User.findOne({ profileId: req.body.profileId }, (err, user) => {
                if (err) return next(err);
                if (user) {
                    callback(null, user);
                } else {
                    res.json({ message: 'user not found' });
                }
            });
        },
        (user, callback) => {
            Cart.findOne({ owner: user._id }, function(err, cart) {
                if (err) return next(err);
                if (cart) {
                    callback(null, cart);
                } else {
                    res.json({ message: 'cart not found' });
                }
            })
        },
        (cart) => {
            console.log(req.body._id)
            let item = cart.items.find(o => o.item == req.body._id);
            if (item) {
                if (item.quantity > 1) {
                    item.quantity = item.quantity - 1;

                    cart.total = cart.items.map(i => i.price * i.quantity).reduce((a, b) => a + b, 0).toFixed(2);

                    cart.save(function(err) {
                        if (err) return next(err);
                        return res.json(cart);
                    });
                }
            } else {
                res.json({ message: 'was not possible to minus one' });
            }

        }
    ]);
}

const removeFromCart = (req, res, next) => {
    async.waterfall([
        (callback) => {
            User.findOne({ profileId: req.body.profileId }, (err, user) => {
                if (err) return next(err);
                if (user) {
                    callback(null, user);
                } else {
                    res.json({ message: 'user not found' });
                }
            });
        },
        (user, callback) => {
            Cart.findOne({ owner: user._id }, function(err, cart) {
                if (err) return next(err);
                if (cart) {
                    callback(null, cart);
                } else {
                    res.json({ message: 'cart not found' });
                }
            })
        },
        (cart) => {
            console.log(req.body._id)
            let item = cart.items.pop(String(req.body.item));
            if (item) {
                cart.total = cart.items.map(i => i.price * i.quantity).reduce((a, b) => a + b, 0).toFixed(2);
                cart.save(function(err, found) {
                    if (err) return next(err);
                    res.json(cart);
                });
            } else {
                res.json({ message: 'item not found' });
            }
        }
    ]);
}

const getCartItems = (req, res, next) => {
    async.waterfall([
        (callback) => {
            User.findOne({ profileId: req.params.id }, (err, user) => {
                if (err) return next(err);
                if (user) {
                    callback(null, user);
                } else {
                    res.json({ message: 'user not found' });
                }
            });
        },
        (user) => {
            Cart
                .findOne({ owner: user._id })
                .populate('items.item')
                .exec(function(err, foundCart) {
                    if (err) return next(err);
                    res.json(foundCart);
                });
        }
    ])
}

module.exports = {
    addToCart,
    getCartItems,
    removeFromCart,
    plusOne,
    minusOne
}