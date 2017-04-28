'use strict';

const User = require('../db').userModel;

//keep counting total user cart itens 
const checkToken = (req, res, next) => {
    if (req.url == '/login/')
        return next();

    if (!req.headers.token) {
        res.json({ message: 'token não enviado' });
    } else {
        User.findOne({ token: req.headers.token }, (err, user) => {
            if (user) {
                next();
            } else {
                res.json({ message: 'token inválido' });
            }
        });
    }
};

module.exports = checkToken;