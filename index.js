const chalk = require('chalk');
const app = require('express')();
const http = require('http');
const level = require('level');

// Hi there, this is Swarm City Support. 
// If you are human, press 1. 
// If you are the Swarm City Front End, press 2.
// > 2
// I can fetch stuff from Ethereum for you. 
// Tell me what you want.
// We'll be serving it up on our websocket, fi: 'hashtagList', string hastagListAddress

const server = require('http').createServer(app);
server.listen(3000, "localhost");

const io = require('socket.io')(server, {
    path: '/api',
    transports: ['websocket', 'xhr-polling'],
});

app.get('/hastagList', async function (req, res) {
    res.send(await getHashtagList());
});

io.on('connection', function (socket) {
    console.log(socket);
    socket.on('hastagList', function () {
        io.emit('hastagList', getHashtagList());
    });
});

async function getHashtagList () {
    var db = level('./db');
    var shelf = await db.get('hashtagListStore');
    db.close();
    var store = JSON.parse(shelf);
    return store;
};

async function getHashtagItems (address) {
    var db = level('./db');
    var shelf = await db.get('hashtag-'+address);
    db.close();
    var store = JSON.parse(shelf);
    return store;
};