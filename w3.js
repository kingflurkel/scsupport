const Web3 = require('web3');
var web3WsProvider = new Web3.providers.WebsocketProvider('wss://kovan.infura.io/ws');
var web3 = new Web3(web3WsProvider);

module.exports = {
    web3: web3,
    web3WsProvider: web3WsProvider
}
