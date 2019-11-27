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

  const fromRight = playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= rightSide
  const fromLeft = playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= leftSide
  const fromTop = playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= topSide
  const fromBottom = playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= bottomSide

  const isTouchingBorder = rightSide > playerPosition.x &&
    leftSide < playerPosition.x &&
    bottomSide > playerPosition.y &&
    topSide < playerPosition.y

  if (isTouchingBorder) {

    const blockingPosition = {
      x: playerPosition.x,
      y: playerPosition.y
    }

    if (fromRight) {
      // coming from right
      blockingPosition.x = rightSide
    }

    if (fromLeft) {
      // coming from left
      blockingPosition.x = leftSide
    }

    if (fromTop) {
      // coming from top
      blockingPosition.y = topSide
    }

    if (fromBottom) {
      // coming from bottom
      blockingPosition.y = bottomSide
    }

    return blockingPosition
  }

  return false
}

Utils.isInFence = function(entity, playerPosition, prevPlayerPosition) {
  // add an extra space on top inside border to make it matches more with the design
  const insideTopExtraSpace = 0.15

  // make extra space to make it easier in corridors
  // border sides
  const rightSide = entity.x + 1 - Constants.WALL_EXTRA_SPACE
  const leftSide = entity.x - 1 + Constants.WALL_EXTRA_SPACE
  const topSide = entity.y - 1 + Constants.WALL_EXTRA_SPACE - insideTopExtraSpace
  const bottomSide = entity.y + 1 - Constants.WALL_EXTRA_SPACE

  // directions from out of cell
  const fromRight = playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= rightSide
  const fromLeft = playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= leftSide
  const fromTop = playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= topSide
  const fromBottom = playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= bottomSide

  // inner sides
  const leftInnerSide = entity.x
  const rightInnerSide = entity.x
  const bottomInnerSide = entity.y
  const topInnerSide = entity.y - insideTopExtraSpace

  // directions from inside cell
  const fromRightInside = playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= leftInnerSide
  const fromLeftInside = playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= rightInnerSide
  const fromTopInside = playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= bottomInnerSide
  const fromBottomInside = playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= topInnerSide

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
        // if there is a top border, stop the player from right when his y pos is above the top border
        if (topInnerSide > playerPosition.y) {
          blockingPosition.x = rightSide
        }
      }

      if (entity.bottom) {
        // if there is a bottom border, stop the player from right when his y pos is under the bottom border
        if (bottomInnerSide < playerPosition.y) {
          blockingPosition.x = rightSide
        }
      }

      // block at border
      if (entity.right) {
        blockingPosition.x = rightSide
      }
    }

    // inside and from Right
    if (fromRightInside) {
      if (entity.left) {
        // stop at inner border left
        if (leftInnerSide > playerPosition.x) {
          blockingPosition.x = leftInnerSide
        }
      }
    }

    // from Left and outside
    if (fromLeft) {
      if (entity.top) {
        if (topInnerSide > playerPosition.y) {
          blockingPosition.x = leftSide
        }
      }

      if (entity.bottom) {
        if (bottomInnerSide < playerPosition.y) {
          blockingPosition.x = leftSide
        }
      }

      if (entity.left) { // block at border
        blockingPosition.x = leftSide
      }
    }

    // inside and from Left
    if (fromLeftInside) {
      if (entity.right) {
        if (rightInnerSide < playerPosition.x) {
          blockingPosition.x = rightInnerSide
        }
      }
    }

    if (fromTop) {
      if (entity.left) {
        if (leftInnerSide > playerPosition.x) {
          blockingPosition.y = topSide
        }
      }

      if (entity.right) {
        if (rightInnerSide < playerPosition.x) {
          blockingPosition.y = topSide
        }
      }

      if (entity.top) {
        blockingPosition.y = topSide
      }
    }

    if (fromTopInside) {
      if (entity.bottom) {
        if (bottomInnerSide < playerPosition.y) {
          blockingPosition.y = bottomInnerSide
        }
      }
    }

    if (fromBottom) {
      if (entity.left) {
        if (leftInnerSide > playerPosition.x) {
          blockingPosition.y = bottomSide
        }
      }

      if (entity.right) {
        if (rightInnerSide < playerPosition.x) {
          blockingPosition.y = bottomSide
        }
      }

      if (entity.bottom) {
        blockingPosition.y = bottomSide
      }
    }

    if (fromBottomInside) {
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
