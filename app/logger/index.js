'use strict';

const winston = require("winston");
const logger = new(winston.Logger)({
    transports: [
        new(winston.transports.File)({
            level: 'debug',
            filename: './eConBackDebug.log',
            handleExceptions: true
        }),
        new(winston.transports.Console)({
            level: 'debug',
            json: true,
            handleExceptions: true
        })
    ],
    exitOnError: false
});

module.exports = logger;