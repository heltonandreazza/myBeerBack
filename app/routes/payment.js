const db = require('../db');
const User = db.userModel;
const Cart = db.cartModel;
const async = require('async');
const stripe = require('stripe')('sk_test_kc93KzGT0bHDRqiOJuB4xLai');

const charge = (req, res, next) => {
    let stripeToken = req.body.stripeToken;
    let currentCharges = Math.round(req.body.stripeMoney * 100);

    //CREATE CUSTOMER
    stripe.customers.create({
        source: stripeToken
    }).then(customer => {
        //CREATE CHARGE
        return stripe.charges.create({
            amount: currentCharges,
            currency: 'usd',
            customer: customer.id
        });
    }).then(charge => {
        async.waterfall([
            //FIND USER
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
            //FIND CART AND ATT USER HISTORY
            (user, callback) => {
                Cart.findOne({ owner: user._id }, function(err, cart) {
                    if (err) return next(err);
                    if (cart) {
                        //save history user
                        let history = {
                            //save history payment data
                            id: charge.id,
                            amount: charge.amount / 100,
                            currency: charge.currency,
                            //save history card data
                            card: {
                                brand: charge.source.brand,
                                country: charge.source.country,
                                customer: charge.source.customer,
                                exp_month: charge.source.exp_month,
                                exp_year: charge.source.exp_year,
                                funding: charge.source.funding,
                                last4: charge.source.last4
                            },
                            items: []
                        };

                        //save history items
                        console.log(cart.items);
                        cart.items.forEach(cartItem => {
                            history.items.push({
                                item: cartItem.item,
                                quantity: cartItem.quantity,
                                price: cartItem.price,
                                paid: (cartItem.price * cartItem.quantity).toFixed(2)
                            });
                        });
                        user.history.push(history);
                        console.log(user.history);

                        user.save((err, user) => {
                            if (err) res.json(err);
                            //update user's cart
                            callback(err, user);
                        });

                    } else {
                        res.json({ message: 'cart not found' });
                    }
                })
            },
            // CLEAN CART
            (user) => {
                Cart.update({ owner: user._id }, { $set: { items: [], total: 0 } }, (err, updated) => {
                    if (updated) {
                        res.json(charge);
                    } else {
                        res.json('payment not created!');
                    }
                });
            }
        ]);
    })
}

module.exports = {
    charge
}