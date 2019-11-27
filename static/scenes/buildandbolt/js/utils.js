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
  const topSide = entity.y - 1 + Constants.WALL_EXTRA_SPACE
  const bottomSide = entity.y + entity.height - Constants.WALL_EXTRA_SPACE

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

    if (playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= topSide) {
      // coming from top
      blockingPosition.y = topSide
    }

    if (playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= bottomSide) {
      // coming from bottom
      blockingPosition.y = bottomSide
    }

    return blockingPosition
  }

  return false
}

Utils.isInFence = function(entity, playerPosition, prevPlayerPosition) {
  const marginInside = 1
  //  needs to update entity width so player can go throught 2 right/left side fences
  // border sides
  const rightSide = entity.x + 1 - Constants.WALL_EXTRA_SPACE
  const leftSide = entity.x - 1 + Constants.WALL_EXTRA_SPACE
  const topSide = entity.y - 1 + Constants.WALL_EXTRA_SPACE
  const bottomSide = entity.y + 1 - Constants.WALL_EXTRA_SPACE

  // directions from out of cell
  const fromRight = playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= rightSide
  const fromLeft = playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= leftSide
  const fromTop = playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= topSide
  const fromBottom = playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= bottomSide

  // inner sides
  const leftInnerSide = rightSide - marginInside
  const rightInnerSide = leftSide + marginInside
  const bottomInnerSide = topSide + marginInside
  const topInnerSide = bottomSide - marginInside

  // directions from inside cell
  const fromInnerRight = playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= leftInnerSide
  const fromInnerLeft = playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= rightInnerSide
  const fromInnerTop = playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= bottomInnerSide
  const fromInnerBottom = playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= topInnerSide

  const isTouchingBorder = rightSide > playerPosition.x &&
    leftSide < playerPosition.x &&
    bottomSide > playerPosition.y &&
    topSide < playerPosition.y

  const blockingPosition = {
    x: playerPosition.x,
    y: playerPosition.y
  }

  if (isTouchingBorder) {
    // from Right and outside
    if (fromRight) {
      if (entity.top) {
        // if player is moving fromRight but also fromTop/bottom cap the player position to topSide maximum
        // const playerPositionY = fromBottom || fromTop ? Math.max(playerPosition.y, topSide + marginInside) : playerPosition.y
        if (topInnerSide > playerPosition.y) {
          blockingPosition.x = rightSide
        }
      }

      if (entity.bottom) {
        // const playerPositionY = fromBottom || fromTop ? Math.max(playerPosition.y, bottomSide - marginInside) : playerPosition.y
        if (topInnerSide < playerPosition.y) {
          blockingPosition.x = rightSide
        }
      }

      if (entity.right) { // block at border
        blockingPosition.x = rightSide
      }
    }

    // inside and from Right
    if (fromInnerRight) {
      if (entity.left) {
        // stop at inner left
        if (leftInnerSide > playerPosition.x) {
          blockingPosition.x = leftInnerSide
        }
      }
    }

    // from Left and outside
    if (fromLeft) {
      if (entity.top) {
        // const playerPositionY = fromBottom || fromTop ? Math.min(playerPosition.y, bottomSide - marginInside) : playerPosition.y
        if (topInnerSide > playerPosition.y) {
          blockingPosition.x = leftSide
        }
      }

      if (entity.bottom) {
        // const playerPositionY = fromBottom || fromTop ? Math.min(playerPosition.y, topSide + marginInside) : playerPosition.y
        if (topInnerSide < playerPosition.y) {
          blockingPosition.x = leftSide
        }
      }

      if (entity.left) { // block at border
        blockingPosition.x = leftSide
      }
    }

    // inside and from Left
    if (fromInnerLeft) {
      if (entity.right) {
        // stop at inner right
        if (rightInnerSide < playerPosition.x) {
          blockingPosition.x = rightInnerSide
        }
      }
    }

    if (fromTop) {
      // console.log('from top')
      if (entity.left) {
        if (leftInnerSide > playerPosition.x) {
          blockingPosition.y = topSide
        }
      }

      if (entity.right) {
        // const playerPositionX = fromRight || fromLeft ? Math.min(playerPosition.x, leftSide + marginInside) : playerPosition.x
        if (rightInnerSide < playerPosition.x) {
          blockingPosition.y = topSide
        }
      }

      if (entity.top) { // block at border
        blockingPosition.y = topSide
      }
    }

    if (fromInnerTop) {
      if (entity.bottom) {
        if (bottomInnerSide < playerPosition.y) {
          blockingPosition.y = bottomInnerSide
        }
      }
    }

    if (fromBottom) {
      // if player is moving fromBottom but also fromRight/left cap the player position to leftSide maximum
      if (entity.left) {
        // const playerPositionX = fromRight || fromLeft ? Math.max(playerPosition.x, leftSide + marginInside) : playerPosition.x
        if (leftInnerSide > playerPosition.x) {
          blockingPosition.y = bottomSide
        }
      }

      if (entity.right) {
        // const playerPositionX = fromRight || fromLeft ? Math.max(playerPosition.x, rightSide - marginInside) : playerPosition.x
        if (rightInnerSide < playerPosition.x) {
          blockingPosition.y = bottomSide
        }
      }

      if (entity.bottom) { // block at border
        blockingPosition.y = bottomSide
      }
    }

    if (fromInnerBottom) {
      if (entity.top) {
        if (topInnerSide > playerPosition.y) {
          blockingPosition.y = topInnerSide
        }
      }
    }
  }

  if (blockingPosition.x !== playerPosition.x || blockingPosition.y !== playerPosition.y) {
    return blockingPosition
  }


  return false
}
