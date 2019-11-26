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
  if (entity.x + entity.width > playerPosition.x &&
    entity.x - 1 < playerPosition.x &&
    entity.y + entity.height > playerPosition.y &&
    entity.y - 1 < playerPosition.y) {
    return true
  }

  return false
}

Utils.isInBorder = function(entity, playerPosition, prevPlayerPosition) {
  const rightSide = entity.x + entity.width - Constants.WALL_EXTRA_SPACE
  const leftSide = entity.x - 1 + Constants.WALL_EXTRA_SPACE
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
  const marginInside = 1
  //  needs to update entity width so player can go throught 2 right/left side fences

  // Le cas du border.top

  const rightSide = entity.x + 1
  const leftSide = entity.x - 1
  const topSide = entity.y - 1
  const bottomSide = entity.y + 1

  // extras
  const rightInnerSide = entity.left ? rightSide - marginInside : rightSide
  const bottomInnerSide = entity.top ? bottomSide - marginInside : bottomSide

  // direction
  const fromRight = playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= rightInnerSide //??? /!\
  const fromLeft = playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= leftSide
  const fromTop = playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= topSide
  const fromBottom = playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= bottomInnerSide

  const isInside = rightSide > playerPosition.x &&
    leftSide < playerPosition.x &&
    bottomSide > playerPosition.y &&
    topSide < playerPosition.y

  const blockingPosition = {
    x: playerPosition.x,
    y: playerPosition.y
  }

  // Le cas du border.top
  if (isInside) {
    if (fromRight) {
      // console.log('from right')
      if (entity.left) {
        if (rightInnerSide > playerPosition.x) {
          blockingPosition.x = rightInnerSide
        }
      }

      if (entity.top) {
        // if player is moving fromRight but also fromTop/bottom cap the player position to topSide maximum
        const playerPositionY = fromBottom || fromTop ? Math.max(playerPosition.y, topSide + marginInside) : playerPosition.y
        if (bottomInnerSide > playerPositionY) {
          blockingPosition.x = rightSide
        }
      }

      if (entity.right) { // if neutral, block at border
        blockingPosition.x = rightSide
      }
    }

    if (fromLeft) {
      // console.log('from left')
      if (entity.top) {
        if (bottomInnerSide > playerPosition.y) {
          blockingPosition.x = leftSide
        }
      }

      if (entity.left) {
        blockingPosition.x = leftSide
      }
    }

    if (fromTop) {
      // console.log('from top')

      if (entity.left) {
        if (rightInnerSide > playerPosition.x) {
          blockingPosition.y = topSide
        }
      }

      if (entity.top) {
        blockingPosition.y = topSide
      }
    }

    if (fromBottom) {
      // if player is moving fromBottom but also fromRight/left cap the player position to leftSide maximum
      if (entity.left) {
        const playerPositionX = fromRight || fromLeft ? Math.max(playerPosition.x, leftSide + marginInside) : playerPosition.x
        if (rightInnerSide > playerPositionX) {
          blockingPosition.y = bottomSide
        }
      }

      if (entity.top) {
        if (bottomInnerSide > playerPosition.y) {
          // console.log('veteran')
          blockingPosition.y = bottomInnerSide
        }
      }

      if (entity.bottom) { // if neutral, block at border
        blockingPosition.y = bottomSide
      }

    }
  }

  if (blockingPosition.x !== playerPosition.x || blockingPosition.y !== playerPosition.y) {
    return blockingPosition
  }


  return false
}
