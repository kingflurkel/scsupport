const Web3 = require('web3');
const chalk = require('chalk');
const ipfs = require('nano-ipfs-store').at('https://ipfs.infura.io:5001');
var hashtagListAbi = require('./hashtagList.json');
var web3;
var hashtagListInstance;
const level = require('level');

// Hi there, this is Swarm City Support. 
// If you are human, press 1. 
// If you are the Swarm City Front End, press 2.
// > 2
// I bet you want the hastagList first, don't you? 
// I'll go fetch it from Ethereum. 
// We'll be serving it up on our websocket, just ask for it: 'hashtagList', string hastagListAddress

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
    // also tell some website online i'm still alive
};

async function processHashtagEvent (r, tx) {
    var metaData = await ipfs.cat(r.hashtagMetaIPFS);
    var db = level('./db');
    shelf = await db.get('hashtagListStore');
    var store = JSON.parse(shelf);
    store[tx] = JSON.parse(metaData);
    shelf = JSON.stringify(store);
    await db.put('hashtagListStore', shelf);
    db.close();
};