'use strict';

if (process.env.NODE_ENV === 'production') {
  console.log('heroku prod', process.env);
  //heroku enviroment variables
  module.exports = {
    // host: process.env.host || "",
    // dbURI: process.env.dbURI,
    // sessionSecret: process.env.sessionSecret
    "host": "http://localhost:3000",
    "dbURI": "mongodb://econback:econback@ds149567.mlab.com:49567/econback",
    "sessionSecret": "potato"    
  }
} else {
  console.log('dev');
  module.exports = require('./development.json');
}