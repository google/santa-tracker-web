/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('Utils');

goog.require('Constants');

Utils.gridToPixelValue = function(gridValue) {
  return gridValue * Constants.GRID_DIMENSIONS.UNIT_SIZE;
}

/**
 * Converts a pixel coordinate on the viewport to a grid value based coordinate
 *
 */
Utils.pixelToGridPosition = function(boardElem, pixelPosition) {
  let x, y;
  let rect = boardElem.getBoundingClientRect();
  x = (pixelPosition.x - rect.left) / rect.width * Constants.GRID_DIMENSIONS.WIDTH;
  y = (pixelPosition.y - rect.top) / rect.height * Constants.GRID_DIMENSIONS.HEIGHT;

  const { GRID_DIMENSIONS } = Constants;
  x = Math.max(0, Math.min(GRID_DIMENSIONS.WIDTH, x));
  y = Math.max(0, Math.min(GRID_DIMENSIONS.HEIGHT, y));

  return { x, y };
}

Utils.renderAtGridLocation = function(element, x, y, flipped = false) {
  if (flipped) {
    element.style.transform =
        `translate3d(${Utils.gridToPixelValue(x)}px, ${Utils.gridToPixelValue(y)}px, 0) scaleX(-1)`;
  } else {
    element.style.transform =
        `translate3d(${Utils.gridToPixelValue(x)}px, ${Utils.gridToPixelValue(y)}px, 0)`;
  }
}

/**
 * offset allows some overlap before triggering
 */
Utils.isTouchingBorder = function(entity, playerPosition) {
  if (entity.x + entity.width > playerPosition.x &&
    entity.x - 1 < playerPosition.x &&
    entity.y + entity.height > playerPosition.y &&
    entity.y - 1 < playerPosition.y) {
    return true;
  }

  return false;
}

Utils.isInBorder = function(entity, playerPosition, prevPlayerPosition) {
  const rightSide = entity.x + entity.width - Constants.WALL_EXTRA_SPACE;
  const leftSide = entity.x - 1 + Constants.WALL_EXTRA_SPACE;
  const topSide = entity.y - 1 + Constants.WALL_EXTRA_SPACE;
  const bottomSide = entity.y + entity.height - Constants.WALL_EXTRA_SPACE;

  const fromRight = playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= rightSide;
  const fromLeft = playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= leftSide;
  const fromTop = playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= topSide;
  const fromBottom = playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= bottomSide;

  const isGoingInside = rightSide > playerPosition.x &&
    leftSide < playerPosition.x &&
    bottomSide > playerPosition.y &&
    topSide < playerPosition.y;

  if (isGoingInside) {
    const blockingPosition = {
      x: playerPosition.x,
      y: playerPosition.y
    };

    if (fromRight) {
      // coming from right
      blockingPosition.x = rightSide;
    }

    if (fromLeft) {
      // coming from left
      blockingPosition.x = leftSide;
    }

    if (fromTop) {
      // coming from top
      blockingPosition.y = topSide;
    }

    if (fromBottom) {
      // coming from bottom
      blockingPosition.y = bottomSide;
    }

    return blockingPosition;
  }

  return false;
}

Utils.isInFence = function(entity, playerPosition, prevPlayerPosition, elem) {
  // add an extra space on top inside border to match more with the design
  const insideTopExtraSpace = 0.4;

  // make extra space to make it easier in corridors
  // border sides
  const rightSide = entity.x + 1 - Constants.WALL_EXTRA_SPACE;
  const leftSide = entity.x - 1 + Constants.WALL_EXTRA_SPACE;
  const topSide = entity.y - 1  // + Constants.WALL_EXTRA_SPACE // don't need because of extraSpace
  const bottomSide = entity.y + 1 - Constants.WALL_EXTRA_SPACE;

  // directions from out of cell
  const fromRight = playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= rightSide;
  const fromLeft = playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= leftSide;
  const fromTop = playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= topSide;
  const fromBottom = playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= bottomSide;

  // inner sides
  const leftInnerSide = entity.x;
  const rightInnerSide = entity.x;
  const bottomInnerSide = entity.y;
  const topInnerSide = entity.y - insideTopExtraSpace;

  // directions from inside cell
  const fromRightInside = playerPosition.x < prevPlayerPosition.x && prevPlayerPosition.x >= leftInnerSide;
  const fromLeftInside = playerPosition.x > prevPlayerPosition.x && prevPlayerPosition.x <= rightInnerSide;
  const fromTopInside = playerPosition.y > prevPlayerPosition.y && prevPlayerPosition.y <= bottomInnerSide;
  const fromBottomInside = playerPosition.y < prevPlayerPosition.y && prevPlayerPosition.y >= topInnerSide;

  const isGoingInside = rightSide > playerPosition.x &&
    leftSide < playerPosition.x &&
    bottomSide > playerPosition.y &&
    topSide < playerPosition.y;

  const blockingPosition = {
    x: playerPosition.x,
    y: playerPosition.y
  };

  if (isGoingInside) {
    // from Right and outside
    if (fromRight) {
      if (entity.top) {
        // if there is a top border, stop the player from right when his y pos is above the top border
        if (topInnerSide > playerPosition.y) {
          blockingPosition.x = rightSide;
        }
      }

      if (entity.bottom) {
        // if there is a bottom border, stop the player from right when his y pos is under the bottom border
        if (bottomInnerSide < playerPosition.y) {
          blockingPosition.x = rightSide;
        }
      }

      // block at border
      if (entity.right) {
        blockingPosition.x = rightSide;
      }
    }

    // inside and from Right
    if (fromRightInside) {
      if (entity.left) {
        // stop at inner border left
        if (leftInnerSide > playerPosition.x) {
          blockingPosition.x = leftInnerSide;
        }
      }
    }

    // from Left and outside
    if (fromLeft) {
      if (entity.top) {
        if (topInnerSide > playerPosition.y) {
          blockingPosition.x = leftSide;
        }
      }

      if (entity.bottom) {
        if (bottomInnerSide < playerPosition.y) {
          blockingPosition.x = leftSide;
        }
      }

      if (entity.left) { // block at border
        blockingPosition.x = leftSide;
      }
    }

    // inside and from Left
    if (fromLeftInside) {
      if (entity.right) {
        if (rightInnerSide < playerPosition.x) {
          blockingPosition.x = rightInnerSide;
        }
      }
    }

    if (fromTop) {
      if (entity.left) {
        if (leftInnerSide > playerPosition.x) {
          blockingPosition.y = topSide;
        }
      }

      if (entity.right) {
        if (rightInnerSide < playerPosition.x) {
          blockingPosition.y = topSide;
        }
      }

      if (entity.top) {
        blockingPosition.y = topSide;
      }
    }

    if (fromTopInside) {
      if (entity.bottom) {
        if (bottomInnerSide < playerPosition.y) {
          blockingPosition.y = bottomInnerSide;
        }
      }
    }

    if (fromBottom) {
      if (entity.left) {
        if (leftInnerSide > playerPosition.x) {
          blockingPosition.y = bottomSide;
        }
      }

      if (entity.right) {
        if (rightInnerSide < playerPosition.x) {
          blockingPosition.y = bottomSide;
        }
      }

      if (entity.bottom) {
        blockingPosition.y = bottomSide;
      }
    }

    if (fromBottomInside) {
      if (entity.top) {
        if (topInnerSide > playerPosition.y) {
          blockingPosition.y = topInnerSide;
        }
      }
    }
  }

  // z-index detection
  const offsetTouching = 0.9; // prevent velocity issues
  if (entity.top) {
    if (entity.y - offsetTouching > playerPosition.y) { // + Constants.WALL_EXTRA_SPACE // don't need because of extraSpace
      elem.classList.add('player-under');
    } else {
      elem.classList.remove('player-under');
    }
  }

  if (entity.bottom) {
    if (entity.y + offsetTouching - Constants.WALL_EXTRA_SPACE > playerPosition.y) {
      elem.classList.add('player-under');
    } else {
      elem.classList.remove('player-under');
    }
  }

  if (blockingPosition.x !== playerPosition.x || blockingPosition.y !== playerPosition.y) {
    return blockingPosition;
  }


  return false;
}

Utils.nextAnimationFrame = function(animationFrames, currentFrame, loop,
    lastFrameTime, now) {
  let nextFrame = currentFrame;
  let frameTime = lastFrameTime;
  let finished = false;

  const fps = animationFrames.fps || 60;
  const frameDelta = Math.round(fps / 1000 * (now - lastFrameTime));

  if (frameDelta >= 1) {
    if (loop) {
      const animationLength = animationFrames.end - animationFrames.start + 1;
      const currentOffset = currentFrame - animationFrames.start;
      nextFrame = animationFrames.start + ((currentOffset + frameDelta) % animationLength);
    } else {
      nextFrame = Math.min(currentFrame + frameDelta, animationFrames.end);
      finished = nextFrame == animationFrames.end;
    }

    frameTime = now;
  }

  return {
    nextFrame,
    frameTime,
    finished
  };
}

/**
 * Get angle between two positions
 */
Utils.getAngle =  function(pos1, pos2) {
  return Math.atan2(pos1.y - pos2.y, pos1.x - pos2.x);
}

/**
 * Get distance between two positions
 */
Utils.getDistance =  function(pos1, pos2) {
  return Math.hypot(pos1.x - pos2.x, pos1.y - pos2.y);
}

/**
 * Remove classes of an element starting with a specific string
 */

Utils.removeClassesStartWith = function(elem, string) {
  Array.from(elem.classList).forEach((x) => x.startsWith(string) && elem.classList.remove(x));
}


/**
 * Remove all children in an element
 */
Utils.removeAllChildren = function(elem) {
  elem.textContent = '';
}
