var util = require('util'),
    Document = require('./document.js'),
    Collection = require('./collection.js'),
    Dimension = require('../dimension.js'),
    CONST = require('./const.js'),
    VERSION = CONST.VERSION;

module.exports = Resource;

/* public apis */
function Resource (nameStr, urlStr, dimension) {

  this.name = nameStr;
  this.url = urlStr;
  this.dimension = dimension;
  this.version = VERSION;

  Document.call(this, Resource._collectionName, Resource._transformDBResult);
  return this;
}
util.inherits(Resource, Document);

/* static properties */
Resource._collectionName = 'resource';
Resource._transformDBResult = function (result) {
  var ret;

  ret = new Resource(result.name, result.url, 
                     new Dimension(result.dimension.width, result.dimension.height));
  ret._copyDBResult(result);

  return ret;
};
Resource.findOne = Collection.findOne.bind(null, Resource._collectionName, Resource._transformDBResult);

/* overwrite the _validate function */
Resource.prototype._validate = function () {
  if (typeof this.name === 'string' &&
      typeof this.url === 'string' &&
      this.dimension instanceof Dimension) {
    return true;
  } else {
    return false;
  }
};
