const chalk = require('chalk');
const app = require('express')();
const http = require('http');
const Web3 = require('web3');
const ipfs = require('nano-ipfs-store').at('https://ipfs.infura.io:5001');
var hashtagListAbi = require('./hashtagList.json');
var web3;
var hashtagListInstance;
const level = require('level');
var db = level('./db');

db.put('hashtagListStore', '{}');
db.put('hashtagListTotal', 0);
// Hi there, this is Swarm City Support. 
// If you are human, press 1. 
// If you are the Swarm City Front End, press 2.
// > 2
// I can fetch stuff from Ethereum for you. 
// Tell me what you want.
// We'll be serving it up on our websocket, fi: 'hashtagList', string hastagListAddress

const web3WsProvider = new Web3.providers.WebsocketProvider('wss://kovan.infura.io/ws');

web3WsProvider.on('error', () => {
    console.log('WebSocketProvider Error');
}); 

web3WsProvider.on('end', () => {
    console.log('WebSocketProvider Disconnect');
}); 

web3WsProvider.on('connect', () => {
    console.log(chalk.blue('WebSocketProvider Connected!'));
    web3 = new Web3(web3WsProvider);
    hashtagListInstance = new web3.eth.Contract(hashtagListAbi, '0x5148944fc8cc745a53258a61509f33165026a9b8');
    hashtagListInstance.events.allEvents({ fromBlock: 8149480 }, function(e,r) {
        console.log(chalk.yellow(r.event), '\n', chalk.gray(r.transactionHash));
        processHashtagEvent(r.returnValues, r.transactionHash);
    });

    newBlockHeadersSubscription = web3.eth.subscribe('newBlockHeaders', (error, result) => {
        if (result) {
            blockUpdate(result.number);
        }
    });
}); 

async function blockUpdate (number) {
    console.log('Block: ', number);
    //console.log(db);
    // also tell some website online i'm still alive
};

async function processHashtagEvent (r, tx) {
    var metaData = await ipfs.cat(r.hashtagMetaIPFS);
    shelf = await db.get('hashtagListStore');
    var store = JSON.parse(shelf);
    store[tx] = JSON.parse(metaData);
    shelf = JSON.stringify(store);
    await db.put('hashtagListStore', shelf);
};

const server = require('http').createServer(app);
var port = process.env.PORT || 8080;

server.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});

const io = require('socket.io')(server, {
    path: '/api',
    transports: ['websocket', 'xhr-polling'],
});

app.get('/', async function (req, res) {
    console.log("getHashtagList");
    var result = await getHashtagList();
    res.send(result);
});

// app.get('/', async function (req, res) {
//     console.log("hi!");
//     res.send("Hi there!");
// });

io.on('connection', function (socket) {
    console.log(socket);
    socket.on('hastagList', function () {
        io.emit('hastagList', getHashtagList());
    });
});

async function getHashtagList () {
    var shelf = await db.get('hashtagListStore');
    var store = JSON.parse(shelf);
    //console.log(store);
    return store;
};

async function getHashtagItems (address) {
    var shelf = await db.get('hashtag-'+address);
    var store = JSON.parse(shelf);
    return store;
};