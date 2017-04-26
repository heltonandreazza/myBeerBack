'use strict';

const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

//iterate througth the routes objetc and mout the routes
let _registerRouter = (routes, method) => {
    for (let key in routes) {
        if (typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
            _registerRouter(routes[key], key);
        } else {
            //register the routes
            if (method === 'get') {
                router.get(key, routes[key]);
            } else if (method === 'post') {
                router.post(key, routes[key]);
            } else {
                router.use(routes[key]);
            }
        }
    }
}

let route = routes => {
    _registerRouter(routes);
    return router;
}

//Find a single user based on key
let findOne = profileID => {
    return db.userModel.findOne({
        'profileId': profileID
    });
}

//Create a new user and returns that instanceof
let createNewUser = profile => {
    return new Promise((resolve, reject) => {
        let newChatUser = new db.userModel({
            profileId: profile.id,
            fullName: profile.displayName,
            profilePic: profile.photos[0].value
        })

        newChatUser.save(error => {
            if (error) {
                reject(error);
            } else {
                resolve(newChatUser);
            }
        })
    });
}

//The ES6 promisified version of findById
let findById = id => {
    return new Promise((resolve, reject) => {
        db.userModel.findById(id, (error, user) => {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        })
    })
}

//A middleware that cheks to see if the user is authenticated e logged in
let isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

//find a chatroom by a given name
let findRoomByName = (allrooms, room) => {
    let findRoom = allrooms.findIndex((element, index, array) => {
        if (element.room === room) {
            return true;
        } else {
            return false;
        }
    });

    return findRoom > -1 ? true : false;
}

//generate a unique room id
let randomHex = () => {
    return crypto.randomBytes(24).toString('hex');
}

//find a chatroom with a given id
let findRoomById = (allrooms, roomID) => {
    return allrooms.find((element, index, array) => {
        if (element.roomID === roomID) {
            return true;
        } else {
            return false;
        }
    });
}

//add user to a chatroom
let addUserToRoom = (allrooms, data, socket) => {
    //get the room object
    let getRoom = findRoomById(allrooms, data.roomID);
    //if it is found
    if (getRoom !== undefined) {
        //get the active user's ID (ObjectID as used in session)
        let userID = socket.request.session.passport.user; //this is possible because of the session brigde with the socket
        //check to see if this user already exists in the chatroom
        let checkUser = getRoom.users.findIndex((element, index, array) => {
            if (element.userID === userID) {
                return true;
            } else {
                return false;
            }
        });

        //if the use ris already present in the room, remove him first
        if (checkUser > -1) {
            getRoom.users.splice(checkUser, 1);
        }

        //push the user into room's users array again
        getRoom.users.push({
            socketID: socket.id,
            userID,
            user: data.user,
            userPic: data.userPic
        });

        //join the room channel
        socket.join(data.roomID);

        //return the updated room objetc
        return getRoom;
    }
}

//find and purge the user when a socket disconnects
let removeUserFromRoom = (allrooms, socket) => {
    for (let room of allrooms) {
        //find the user
        let findUser = room.users.findIndex((element, index, array) => {
            return element.socketID === socket.id ? true : false;
        });

        if (findUser > -1) {
            socket.leave(room.roomID);
            room.users.splice(findUser, 1);
            return room;
        }
    }
}

module.exports = {
    route,
    findOne,
    createNewUser,
    findById,
    isAuthenticated,
    findRoomByName,
    randomHex,
    findRoomById,
    addUserToRoom,
    removeUserFromRoom
}