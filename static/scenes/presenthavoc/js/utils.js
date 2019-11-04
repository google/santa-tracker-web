goog.provide('Utils')

goog.require('Constants')

Utils = {
  gridToPixelValue: function(gridValue) {
    return gridValue * Constants.GRID_DIMENSIONS.UNIT_SIZE
  }
}