const chalk = require('chalk');
const ipfs = require('nano-ipfs-store').at('https://ipfs.infura.io:5001');
var hashtagListAbi = require('./hashtagList.json');
var hashtagListInstance;
var myDb = require('./db.js');
var myWeb3 = require('./w3.js');

myDb.db.put('hashtagListStore', JSON.stringify({}));

myWeb3.web3WsProvider.on('connect', function () {
    console.log('Web3 Provider Connected');
    hashtagListInstance = new myWeb3.web3.eth.Contract(hashtagListAbi, '0x5148944fc8cc745a53258a61509f33165026a9b8');

    hashtagListInstance.events.allEvents({ fromBlock: 8149480 }, function(e,r) {
        console.log(chalk.yellow(r.event), '\n', chalk.gray(r.transactionHash));
        processHashtagEvent(r.returnValues, r.transactionHash);
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