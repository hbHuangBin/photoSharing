var util = require('util'),
    Document = require('./document.js'),
    Collection = require('./collection.js'),
    CONST = require('./const.js'),
    User = require('./user.js'),
    Resource = require('./Resource.js'),
    VERSION = CONST.VERSION,
    USER = User._collectionName,
    RESOURCE = Resource._collectionName;

module.exports = UserResource;

/* public apis */
function UserResource (userID, resID, when) {
  this.resource = resID;
  this.date = when;
  this.version = VERSION;

  Document.call(this, Collection.makeJoinName(USER, userID, RESOURCE), 
                UserResource._transformDBResult, userID);
  return this;
}
util.inherits(UserResource, Document);

/* static function */
UserResource._transformDBResult  = function (result, primary) {
  var ret;

  ret = new UserResource(primary, result.resouce, result.date);
  ret._copyDBResult(result);

  return ret;
};
UserResource.findOne = Collection.joinFindOne.bind(null, USER, RESOURCE,
                                             UserResource._transformDBResult);

/* overwrite the _validate function */
UserResource.prototype._validate = function () {
  if (typeof this.resource === 'string' &&
      this.date instanceof Date) {
    return true;
  } else {
    return false;
  }
};

