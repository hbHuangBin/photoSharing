var util = require('util'),
    Document = require('./document.js'),
    Collection = require('./collection.js'),
    CONST = require('./const.js'),
    VERSION = CONST.VERSION;

module.exports = Group;

/* public apis */
function Group (nameStr, desStr, adminArray) {

  this.name = nameStr;
  this.description = desStr;
  this.admin = adminArray;
  this.version = VERSION;

  Document.call(this, Group._collectionName, Group._transformDBResult);
  return this;
}
util.inherits(Group, Document);

/* static properties */
Group._collectionName = 'groups';
Group._transformDBResult = function (result) {
  var ret;

  ret  = new Group(result.name, result.description, result.admin);
  ret._copyDBResult(result);

  return ret;
};
Group.findOne = Collection.findOne.bind(null, Group._collectionName, Group._transformDBResult);


/* overwrite the _validate function */
Group.prototype._validate = function () {
  if (typeof this.name === 'string' &&
      typeof this.description === 'string' &&
      Array.isArray(this.admin)) {
    return true;
  } else {
    return false;
  }
};

