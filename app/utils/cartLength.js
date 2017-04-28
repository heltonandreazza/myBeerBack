'use strict';

const Cart = require('../db').cartModel;

//keep counting total user cart itens 
const cartLength = (req, res, next) => {
    if (req.user) {
        let total = 0;
        Cart.findOne({ owner: req.user._id }, function(err, cart) {
            if (cart) {
                for (let i = 0; i < cart.items.length; i++) {
                    total += cart.items[i].quantity;
                }
                res.locals.cart = total;
            } else {
                res.locals.cart = 0;
            }
            next();
        })
    } else {
        next();
    }
};

module.exports = cartLength;