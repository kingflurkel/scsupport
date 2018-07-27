const level = require('level');
var db = level('./db');
db.put('hashtagListStore', '{}');
db.put('hashtagListTotal', 0);