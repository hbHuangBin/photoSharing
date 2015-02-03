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
  // setUp: function (callback) {
  //   callback();
  // },
  // tearDown: function (callback) {
  //   callback();
  // },
  insertTest : function (test) {
    var i,
        res = [];

    for (i = 0; i < data.res.length; ++i) {
      res.push(new Resource(data.res[i].name, data.res[i].url, 
                            new Dimension(data.res[i].dimension.width, data.res[i].dimension.height)));
    }

    test.expect(1);
    async.each(res, dbInsert(db, Resource), 
               function (error) {
                 test.ok(!error, "not all resources have been inserted successfully!");
                 test.done();
               });
  },
  updateTest : function (test) {
    var i,
        resTest = data.res;

    test.expect(8);
    i = Math.round(Math.random() * 10) % resTest.length;
    Resource.findOne(db, {'name' : resTest[i].name}, function (error, r1) {
      test.strictEqual(error, null);// 1
      test.strictEqual(r1 instanceof Resource, true); // 2

      // new data
      r1.name = r1.name + '_updateNameTest';
      r1.url = r1.url + '_updateUrlTest';
      r1.dimension =  new Dimension(r1.dimension.width + 1, r1.dimension.height + 1);

      r1.update(db, function(error) {
        test.strictEqual(error, null); // 3

        Resource.findOne(db, {'name' : r1.name}, function (error, r2) {
          test.strictEqual(error, null); // 4
          test.strictEqual(r2 instanceof Resource, true); // 5
          test.strictEqual(r1.name, r2.name); // 6
          test.strictEqual(r1.url, r2.url); // 7
          test.deepEqual(r1.dimension, r2.dimension); // 8

          resTest[i] = r2;
          test.done();
        });
      });
    });
  },
  deleteTest : function (test) {
    var i,
        resTest = data.res;

    test.expect(4);
    i = Math.round(Math.random() * 10) % resTest.length;
    Resource.findOne(db, {'name' : resTest[i].name}, function (error, r1) {
      test.strictEqual(error, null); // 1
      
      r1.remove(db, function (error) {
        test.strictEqual(error, null); // 2

        Resource.findOne(db, {'name' : r1.name}, function (error, r2) {
          test.strictEqual(error, null); // 3
          // should be removed
          test.strictEqual(r2, null);  // 4
          test.done();
        });
      });
    });
  }
};

exports.group = {
  insertTest : function (test) {
    var i,
        group = [];

    for (i = 0; i < data.group.length; ++i) {
      group.push(new Group(data.group[i].name, data.group[i].description, data.group[i].admin)); 
    }

    test.expect(1);
    async.each(group, dbInsert(db, Group), 
               function (error) {
                 test.ok(!error, "not all groups have been inserted successfully!");
                 test.done();
               });
  },
  updateTest : function (test) {
    var i,
        groupTest = data.group;

    test.expect(8);
    i = Math.round(Math.random() * 10) % groupTest.length;
    Group.findOne(db, {'name' : groupTest[i].name}, function (error, r1) {
      test.strictEqual(error, null);// 1
      test.strictEqual(r1 instanceof Group, true); // 2

      // new data
      r1.name = r1.name + '_updateNameTest';
      r1.description = r1.description + '_updateDescriptionTest';
      r1.admin = [1, 2];

      r1.update(db, function(error) {
        test.strictEqual(error, null); // 3

        Group.findOne(db, {'name' : r1.name}, function (error, r2) {
          test.strictEqual(error, null); // 4
          test.strictEqual(r2 instanceof Group, true); // 5
          test.strictEqual(r1.name, r2.name); // 6
          test.strictEqual(r1.description, r2.description); // 7
          test.deepEqual(r1.admin, r2.admin); // 8

          groupTest[i] = r2;
          test.done();
        });
      });
    });
  },
  deleteTest : function (test) {
    var i,
        groupTest = data.group;

    test.expect(5);
    i = Math.round(Math.random() * 10) % groupTest.length;
    Group.findOne(db, {'name' : groupTest[i].name}, function (error, r1) {
      test.strictEqual(error, null); // 1
      
      r1.remove(db, function (error) {
        test.strictEqual(error, null); // 2

        Group.findOne(db, {'name' : r1.name}, function (error, r2) {
          test.strictEqual(error, null); // 3
          // should be removed
          test.strictEqual(r2, null);  // 4
          r1.insert(db, function (error, r3) {
            // insert it back
            test.strictEqual(error, null); // 5
            test.done();
          });
        });
      });
    });
  }
};

exports.user = {
  insertTest : function (test) {
    test.expect(1);
    async.each(data.user, 
               function (u, eachCB) {
                 async.map(u.group, 
                           function (gName, mapCB) {
                             // translate the group name to group ID
                             Group.findOne(db, {'name' : gName}, function (error, g) {
                               mapCB(error, error === null ? (g ? g._id : null) : null);
                             });
                           }, 
                           function (err, results) {
                             var newUser;

                             newUser = new User(u.name, u.admin, results, u.followees);
                             newUser.insert(db, function (err, dbUser) {
                               if (err) {
                                 eachCB('failed to insert ' + u.name + ' reason : ' + err);
                                 return;
                               } 

                               if (!(dbUser instanceof User)) {
                                 eachCB('the return value is not an instance of User : ' + u.name);
                                 return;
                               }

                               try {
                                 objectPartialCompare(newUser, dbUser);
                               } catch (e) {
                                 eachCB('user :' + u.name + ', comparision failed');
                                 return;
                               }

                               eachCB();
                             });
                           });
               }, 
               function(err) {
                 test.ok(!err, '' + err);
                 test.done();
               });
  },
  updateTest : function (test) {
    var i,
        userTest = data.user;

    test.expect(9);
    i = Math.round(Math.random() * 10) % userTest.length;
    User.findOne(db, {'name' : userTest[i].name}, function (error, r1) {
      test.strictEqual(error, null);// 1
      test.strictEqual(r1 instanceof User, true); // 2

      // new data
      r1.name = r1.name + '_updateNameTest';
      r1.admin = !r1.admin;
      r1.group.push('updateGroupTest');
      r1.followees = ['updateFolloweeTest'];

      r1.update(db, function(error) {
        test.strictEqual(error, null); // 3

        User.findOne(db, {'name' : r1.name}, function (error, r2) {
          test.strictEqual(error, null); // 4
          test.strictEqual(r2 instanceof User, true); // 5
          test.strictEqual(r1.name, r2.name); // 6
          test.strictEqual(r1.admin, r2.admin); // 7
          test.deepEqual(r1.group, r2.group); // 8
          test.deepEqual(r1.followees, r2.followees); // 9

          userTest[i] = r2;
          test.done();
        });
      });
    });
  },
  deleteTest : function (test) {
    var i,
        userTest = data.user;

    test.expect(4);
    i = Math.round(Math.random() * 10) % userTest.length;
    User.findOne(db, {'name' : userTest[i].name}, function (error, r1) {
      test.strictEqual(error, null); // 1
      
      r1.remove(db, function (error) {
        test.strictEqual(error, null); // 2

        User.findOne(db, {'name' : r1.name}, function (error, r2) {
          test.strictEqual(error, null); // 3
          // should be removed
          test.strictEqual(r2, null);  // 4
          test.done();
        });
      });
    });
  }
};

exports.closeDB = function (test) {
  test.expect(1);
  test.doesNotThrow(function () {
    appDB.closeDB(db);
  });
  test.done();
};

