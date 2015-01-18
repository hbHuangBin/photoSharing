module.exports = Document;

function Document (collectionName, transformDBResult, primary) {
  var name;

  /* set _collectionName & _primary as a function instead of properties, 
   * so that they will not be saved into db
   */
  this._collectionName = function () { return collectionName; };
  this._primary = function () { return primary; };
  this._transformDBResult = transformDBResult;
}

Document.prototype.insert = function (db, callback) {
  var c = db.collection(this._collectionName()),
      transformDBResult = this._transformDBResult,
      primary = this._primary();

  if (!this._validate()) {
    setImmediate(callback, 
                 "Document validation failed, invalid document : " + JSON.stringify(this));
    return;
  }

  c.insert(this, function (error, result) {
    callback(error, error ? null : transformDBResult(result.ops[0], primary));
  });
};

Document.prototype.update = function (db, callback) {
  var c = db.collection(this._collectionName()),
      transformDBResult = this._transformDBResult,
      primary = this._primary();

  if (!this._id) {
    setImmediate(callback, "Document updating failed, _id is missing");
    return;
  }

  if (!this._validate()) {
    setImmediate(callback, 
                 "Document validation failed, invalid document : " + JSON.stringify(this));
    return;
  }

  c.replaceOne({'_id' : this._id}, this, function (error, result) {
    callback(error, error ? null : transformDBResult(result.ops[0], primary));
  });
};

Document.prototype.remove = function (db, callback) {
  var c = db.collection(this._collectionName()),
      transformDBResult = this._transformDBResult,
      primary = this._primary();

  if (!this._id) {
    setImmediate(callback, "Document removing failed, _id is missing");
    return;
  }
  
  c.remove({'_id' : this._id}, function (error, result) {
    callback(error, error ? null : transformDBResult(result.ops[0]));
  });
};

// virtual functions, every subclass of document has to implement it
// Document.prototype._validate = function () {};

Document.prototype._copyDBResult = function (result) {
  var name,
      hasOwnProperty = Object.prototype.hasOwnProperty;
  
  for (name in result) {
    if (hasOwnProperty.call(result, name) &&
        typeof this[name] === 'undefined') {
      this[name] = result[name];
    }
  }

};
