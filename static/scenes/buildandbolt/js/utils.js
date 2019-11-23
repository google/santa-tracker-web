goog.provide('Utils')

goog.require('Constants')

Utils.gridToPixelValue = function(gridValue) {
  return gridValue * Constants.GRID_DIMENSIONS.UNIT_SIZE
}

Utils.renderAtGridLocation = function(element, x, y) {
  element.style.transform =
      `translate3d(${Utils.gridToPixelValue(x)}px, ${Utils.gridToPixelValue(y)}px, 0)`
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

Utils.isInBorder = function(entity, playerPosition, prevPlayerPosition) {
  const rightSide = entity.x + entity.width - 0.05
  const leftSide = entity.x - 1 + 0.05
  const bottomSide = entity.y + entity.height
  const topSide = entity.y - 1

  if (rightSide > playerPosition.x &&
    leftSide < playerPosition.x &&
    bottomSide > playerPosition.y &&
    topSide < playerPosition.y) {

    const blockingPosition = {
      x: playerPosition.x,
      y: playerPosition.y
    }


    if (playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= rightSide) {
      // coming from right
      blockingPosition.x = rightSide
    }

    if (playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= leftSide) {
      // coming from left
      blockingPosition.x = leftSide
    }

    if (playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= bottomSide) {
      // coming from bottom
      blockingPosition.y = bottomSide
    }

    if (playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= topSide) {
      // coming from top
      blockingPosition.y = topSide
    }

    return blockingPosition
  }

  return false
}

Utils.isInFence = function(entity, playerPosition, prevPlayerPosition) {
  const offset = 1
  //  needs to update entity width so player can go throught 2 right/left side fences

  const rightSide = entity.left ? entity.x + 1 - 0.05 - offset : entity.x + 1 - 0.05
  const leftSide = entity.x - 1 + 0.05
  const bottomSide = entity.top ? entity.y + 1 - offset : entity.y + 1
  const topSide = entity.y - 1

  console.log(bottomSide)
  // const leftSide = entity.left ? entity.x - 1 + offset : entity.x - 1
  // const bottomSide = entity.bottom ? entity.y + 1 - offset : entity.y + 1
  // const topSide = entity.top ? entity.y - 1 + offset : entity.y - 1

  if (rightSide > playerPosition.x &&
    leftSide < playerPosition.x &&
    bottomSide > playerPosition.y &&
    topSide < playerPosition.y) {

    const blockingPosition = {
      x: playerPosition.x,
      y: playerPosition.y
    }

    if (playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= rightSide) {
      // coming from right
      blockingPosition.x = rightSide
    }

    if (playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= leftSide) {
      // coming from left
      blockingPosition.x = leftSide
    }

    if (playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= bottomSide) {
      // coming from bottom
      blockingPosition.y = bottomSide
    }

    if (playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= topSide) {
      // coming from top
      blockingPosition.y = topSide
    }

    return blockingPosition
  }

  return false
}
