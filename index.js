const chalk = require('chalk');
const app = require('express')();
const http = require('http');
const ipfs = require('nano-ipfs-store').at('https://ipfs.infura.io:5001');
var hashtagListAbi = require('./hashtagList.json');
var hashtagListInstance;

const myDb = require('./db.js');
var myWeb3 = require('./w3.js');

// Hi there, this is Swarm City Support. 
// If you are human, press 1. 
// If you are the Swarm City Front End, press 2.
// > 2
// I can fetch stuff from Ethereum for you. 
// Tell me what you want.
// We'll be serving it up on our websocket, fi: 'hashtagList', string hastagListAddress

myWeb3.web3WsProvider.on('connect', function () {
    console.log('Web3 Provider Connected');
    myDb.db.put('hashtagListStore', JSON.stringify({}));
    hashtagListInstance = new myWeb3.web3.eth.Contract(hashtagListAbi, '0x5148944fc8cc745a53258a61509f33165026a9b8');

    hashtagListInstance.events.allEvents({ fromBlock: 8149480 }, function(e,r) {
        console.log(chalk.yellow(r.event), '\n', chalk.gray(r.transactionHash));
        processHashtagEvent(r.returnValues, r.transactionHash);
    });
});

const server = require('http').createServer(app);
var port = process.env.PORT || 8080;

server.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});

const io = require('socket.io')(server, {
    path: '/api',
    transports: ['websocket', 'xhr-polling'],
});

async function blockUpdate (number) {
    console.log('Block: ', number);
    // also tell some website online i'm still alive
};

app.get('/', async (req, res, next) => {
    try {
      //var result = await myDb.getHashtagList();
      //console.log(result);
      res.sendfile("index.html");
    } catch (e) {
      //this will eventually be handled by your error handling middleware
      //next(e) 
    }
});

app.get('/hashtagList', async function (req, res) {
    console.log("getHashtagList");
    var result = await myDb.getHashtagList();
    res.send(result);
    //res.send("Hello there!");
});

app.get('/hashtagItems', async function (req, res) {
    console.log("getHashtagList");
    var result = await myDb.getHashtagItems(req.query.address);
    res.send(result);
    //res.send("Hello there!");
});

io.on('connection', function (socket) {
    console.log(socket);
    socket.on('hastagList', async function () {
        io.emit('hastagList', await myDb.getHashtagList());
    });
});

async function processHashtagEvent (r, tx) {
    var metaData = await ipfs.cat(r.hashtagMetaIPFS);
    myDb.db.open();
    shelf = await myDb.db.get('hashtagListStore');
    var store = JSON.parse(shelf);
    store[tx] = JSON.parse(metaData);
    shelf = JSON.stringify(store);
    await myDb.db.put('hashtagListStore', shelf);
    myDb.db.close();
};