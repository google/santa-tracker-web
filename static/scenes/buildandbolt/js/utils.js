goog.provide('Utils')

goog.require('Constants')

Utils.gridToPixelValue = function(gridValue) {
  return gridValue * Constants.GRID_DIMENSIONS.UNIT_SIZE
}

Utils.renderAtGridLocation = function(element, x, y) {
  element.style.transform =
      `translate3d(${Utils.gridToPixelValue(x)}px, ${Utils.gridToPixelValue(y)}px, 0)`
}

Utils.isInBorder = function(entity, playerPosition, prevPlayerPosition) {
  const rightSide = entity.x + entity.width
  const leftSide = entity.x - 1
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

Utils.nextAnimationFrame = function(animationFrames, currentFrame, loop, lastFrameTime, now) {
  let nextFrame = currentFrame
  let frameTime = lastFrameTime
  let finished = false

  const fps = 60
  const frameDelta = Math.round(fps / 1000 * (now - lastFrameTime))

  if (frameDelta >= 1) {
    if (loop) {
      const animationLength = animationFrames.end - animationFrames.start + 1
      const currentOffset = currentFrame - animationFrames.start
      nextFrame = animationFrames.start + ((currentOffset + frameDelta) % animationLength)
    } else {
      nextFrame = Math.min(currentFrame + frameDelta, animationFrames.end)
      finished = nextFrame == animationFrames.end
    }

    frameTime = now
  }

  return {
    nextFrame,
    frameTime,
    finished
  }
}
