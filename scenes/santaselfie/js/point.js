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

goog.provide('app.Point');

goog.require('app.Constants');
goog.require('app.utils');


/**
 * Each Point represents a discrete part of the cloth, aka Santa's beard.
 * @param {!app.Game} game point is part of
 * @param {!app.Point.Options} options for point
 * @constructor
 */
app.Point = function(game, options) {
  this.game_ = game;
  this.options = options; // store the options so we can reset the point

  this.x = options.x;
  this.y = options.y;
  this.px = this.x;
  this.py = this.y;
  this.vx = 0;
  this.vy = 0;
  this.pinned = options.pinned || false;
  this.rotation = options.rotation || Math.random() * 2 * Math.PI;
  this.constraints = options.constraints || [];

  this.draw = options.hasOwnProperty('draw') ? options.draw : true;
  this.constrain = options.hasOwnProperty('constrain') ? options.constrain : true;
};

app.Point.prototype.reset = function() {
  var point;

  if (this.draw) {
    var decoration = this.decoration;
    var spray = this.spray;
    point = new app.Point(this.game_, this.options);
    point.decoration = decoration;
    point.spray = spray;
  } else {
    point = new app.Point(this.game_, this.options);
  }

  point.draw = true;
  point.constrain = true;

  return point;
};

app.Point.prototype.update = function(mouse) {
  var MOUSE_CUT = app.Constants.MOUSE_CUT;
  var MOUSE_INFLUENCE = app.Constants.MOUSE_INFLUENCE;
  var GRAVITY = app.Constants.GRAVITY;
  var DAMPING = app.Constants.DAMPING;
  var HAIRDRYER_FORCE = app.Constants.HAIRDRYER_FORCE;
  var PHYSICS_DELTA = app.Constants.PHYSICS_DELTA;
  var selectedTool = this.game_.tools.selectedTool;
  var scale = this.game_.mouse.scaleFactor;

  var differenceX = this.x * scale - mouse.x;
  var differenceY = this.y * scale - mouse.y;
  var dist = app.utils.distance(differenceX, differenceY);

  if (mouse.down) {
    if (this.game_.tools.clipper.isSelected && dist < MOUSE_CUT) {
      this.removeConstraint();
    }

    if (this.game_.tools.hairdryer.isSelected) {
      this.addForce((differenceX / Math.abs(differenceX)) * HAIRDRYER_FORCE, 0);
    }

    if (!selectedTool && dist < MOUSE_INFLUENCE) {
      this.px = this.x - (mouse.x - mouse.px);
      this.py = this.y - (mouse.y - mouse.py);
    }
  }

  this.addForce(0, GRAVITY);

  var nx = this.x + ((this.x - this.px) * DAMPING) + ((this.vx / 2) * PHYSICS_DELTA);
  var ny = this.y + ((this.y - this.py) * DAMPING) + ((this.vy / 2) * PHYSICS_DELTA);

  this.px = this.x;
  this.py = this.y;

  this.x = nx;
  this.y = ny;

  this.vy = this.vx = 0;
};

app.Point.prototype.drawHair = function(image, ctx, scale) {
  if (!this.draw) {
    return;
  }

  var sin = Math.sin(this.rotation);
  var cos = Math.cos(this.rotation);

  var width = image.width;
  var height = image.height;

  ctx.save();
  ctx.setTransform(cos, sin, -sin, cos, this.x * scale, this.y * scale);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
};


app.Point.prototype.drawSpray = function(ctx, scale) {
  if (this.spray && this.draw) {
    var x = this.x - this.spray.width / 2;
    var y = this.y - this.spray.height / 2;

    ctx.drawImage(this.spray, x * scale, y * scale, this.spray.width * scale,
                  this.spray.height * scale);
  }
};

app.Point.prototype.drawDecoration = function(ctx, scale) {
  if (this.decoration && this.draw) {
    var x = this.x - this.decoration.width / 2;
    var y = this.y - this.decoration.height / 2;
    var scale = this.game_.mouse.scaleFactor;

    ctx.drawImage(this.decoration, x * scale, y * scale, this.decoration.width * scale,
                  this.decoration.height * scale);
  }
};


app.Point.prototype.resolveConstraints = function(points) {
  if (this.pinned) {
    this.x = this.px;
    this.y = this.py;
    return;
  }

  var i = this.constraints.length;
  while (i--) {
    this.resolveConstraint(points[this.constraints[i]]);
  }

  var boundsX = app.Constants.CANVAS_WIDTH - 1;
  var boundsY = app.Constants.CANVAS_HEIGHT - 1;

  if (this.x > boundsX) {
    this.x = 2 * boundsX - this.x;
  } else if (this.x < 1) {
    this.x = 2 - this.x;
  }

  if (this.y < 1) {
    this.y = 2 - this.y;
  } else if (this.y > boundsY) {
    this.y = boundsY;
    this.draw = false;
  }
};

app.Point.prototype.removeConstraint = function() {
  this.constrain = false;
  this.pinned = false;
};

app.Point.prototype.addForce = function(x, y) {
  this.vx += x;
  this.vy += y;
};

app.Point.prototype.pin = function() {
  this.pinned = true;
};

app.Point.prototype.resolveConstraint = function(point) {
  if (!this.constrain) {
    return;
  }

  var CANVAS_HEIGHT = app.Constants.CANVAS_HEIGHT;
  var TEAR_DISTANCE = app.Constants.TEAR_DISTANCE;
  var SPACING = app.Constants.SPACING;

  var differenceX = this.x - point.x;
  var differenceY = this.y - point.y;
  var dist = app.utils.distance(differenceX, differenceY);
  var diff = (SPACING - dist) / dist;

  if (this.game_.tools.clipper.isSelected && differenceY > TEAR_DISTANCE) {
    this.removeConstraint();
  }

  var px = differenceX * diff * 0.5;
  var py = differenceY * diff * 0.5;

  this.x += px;
  this.y += py;
  point.x -= px;
  point.y -= py;
};


/**
 * @typedef {{x: number, y: number, pinned: bool, rotation: number, constraints: Array<number>}}
 */
app.Point.Options;
