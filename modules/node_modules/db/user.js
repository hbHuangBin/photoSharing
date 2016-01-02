var util = require('util'),
    Document = require('./document.js'),
    Collection = require('./collection.js'),
    CONST = require('./const.js'),
    VERSION = CONST.VERSION;

module.exports = User;

/* public apis */
function User (nameStr, isAdmin, group, followees) {

  this.name = nameStr;
  this.admin = isAdmin;
  this.group = group;
  this.followees = followees || [];
  this.version = VERSION;

  Document.call(this, User._collectionName, User._transformDBResult);
  return this;
}
util.inherits(User, Document);

/* static properties */
User._collectionName = 'users';
User._transformDBResult = function (result) {
  var ret;
  
  ret = new User(result.name, result.admin, result.group, result.followees);
  ret._copyDBResult(result);

  return ret;
};
User.findOne = Collection.findOne.bind(null, User._collectionName, User._transformDBResult);

/* overwrite the _validate function */
User.prototype._validate = function () {
  if (typeof this.name === 'string' &&
      typeof this.admin === 'boolean' &&
      Array.isArray(this.group) &&
      Array.isArray(this.followees)) {
    return true;
  } else {
    return false;
  }
};
