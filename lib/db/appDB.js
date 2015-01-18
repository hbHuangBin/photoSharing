var MongoClient = require('mongodb').MongoClient;

var DB_URL = 'mongodb://localhost:27017/photoSharing';

exports.createDB = function (url, callback) {
  var onConnect,
      u;

  if (typeof url === 'function') {
    u = DB_URL;
    onConnect = url;
  } else {
    u = url;
    onConnect = callback;
  }
  MongoClient.connect(u, onConnect);
};

exports.closeDB = function (db) {
  db.close();
};

