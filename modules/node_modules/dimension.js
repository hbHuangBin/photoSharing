
module.exports = Dimension;

function Dimension (width, height) {
  if (!(this instanceof Dimension)) {
    return new Dimension(width, height);
  }

  if (typeof width !== 'number' ||
      typeof height !== 'number') {
    return TypeError('The width and height of Dimention has to be a number');
  }
    
  this.width = width;
  this.height = height;
  
  return this;
}
