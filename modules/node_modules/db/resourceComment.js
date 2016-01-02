var util = require('util'),
    Document = require('./document.js'),
    Collection = require('./collection.js'),
    CONST = require('./const.js'),
    Resource = require('./Resource.js'),
    VERSION = CONST.VERSION,
    RESOURCE = Resource._collectionName,
    COMMENT = 'comment';

module.exports = ResourceComment;

/* public apis */
function ResourceComment (resID, userID, comment, when) {
  this.user = userID;
  this.comment = comment;
  this.date = when;
  this.version = VERSION;

  Document.call(this, Collection.makeJoinName(RESOURCE, resID, RESOURCE), 
                ResourceComment._transformDBResult, resID);
  return this;
}
util.inherits(ResourceComment, Document);

/* static function */
ResourceComment._transformDBResult = function (result, primary) {
  var ret;

  ret = new ResourceComment(primary, result.user, result.comment, result.date);
  ret._copyDBResult(result);

  return ret;
};
ResourceComment.findOne = Collection.joinFindOne.bind(null, RESOURCE, COMMENT,
                                               ResourceComment._transformDBResult);

/* overwrite the _validate function */
ResourceComment.prototype._validate = function () {
  if (typeof this.user === 'string' &&
      typeof this.comment === 'string' &&
      this.date instanceof Date) {
    return true;
  } else {
    return false;
  }
};

