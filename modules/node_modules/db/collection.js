exports.findOne = findOne;
exports.joinFindOne = joinFindOne;

exports.makeJoinName = makeJoinName;

function findOne (collection, transform, db, selector, options, callback) {
  var c = db.collection(collection);

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  c.findOne(selector, options, function (error, dbResult) {
    callback(error, (error || !dbResult) ? null : transform(dbResult));
  });
}

function joinFindOne (collectionA, collectionB, transform, db, selector, options, callback) {
  var tmpSelector,
      connectionName,
      c;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof selector !== 'object' ||
      typeof selector[collectionA] !== 'string') {
    callback(new TypeError('the selector is expected to be an object with property: ' +
                       collectionA));
    return;
  }
  
  tmpSelector = (JSON.parse(JSON.stringify(selector)));
  delete tmpSelector[collectionA];

  connectionName = makeJoinName(collectionA, selector[collectionA], collectionB);
  c = db.colleciton(connectionName);
  
  c.findOne(tmpSelector, options, function (error, dbResult) {
    callback(error, (error || !dbResult) ? null : transform(dbResult, selector[collectionA]));
  });
};

// exports.find = find;
// exports.joinFind = joinFind;

// function find (collection, transform, db, selector, each) {
//   var c = db.collection(collection),
//       cursor;

//   cursor = c.find(selector);
//   cursor.each(function (error, dbResult) {
//     each(error, transform(dbResult));
//   });

//   cursor.close();
// };

// function joinFind (collectionA, collectionB, transform, db, selector, each) {
//   var tmpSelector,
//       connectionName,
//       c,
//       cursor;

//   if (typeof selector !== 'object' ||
//       typeof selector[collectionA] !== 'string') {
//     each(new TypeError('the selector is expected to be an object with property: ' +
//                        collectionA));
//     return;
//   }
  
//   tmpSelector = (JSON.parse(JSON.stringify(selector)));
//   delete tmpSelector[collectionA];

//   connectionName = makeJoinName(collectionA, selector[collectionA], collectionB);
//   c = db.colleciton(connectionName);
//   cursor = c.find(tmpSelector);
//   cursor.each(function(error, dbResult) {
//     each(error, transform(dbResult, selector[collectionA]));
//   });
// };

function makeJoinName (collectionA, id, collectionB) {
  return collectionA + '_' + id + '_' + collectionB;
}
