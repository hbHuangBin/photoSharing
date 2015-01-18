var async = require('async'),
    Dimension = require('../lib/dimension.js'),
    appDB = require('../lib/db/appDB.js'),
    Resource = require('../lib/db/resource.js'),
    Group = require('../lib/db/group.js'),
    User = require('../lib/db/user.js'),
    ResourceComment = require('../lib/db/resourceComment.js'),
    GroupResource = require('../lib/db/groupResource.js'),
    UserResource = require('../lib/db/userResource.js'),
    data = require('./test_db.json'),
    assert = require('assert'),
    testDB = 'mongodb://localhost:27017/photoSharingTesting',
    db;

function objectPartialCompare(objA, objB) {
  var name,
      hasOwnProperty = Object.prototype.hasOwnProperty;
  
  for (name in objA) {
    if (hasOwnProperty.call(objA, name) &&
        typeof objA[name] !== 'function') {
      assert.deepEqual(objA[name], objB[name]);
    }
  }
}

function dbInsert(doc, done) {
  doc.insert(db, function (error, result) {
    var errMsg = null;
    
    if (error) {
      errMsg = "insert failed, error:" + error;
    } else {
      try {
        objectPartialCompare(doc, result);
      } catch (e) {
        errMsg = "comparsion failed";
      }
    }

    if (errMsg) {
      done(errMsg);
    } else {
      done();
    }
  });

}

function dbInsert(db, constructor) {

  return function(doc, done) {
    doc.insert(db, function (error, result) {
      var errMsg = null;

      do {
        if (error) {
          errMsg = "insert failed, error:" + error;
          break;
        }

        if (!(result instanceof constructor)) {
          errMsg = "invalid constructor";
          break;
        }

        try {
          objectPartialCompare(doc, result);
        } catch (e) {
          errMsg = "comparsion failed";
        }
      } while(0);

      if (errMsg) {
        done(errMsg);
      } else {
        done();
      }
    });
  };
}

exports.createDB = function (test) {
  appDB.createDB(testDB, function (error, dbRet) {
    test.expect(1);
    test.strictEqual(error, null);
    db = dbRet;
    test.done();
  });
};

exports.resource = {
  insert : function (test) {
    var i,
        res = [];

    for (i = 0; i < data.res.length; ++i) {
      res.push(new Resource(data.res[i].name, data.res[i].url, 
                            new Dimension(data.res[i].dimension.width, data.res[i].dimension.height)));
    }

    test.expect(1);
    async.each(res, dbInsert(db, Resource), 
               function (error) {
                 test.ok(!error, "all the resources have been inserted successfully!");
                 test.done();
               });
  }
};

// exports.groupInsert = function (test) {
//   var i,
//       group = [];

//   for (i = 0; i < data.group.length; ++i) {
//     group.push(new Group(testGroup[i].name, testGroup[i].description, testGroup[i].admin));
//   }

//   for (i = 0; i < data.res.length; ++i) {
//     res.push(new Resource(data.res[i].name, data.res[i].url, 
//                           new Dimension(data.res[i].dimension.width, data.res[i].dimension.height)));
//   }

//   test.expect(1);
//   async.each(group, dbInsert, 
//              function (error) {
//                test.ok(!error, "all the resources have been inserted successfully!");
//                test.done();
//              });
// };

exports.closeDB = function (test) {
  test.expect(1);
  test.doesNotThrow(function () {
    appDB.closeDB(db);
  });
  test.done();
};

// exports.resourceInsert = function (test) {
//   var i,
//       res;

//   for (i = 0; i < data.res.length; ++i) {
//     res.push(data.res[i].name, data.res[i].url, 
//              new Dimension(data.res[i].dimension.width, data.res[i].dimension.height));
//   }

//   async.each(res, function (o, callback) {
    
//   })
// };
//    assert = require('assert');

// function objectPartialCompare(objA, objB) {
//   var name,
//       hasOwnProperty = Object.prototype.hasOwnProperty;
  
//   for (name in objA) {
//     if (hasOwnProperty.call(objA, name) &&
//         typeof objA[name] !== 'function') {
//       assert.deepEqual(objA[name], objB[name]);
//     }
//   }

// }

// function insertAll (all, db) {
//   var d,
//       ret = [];

//   d = all.shift();
//   if (d !== undefined) {
//     d.insert(db, function (error, result) {
//       assert.equal(null, error);
//       objectPartialCompare(d, result);

//       ret.push(result);
//       ret.concat(insertAll(all, db));
//     });
//   }

//   return ret;
// }

// appDB.createDB(function (error, db) {
//   var i,
//       j,
//       k,
//       res = [],
//       group = [],
//       user = [],
//       comment = [],
//       groupResource = [],
//       userResource = [],
//       testRes = data.res,
//       testGroup = data.group,
//       testUser = data.user,
//       dbRes,
//       dbGroup,
//       dbUser,
//       dbComment,
//       dbGroupResource,
//       dbUserResource;

//   assert.equal(null, error);
  
//   // Resource insertion test
//   for (i = 0; i < testRes.length; ++i) {
//     res.push(new Resource(testRes[i].name, testRes[i].url, 
//                           new Dimension(testRes[i].dimension.width, 
//                                         testRes[i].dimension.height)));
//   }
//   dbRes = insertAll(res, db);

//   // Group insertion test
//   for (i = 0; i < testGroup.length; ++i) {
//     group.push(new Group(testGroup[i].name, testGroup[i].description, testGroup[i].admin));
//   }
//   dbGroup = insertAll(group, db);

//   // User insertion test
//   for (i = 0; i < testUser.length; ++i) {
//     user.push(new User(testUser[i].name, testUser[i].admin, 
//                        testGroup[i].group, testUser[i].followees));
//   }
//   dbUser = insertAll(user, db);
  
//   // Comment insertion test
//   for (i = 0; i < res.length; ++i) {
//     if (Array.isArray(res[i].comment)) {
//       assert.equal(res[i].name, dbRes[i].name);
//       for (j = 0; j < res[i].comment.length; ++j) {
//         for (k = 0; k < dbUser.length; ++k) {
//           if (res[i].comment[j].user === dbUser[k].name) {
//             comment.push(new ResourceComment(dbRes[i]._id, dbUser[k]._id,
//                                              res[i].comment[j].conntent, new Date()));
//           }
//         }
//       }
//     }
//   }
//   dbComment = insertAll(comment, db);

//   // GroupResource insertion test
//   for (i = 0; i < res.length; ++i) {
//     if (Array.isArray(res[i].group)) {
//       assert.equal(res[i].name, dbRes[i].name);
//       for (j = 0; j < res[i].group.length; ++j) {
//         for (k = 0; k < dbGroup.length; ++k) {
//           if (res[i].group[j] === dbGroup[k].name) {
//             groupResource.push(new GroupResource(dbGroup[k]._id, dbRes[i]._id, new Date()));            
//           }
//         }
//       }
//     }
//   }
//   dbGroupResource = insertAll(groupResource, db);

//   // UserResource insertion test
//   for (i = 0; i < res.length; ++i) {
//     assert.equal(res[i].name, dbRes[i].name);    
//     for (j = 0; j < dbUser.length; ++j) {
//       if (dbUser[j].name === res[i].user) {
//         userResource.push(new UserResource(dbUser[j]._id, dbRes[i]._id, new Date()));        
//       }
//     }
//   }
//   dbUserResource = insertAll(userResource, db);
  
//   appDB.closeDB(db);
// });
