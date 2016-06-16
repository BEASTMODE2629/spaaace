'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './index.html');

const server = express();

server.get('/', function (req, res) {
    res.sendFile(INDEX)
});


server.use('/', express.static(path.join(__dirname, '.')));

var requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(requestHandler);


/*
    Game logic
 */

const SpaaaceServerEngine = require(path.join(__dirname, 'src/SpaaaceServerEngine.js'));
const SpaaaceGameEngine = require(path.join(__dirname, 'src/SpaaaceGameEngine.js'));

const gameEngine = new SpaaaceGameEngine();
const serverEngine = new SpaaaceServerEngine(io, gameEngine, {
    debug:{
        // serverSendLag: 600
    }
});

//start the game
serverEngine.start();