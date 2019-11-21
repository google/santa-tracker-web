goog.provide('Utils')

goog.require('Constants')

Utils.gridToPixelValue = function(gridValue) {
  return gridValue * Constants.GRID_DIMENSIONS.UNIT_SIZE
}

Utils.renderAtGridLocation = function(element, x, y) {
  element.style.transform =
      `translate3d(${Utils.gridToPixelValue(x)}px, ${Utils.gridToPixelValue(y)}px, 0)`
}

Utils.isInBorder = function(entity, playerPosition) {
  let collide = false

  if (entity.x + entity.width > playerPosition.x &&
    entity.x - 1 < playerPosition.x &&
    entity.y + entity.height > playerPosition.y &&
    entity.y - 1 < playerPosition.y) {
    collide = true
  }

  return collide
}