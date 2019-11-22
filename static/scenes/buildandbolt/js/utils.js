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
  if (entity.x + entity.width > playerPosition.x &&
    entity.x - 1 < playerPosition.x &&
    entity.y + entity.height > playerPosition.y &&
    entity.y - 1 < playerPosition.y) {
    return true
  }

  return false
}

Utils.isTouchingBorder = function(entity, playerPosition) {
  const offset = 0.1

  if (entity.x + entity.width > playerPosition.x - offset &&
    entity.x - 1 < playerPosition.x + offset &&
    entity.y + entity.height > playerPosition.y - offset &&
    entity.y - 1 < playerPosition.y + offset) {
    return true
  }

  return false
}