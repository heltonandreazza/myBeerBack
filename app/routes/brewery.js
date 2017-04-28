'use strict';

const db = require('../db');
const User = db.userModel;
const Brewery = db.breweryModel;
const async = require('async');


const getBrewery = (req, res, next) => {
    console.log(req.params.id);
    Brewery.findOne({ _id: req.params.id })
        .populate('owner')
        .exec(function(err, brewery) {
            if (err) return next(err);
            res.json(brewery);
        });
}

const getBreweryByOwner = (req, res, next) => {
    async.waterfall([
        (callback) => {
            findUser(req.body.profileId)
                .then(user => {
                    if (user) {
                        callback(null, user);
                    } else {
                        res.json({ message: 'account does not exists' });
                    }
                })
                .catch(error => res.json({ message: 'could not find the user' }));
        },
        (user) => {
            Brewery.findOne({ owner: user._id })
                .populate('owner')
                .exec(function(err, brewery) {
                    if (err) return next(err);
                    res.json(brewery);
                });
        }
    ]);
}

const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

const getBreweryList = (req, res, next) => {
    Brewery.find({})
        .populate('owner')
        .exec(function(err, breweries) {
            res.send(breweries);
        });
}

const searchBrewery = (req, res, next) => {
    Brewery.find({
        fullName: { "$regex": req.body.search_term, "$options": "i" }
    }, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
}

const createBrewery = (req, res, next) => {
    console.log(req.body.owner.id);
    async.waterfall([
        (callback) => {
            findUser(req.body.owner.id)
                .then(user => {
                    if (user) {
                        callback(null, user);
                    } else {
                        res.json({ message: 'account does not exists' });
                    }
                })
                .catch(error => res.json({ message: 'could not find the user' }));
        },
        (user) => {
            Brewery.findOne({ fullName: req.body.fullName }, function(err, brewery) {
                if (err) return next(err);
                if (!brewery) {
                    let brewery = new Brewery();
                    brewery.owner = user._id;
                    brewery.fullName = req.body.fullName;
                    brewery.profilePic = req.body.profilePic;
                    brewery.backPic = req.body.backPic;
                    brewery.address = req.body.address;
                    brewery.email = req.body.email;
                    brewery.about = req.body.about;
                    brewery.site = req.body.site;
                    brewery.facebook = req.body.facebook;
                    brewery.description = req.body.description;
                    brewery.phoneNumber = req.body.phoneNumber;
                    brewery.initDate = Date(req.body.initDate);
                    brewery.ratings = [0, 0, 0, 0, 0];

                    brewery.save(function(err) {
                        if (err) return next(err);
                        res.json({ message: 'brewery successfully saved' });
                    });
                } else {
                    res.json({ message: 'a brewery with this name already exists' });
                }
            });
        }
    ]);
}

const findUser = (profileId) => {
    return User.findOne({ profileId: profileId }, (err, user) => {
        if (err) return next(err);
    });
}

const updateBrewery = (req, res, next) => {
    Brewery.findOne({ _id: req.body._id }, function(err, brewery) {
        if (err) return next(err);
        if (!brewery) {
            res.json({ message: 'brewery not found' });
            return next();
        } else {
            //update
            brewery.fullName = req.body.fullName;
            brewery.profilePic = req.body.profilePic;
            brewery.backPic = req.body.backPic;
            brewery.address = req.body.address;
            brewery.email = req.body.email;
            brewery.about = req.body.about;
            brewery.site = req.body.site;
            brewery.facebook = req.body.facebook;
            brewery.description = req.body.description;
            brewery.phoneNumber = req.body.phoneNumber;
            brewery.initDate = Date(req.body.initDate);

            brewery.save();
            res.json(brewery);
        }
    });
};

const rate = (req, res, next) => {
    Brewery.findOne({ _id: req.body._id }, function(err, brewery) {
        if (err) return next(err);
        console.log(brewery)
        if (!brewery) {
            res.json({ message: 'brewery not found' });
            return next();
        } else {
            //update
            brewery.qtdRating = brewery.qtdRating + 1;
            brewery.rating = ((brewery.rating + req.body.rating) / 2).toFixed(1);
            console.log(brewery.ratings[req.body.rating - 1]);
            let ratings = brewery.ratings;
            ratings[req.body.rating - 1] = ratings[req.body.rating - 1] + 1;
            brewery.ratings = ratings;

            brewery.save();
            res.json(brewery);
        }
    });
}

module.exports = {
    getBrewery,
    searchBrewery,
    createBrewery,
    updateBrewery,
    rate,
    getBreweryList,
    getBreweryByOwner
}