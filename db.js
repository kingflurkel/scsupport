const level = require('level');
var db = level('./db');

async function getHashtagList () {
    try {
        db.open();
        var shelf = await db.get('hashtagListStore');
        await console.log(shelf);
        var store = JSON.parse(shelf);
        console.log(store);
        return store;
        db.close();
    } catch (e) {
      //this will eventually be handled by your error handling middleware
      console.log('getHashtagList ERR', e);
      //next(e) 
    }
};

async function getHashtagItems (address) {
    try {
        //var shelf = await myDb.db.get('hashtag-'+address);
        return 'hello hashtagItems: ' + address;
    } catch (e) {
        console.log('getHashtagItems ERR', e);
    }
    //var store = JSON.parse(shelf);
    
};

module.exports = {
    db: db,
    getHashtagList: getHashtagList,
    getHashtagItems: getHashtagItems
} 