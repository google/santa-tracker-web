/*
 * Copyright 2015 Google Inc. All rights reserved.
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

goog.provide('app.Cloth');

goog.require('app.Constants');
goog.require('app.Point');
goog.require('app.utils');
goog.require('app.encoding');



/**
 * Cloth simulation
 * @param {!app.Game} game
 * @param {!HTMLCanvasElement} canvas A canvas to render the cloth to.
 * @constructor
 */
app.Cloth = function(game, canvas) {
  this.canvas = canvas;
  this.ctx = this.canvas.getContext('2d');
  this.hairCanvas = null;
  this.game_ = game;
  this.mouse = {
    down: false,
    x: 0,
    y: 0,
    px: 0,
    py: 0
  };
  this.canPlaceDecoration = true;
  this.nearBeard = false;
};


/**
 * @extends {app.GameObject.start}
 */
app.Cloth.prototype.start = function() {
  this.hairShape = this.drawHairShape_();
  this.points = this.drawInitialCloth();

  $(this.canvas).on('click.santaselfie touchend.santaselfie', this.addHair_.bind(this));

  $(window).on('resize.santaselfie', function() {
    this.hairShape = this.drawHairShape_();
  }.bind(this));
};


/**
 * Resets the cloth to original state.
 */
app.Cloth.prototype.resetCloth = function() {
  this.points = this.drawInitialCloth();
};


/**
 * @extends {app.GameObject.mouseChanged}
 * @param {!app.Mouse} mouse
 * @param {!app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Cloth.prototype.mouseChanged = function(mouse, mouseCoords) {
  if (mouse !== this.game_.mouse) {
    throw new Error('unexpected mouse callback');
  }

  var tools = this.game_.tools;

  var rect = this.canvas.getBoundingClientRect();
  var canvasCoords = mouse.transformCoordinates(mouse.x, mouse.y, rect);

  this.mouse.px = this.mouse.x;
  this.mouse.py = this.mouse.y;

  this.mouse.x = canvasCoords.x;
  this.mouse.y = canvasCoords.y;
  this.mouse.down = canvasCoords.down;

  if (!this.canPlaceDecoration) {
    // wait for mouse up before placing another decoration
    this.canPlaceDecoration = !mouseCoords.down;
  }

  if (this.mouse.down && tools.selectedTool &&
      (tools.selectedTool.spray || tools.hairclean.isSelected ||
       tools.selectedTool.decoration || tools.clipper.isSelected)) {
    var scale = mouse.scaleFactor;
    var anyNearBeard = false;

    var i = this.points.length;
    while (i--) {
      if (!this.points[i].draw) {
        continue;
      }

      var differenceX = this.points[i].options.x * scale - this.mouse.x;
      var differenceY = this.points[i].options.y * scale - this.mouse.y;
      var dist = app.utils.distance(differenceX, differenceY);

      if (dist < app.Constants.SPACING * scale) {
        if (tools.clipper.isSelected) {
          this.nearBeard = true;
          anyNearBeard = true;
        }

        if (tools.selectedTool.spray) {
          this.points[i].spray = tools.selectedTool.spray;
        }

        if (tools.hairclean.isSelected) {
          this.points[i].spray = null;
          this.points[i].decoration = null;
        }

        if (tools.selectedTool.decoration && this.canPlaceDecoration) {
          this.points[i].decoration = tools.selectedTool.decoration;
          window.santaApp.fire('sound-trigger', 'selfie_item');
          this.canPlaceDecoration = false;
          break;
        }
      }
    }

    if (!anyNearBeard) {
      this.nearBeard = false;
    }
  }

  if (tools.selectedTool && tools.selectedTool.spray && mouseCoords.down && mouseCoords.x > app.Constants.NEAR_SANTA_DIM) {
    app.utils.triggerStart('selfie_color');
  } else if (!mouseCoords.down) {
    app.utils.triggerStop('selfie_color');
  }

  if (this.nearBeard && tools.clipper.isSelected && mouseCoords.down) {
    app.utils.triggerStart('selfie_shave_cutting');
  } else if (!this.nearBeard || !mouseCoords.down) {
    app.utils.triggerStop('selfie_shave_cutting');
  }
};

/**
 * Returns the initial cloth points (aka, where Santa has hair). This method
 * is idempotent and does not have effect on this object.
 *
 * @return {!Array.<!app.Point>}
 */
app.Cloth.prototype.drawInitialCloth = function() {
  var CANVAS_WIDTH = app.Constants.CANVAS_WIDTH;
  var CLOTH_WIDTH = app.Constants.CLOTH_WIDTH;
  var CLOTH_HEIGHT = app.Constants.CLOTH_HEIGHT;
  var SPACING = app.Constants.SPACING;
  var START_Y = app.Constants.START_Y;

  var points = [];
  var startX = CANVAS_WIDTH / 2 - CLOTH_WIDTH * SPACING / 2;
  var pointFactory = function(options) {
    return new app.Point(this.game_, options);
  }.bind(this);

  for (var y = 0; y <= CLOTH_HEIGHT; y++) {
    for (var x = 0; x <= CLOTH_WIDTH; x++) {
      var constraints = [];

      if (x > 0) {
        constraints.push(points.length - 1);
      }

      if (y > 0) {
        constraints.push(x + (y - 1) * (CLOTH_WIDTH + 1));
      }

      var pointX = startX + x * SPACING;
      var pointY = START_Y + y * SPACING;
      var pinned = pointY < 5 ||
          app.utils.distance(pointX - CANVAS_WIDTH / 2, pointY - START_Y - 30) <
          (CLOTH_WIDTH + 2) * SPACING / 2;
      var radius = CLOTH_WIDTH / 2;
      var draw = y > CLOTH_HEIGHT - radius ?
          ((x - radius) * (x - radius) + (y - (CLOTH_HEIGHT - radius)) *
              (y - (CLOTH_HEIGHT - radius))) <
              radius * radius :
          true;

      var point = pointFactory({
        x: pointX,
        y: pointY,
        pinned: pinned,
        constraints: constraints,
        draw: draw
      });

      points.push(point);
    }
  }

  function drawSideburn(x, y) {
    var point = pointFactory({
      x: startX + x * SPACING,
      y: START_Y - y * SPACING,
      pinned: true
    });

    points.push(point);
  }

  // sideburns
  for (var y = 1; y < 5; y++) {
    for (var x = 0; x < 2; x++) {
      drawSideburn(x, y);
      drawSideburn(x + CLOTH_WIDTH - 1, y);
    }
  }

  function drawHair(x, y) {
    var point = pointFactory({
      x: startX + 60 + x * SPACING,
      y: START_Y - 165 - y * SPACING,
      pinned: true
    });

    points.push(point);
  }

  // hair
  for (var x = 3; x < 11; x++) {
    drawHair(x, 3);
  }

  for (var x = 3; x < 12; x++) {
    drawHair(x, 2);
  }

  for (var x = 4; x < 12; x++) {
    drawHair(x, 1);
  }

  for (var x = 5; x < 11; x++) {
    drawHair(x, 0);
  }

  return points;
};

/**
 * Draws a single unit of Santa's hair based on the current scaleFactor.
 * @return {!HTMLCanvasElement} containing Santa's hair
 * @private
 */
app.Cloth.prototype.drawHairShape_ = function() {
  if (!this.hairCanvas) {
    this.hairCanvas = document.createElement('canvas');
  }
  var ctx = this.hairCanvas.getContext('2d');
  var scale = this.game_.mouse.scaleFactor;

  this.hairCanvas.width = 53 * scale;
  this.hairCanvas.height = 52 * scale;

  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(47, 30);
  ctx.bezierCurveTo(46, 28, 49, 25, 49, 23);
  ctx.bezierCurveTo(48, 20, 47, 18, 46, 15);
  ctx.bezierCurveTo(44, 15, 46, 18, 40, 19);
  ctx.bezierCurveTo(41, 12, 34, 7, 34, 0);
  ctx.bezierCurveTo(31, 5, 30, 11, 31, 17);
  ctx.bezierCurveTo(28, 13, 23, 10, 22, 4);
  ctx.bezierCurveTo(19, 9, 19, 13, 18, 18);
  ctx.bezierCurveTo(13, 14, 6, 14, 0, 17);
  ctx.bezierCurveTo(4, 18, 9, 19, 11, 23);
  ctx.bezierCurveTo(9, 21, 2, 21, 0, 22);
  ctx.bezierCurveTo(9, 26, 10, 38, 17, 43);
  ctx.bezierCurveTo(17, 44, 12, 48, 11, 46);
  ctx.bezierCurveTo(13, 49, 19, 48, 22, 48);
  ctx.bezierCurveTo(23, 49, 26, 50, 27, 50);
  ctx.bezierCurveTo(32, 52, 28, 44, 33, 52);
  ctx.bezierCurveTo(33, 46, 37, 47, 39, 50);
  ctx.bezierCurveTo(39, 48, 38, 46, 37, 44);
  ctx.bezierCurveTo(42, 44, 46, 41, 49, 38);
  ctx.bezierCurveTo(47, 39, 44, 39, 43, 37);
  ctx.bezierCurveTo(44, 39, 53, 31, 53, 29);
  ctx.bezierCurveTo(51, 31, 49, 31, 47, 30);
  ctx.bezierCurveTo(47, 29, 48, 31, 47, 30);
  ctx.closePath();
  ctx.fill();

  return this.hairCanvas;
};

/**
 * Updates all points of Santa's hair vis-á-vis their physical model.
 */
app.Cloth.prototype.update = function() {
  var i = app.Constants.PHYSICS_ACCURACY;

  while (i--) {
    var p = this.points.length;
    while (p--) {
      this.points[p].resolveConstraints(this.points);
    }
  }

  i = this.points.length;
  while (i--) {
    this.points[i].update(this.mouse);
  }
};

app.Cloth.prototype.draw = function() {
  var scale = this.game_.mouse.scaleFactor;

  this.canvas.width = app.Constants.CANVAS_WIDTH * scale;
  this.canvas.height = app.Constants.CANVAS_HEIGHT * scale;

  var i = this.points.length;
  while (i--) {
    this.points[i].drawHair(this.hairShape, this.ctx, scale);
  }

  this.ctx.globalCompositeOperation = 'source-atop';

  i = this.points.length;
  while (i--) {
    this.points[i].drawSpray(this.ctx, scale);
  }

  this.ctx.globalCompositeOperation = 'source-over';

  i = this.points.length;
  while (i--) {
    this.points[i].drawDecoration(this.ctx, scale);
  }
};

/**
 * Adds hair at the current point.
 * @private
 */
app.Cloth.prototype.addHair_ = function() {
  if (!this.game_.tools.hairgrow.isSelected) {
    return;
  }

  var scale = this.game_.mouse.scaleFactor;
  var i = this.points.length;

  while (i--) {
    var differenceX = this.points[i].options.x * scale - this.mouse.x;
    var differenceY = this.points[i].options.y * scale - this.mouse.y;
    var dist = app.utils.distance(differenceX, differenceY);

    if (dist < app.Constants.ADD_DISTANCE) {
      this.points[i] = this.points[i].reset();
    }
  }
};

/**
 * Serialize the current state of the beard.
 * @return {string} encoded
 */
app.Cloth.prototype.save = function() {
  var points = this.points;
  var encoder = app.Constants.ENCODER;
  var sprays = this.game_.tools.sprays;
  var decorations = this.game_.tools.decorations;

  var data = points.map(function(point) {
    var index = 0;

    if (point.draw) {
      index += 1;
    }

    if (point.draw && point.spray) {
      index += (sprays.indexOf(point.spray) + 1) * 5; // color + color with decoration * 5
    }

    if (point.draw && point.decoration) {
      index += decorations.indexOf(point.decoration) + 1;
    }

    return encoder[index];
  });

  return app.encoding.encode(data.join(''));
};


/**
 * Replace the current beard with a saved state.
 * @param {string} encoded string representing beard state.
 */
app.Cloth.prototype.restore = function(encoded) {
  var encoder = app.Constants.ENCODER;
  var sprays = this.game_.tools.sprays;
  var decorations = this.game_.tools.decorations;

  var decoded = app.encoding.decode(encoded);

  var data = decoded.split('').map(function(char) {
    return encoder.indexOf(char);
  });

  var beardPoints = this.drawInitialCloth();

  for (var i = 0; i < beardPoints.length; i++) {
    beardPoints[i].draw = beardPoints[i].constrain = data[i] > 0;

    var spray = Math.floor((data[i] - 1) / 5);
    beardPoints[i].spray = spray > 0 ? sprays[spray - 1] : undefined;

    var decoration = (data[i] - 1) % 5;
    beardPoints[i].decoration = decoration > 0 ? decorations[decoration - 1] : undefined;
  }

  this.points = beardPoints;
};
