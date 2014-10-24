/**
 * @constructor
 */
var LevelModel = function(elem) {
  this.level = null;
  this.elem = elem;

  // These are the doors indexes
  // according to our grid layout:
  // 0 1 2 3 4 5
  // 6 7 8 9 10 11

  // Set the active doors indexes
  // per level
  this.DOORS_LEVEL_MAP = {
    '1': [2,3,8,9],
    '2': [0,1,2,3,4,5],
    '3': [1,2,3,4,7,8,9,10],
    '4': [0,1,2,3,4,5,7,8,9,10],
    '5': [0,1,2,3,4,5,6,7,8,9,10,11]
  }

  this.LAST_LEVEL = '5';
};

LevelModel.prototype.start = function() {
};

LevelModel.prototype.getNumberOfDoors = function() {
  var _level = Math.min(this.level, this.LAST_LEVEL);
  return this.DOORS_LEVEL_MAP[_level].length;
}

LevelModel.prototype.getDoorIndex = function(i) {
  var _level = Math.min(this.level, this.LAST_LEVEL);
  return this.DOORS_LEVEL_MAP[_level][i];
}

LevelModel.prototype.set = function(level) {
  this.level = level;
};

LevelModel.prototype.get = function() {
  return parseInt(this.level, 10);
};

LevelModel.prototype.reset = function() {
  this.level = 1;
};

LevelModel.prototype.next = function() {
  this.set(this.level + 1);
};
