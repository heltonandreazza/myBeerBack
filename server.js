'use strict';

const connect = require('connect');
const http = require('http');
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const app = express();
// const app = connect();
//my modules
const eConBack = require('./app');

app.set('port', process.env.PORT || 3000);

//middlewares

//statics
app.use(express.static('public'));
//sessions
app.use(eConBack.session);
//passport 
app.use(passport.initialize());
app.use(passport.session());
//logger
app.use(require('morgan')('combined', {
    stream: {
        write: message => {
            // write to logs 
            eConBack.logger.log('info', message);
        }
    }
}));
//CORS
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Origin, Accept, Token');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method.toLowerCase() === "options") {
        res.send(200);
    } else {
        next();
    }
});
//utils
// app.use(eConBack.utils.cartLength);
//parsers
app.use(cookieParser());
//Handles post requests
app.use(bodyParser());
//Handles put requests
// app.use(methodOverride());
//check token
app.use('/', eConBack.utils.checkToken);
//routes
app.use('/', eConBack.router);

app.listen(app.get('port'), () => {
    console.log('eConBack is running at port 3000!');
})