var util = require('util'),
    Document = require('./document.js'),
    Collection = require('./collection.js'),
    CONST = require('./const.js'),
    Group = require('./group.js'),
    Resource = require('./resource.js'),
    VERSION = CONST.VERSION,
    GROUP = Group._collectionName,
    RESOURCE = Resource._collectionName;

module.exports = GroupResource;

/* public apis */
function GroupResource (groupID, resID, when) {
  this.resource = resID;
  this.date = when;
  this.version = VERSION;

  Document.call(this, Collection.makeJoinName(GROUP, groupID, RESOURCE), 
                GroupResource._transfromDBResult, groupID);
  return this;
}
util.inherits(GroupResource, Document);

/* static function */
GroupResource._transfromDBResult = function (result, primary) {
  var ret;

  ret = new GroupResource(primary, result.resource, result.date);
  ret._copyDBResult(result);

  return ret;
};
GroupResource.findOne = Collection.joinFindOne.bind(null, GROUP, RESOURCE, 
                                              GroupResource._transfromDBResult);

/* overwrite the _validate function */
GroupResource.prototype._validate = function () {
  if (typeof this.resource === 'string' &&
      this.date instanceof Date) {
    return true;
  } else {
    return false;
  }
};

