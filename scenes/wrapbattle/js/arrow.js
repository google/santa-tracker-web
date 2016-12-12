/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
 'use strict';

goog.provide('app.Arrow');

goog.require('app.Constants');

app.Arrow = class {
  /**
   * Renders the arrows on the track
   * @param {CanvasRenderingContext2D} context The canvas context
   * @param {Object} data Data about the arrow
   * @param {Element} cacheCanvas The cached arrows canvas
   */
  constructor(data, cacheCanvas) {
    this.location = data.trackLocation;
    this.directions = data.directions;
    this.length = data.length;
    this.data = data;
    this.cacheCanvas = cacheCanvas[0];
  }


  /**
   * Renders the arrows based on the current track position
   * @param  {number} trackPosition The amount the track has moved
   * @param  {string} responsiveKey The key representing the current breakpoint
   * @param {CanvasRenderingContext2D} context The canvas context
   * @param {number} canvasOffset The offset of the canvas
   * @export
   */
  render(trackPosition, responsiveKey, canvas, canvasOffset) {
    // TODO(leeee): Sometimes the canvas is not passed correctly, when restarting the game.
    if (!canvas || !canvas[0]) { return; }

    let context = canvas[0].getContext('2d');
    let width = canvas[0].width;
    let arrowSize = app.Constants.ARROW_SIZE[responsiveKey];
    let arrowMargin = app.Constants.ARROW_MARGIN;
    let arrowsWidth = 4 * arrowSize + 3 * arrowMargin;
    let screenLocation = this.location + trackPosition;
    let canvasLocation = this.location - canvasOffset;
    let arrowLength = arrowSize / 2 + this.length || 0;
    let arrowSpaceCache = app.Constants.ARROW_SIZE.desktop +
        app.Constants.ARROW_MARGIN;
    let shadowArrowHeightCache = arrowSize +
        app.Constants.ARROW_MULTI_SHADOW_BLUR +
        app.Constants.ARROW_MULTI_SHADOW_OFFSET;
    let arrowSizeCache = arrowSize + 5;

    context.save();
    context.translate(0, canvasLocation);
    for (let i = 0; i < this.directions.length; i++) {
      let direction = this.directions[i];
      context.save();
      let xOffset = (width - arrowsWidth) / 2 + arrowSize / 2;
      let xOffsetCache;
      switch (direction) {
        case app.Constants.DIRECTIONS.UP:
          xOffset += (arrowSize + arrowMargin);
          xOffsetCache = 0;
          break;
        case app.Constants.DIRECTIONS.DOWN:
          xOffset += 2 * (arrowSize + arrowMargin);
          xOffsetCache = arrowSpaceCache;
          break;
        case app.Constants.DIRECTIONS.LEFT:
          xOffsetCache = 2 * arrowSpaceCache;
          break;
        case app.Constants.DIRECTIONS.RIGHT:
          xOffset += 3 * (arrowSize + arrowMargin);
          xOffsetCache = 3 * arrowSpaceCache;
          break;
      }

      if (this.passed && !this.caught) {
        context.globalAlpha = 0.5;
      }

      context.translate(xOffset, 0);
      if (this.length) {
        // Draw tail circles
        context.clearRect(-arrowSize / 2, i - arrowSize / 2,
            arrowSizeCache, this.length + arrowSizeCache + 5);

        for (let i = this.length, j = 0; i > 0;
            i -= app.Constants.ARROW_MULTI_MARGIN, j++) {
          if (i + screenLocation <
              app.Constants.TRACK_LINE_POSITION[responsiveKey]) {
            let colorOffset = (j %
              app.Constants.COLORS.ARROW_MULTI_RAINBOW.length) + 1;
            context.drawImage(this.cacheCanvas,
              arrowSpaceCache * colorOffset, arrowSpaceCache * 3, arrowSizeCache, shadowArrowHeightCache,
              -arrowSize / 2, i - arrowSize / 2, arrowSizeCache, shadowArrowHeightCache)
          } else {
            context.drawImage(this.cacheCanvas,
              0, arrowSpaceCache * 3, arrowSizeCache, shadowArrowHeightCache,
              -arrowSize / 2, i - arrowSize / 2, arrowSizeCache, shadowArrowHeightCache)
          }
        }

        if (this.caught) {
          context.drawImage(this.cacheCanvas,
            xOffsetCache, arrowSpaceCache * 2, arrowSizeCache, arrowSizeCache,
            -arrowSize / 2, -arrowSize / 2, arrowSizeCache, arrowSizeCache)
        } else {
          context.drawImage(this.cacheCanvas,
            xOffsetCache, 0, arrowSizeCache, arrowSizeCache,
            -arrowSize / 2, -arrowSize / 2, arrowSizeCache, arrowSizeCache)
        }

      } else {
        // Draw arrow circle
        if (this.caught) {
          this.clearAndDraw(context, this.cacheCanvas,
            xOffsetCache, arrowSpaceCache * 2, arrowSizeCache, arrowSizeCache,
            -arrowSize / 2, -arrowSize / 2, arrowSizeCache, arrowSizeCache)
        } else {
          this.clearAndDraw(context, this.cacheCanvas,
            xOffsetCache, 0, arrowSizeCache, arrowSizeCache,
            -arrowSize / 2, -arrowSize / 2, arrowSizeCache, arrowSizeCache)
        }
      }

      context.restore();
    }
    context.restore();
  }

  clearAndDraw(context, ...drawImageArgs) {
    context.clearRect(drawImageArgs[5], drawImageArgs[6], drawImageArgs[7],
        drawImageArgs[8]);
    context.drawImage(...drawImageArgs);
  }
}

