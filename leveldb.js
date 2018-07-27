const level = require('level');
var db = level('./db');


module.exports = {
    db: db
};
