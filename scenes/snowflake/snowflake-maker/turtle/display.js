/**
 * Blockly Games: Snowflake
 *
 * Copyright 2016 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Handles displaying and resizing elements on coding screen.
 * @author madeeha@google.com (Madeeha Ghori)
 */

goog.provide('Snowflake.Display');

/**
 * Main display class.
 * Handles size/placement of elements on screen and drawing on canvas.
 * @constructor
 * @export
 */
Snowflake.Display = function () {
  this.initializeBlocklyDiv();

  this.displaySize_ = 300;
  this.ctxDisplay_ = document.getElementById('display').getContext('2d');
  this.ctxScratch = document.getElementById('scratch').getContext('2d');
  this.ctxOutput_ = document.getElementById('output').getContext('2d');
  this.visualization_ = document.getElementById('visualization');
  this.paper_ = document.getElementById('paperDiv');
  this.x_ = Snowflake.Display.HEIGHT / 2;
  this.y_ = Snowflake.Display.WIDTH / 2;
  this.heading_ = 0;
  this.penDownValue_ = true;
  this.turtleIsVisible_ = true;

  /**
   * Whether the tutorial has already been shown.
   * @type boolean
   */
  this.hasShownTutorial = false;

  /**
   * Tutorial to show the user how to drag blocks.
   * Displays after the first run and stays visible until the user drags in a block.
   * @type Snowflake.Tutorial
   */
  this.tutorial =  new Snowflake.Tutorial(document.getElementById('blocklyTutorial'));

  /**
   * maybeShowTutorial_ is passed into Snowflake.Execute.runCode as a callback in snowflake.js.
   * Use the public function maybeShowTutorial to have the right this when used as a callback.
   */
  this.maybeShowTutorialWrapper = this.maybeShowTutorial_.bind(this);

  // Bind an resize function, if it exists.
  this.resizeWrapper_ = this.resizeVisualization.bind(this);
  // Onresize will be called as soon as we register it in IE, so we hold off
  // on registering it until everything it references is defined.
  window.addEventListener('resize', this.resizeWrapper_);
  this.resizeVisualization();
};

Snowflake.Display.HEIGHT = 500;
Snowflake.Display.WIDTH = 500;
Snowflake.Display.SHADOW_OFFSET = 6;

Snowflake.Display.MIN_LINE_WIDTH = 6;
Snowflake.Display.LINE_SCALE = 10;

// The desired padding on the coding page affects the height of the paper.
Snowflake.Display.BIG_PADDING = 128;
Snowflake.Display.SMALL_PADDING = 80;
// The window height at which we use smaller padding instead of big padding.
Snowflake.Display.MAX_HEIGHT = 700;
// Padding on either side of the visualization element.
Snowflake.Display.VIS_PADDING_WIDTH = 32;
/**
 * How many times the "now repeat" message should show up.
 * @type number
 */
Snowflake.Display.MAX_RUNS_WITH_REPEAT_MSG = 3;

/**
 * Whether to show the "Code your snowflake" message on page load.
 * @type boolean
 */
Snowflake.Display.ENABLE_CODE_SNOWFLAKE_MESSAGE = true;

/**
 * Whether to fill in the shapes instead of outlining them.
 * @type boolean
 */
Snowflake.Display.FILL = false;

Snowflake.Display.prototype.initializeBlocklyDiv = function() {
  window.addEventListener('scroll', function() {
    Blockly.DropDownDiv.hideWithoutAnimation();
  });
  Snowflake.workspace = Blockly.inject('blocklyDiv', {
        comments: false,
        disable: true,
        collapse: false,
        media: 'media/',
        readOnly: false,
        rtl: false,
        scrollbars: false,
        toolbox: this.getToolboxElement_(),
        trashcan: false,
        horizontalLayout: true,
        toolboxPosition: 'end',
        sounds: false,
        colours: {
          workspace: 'rgba(255,255,0,0)',
          flyout: 'rgba(255,255,0,0)',
        }
  });

  // Set the color of insertion markers for all blocks.
  Blockly.Colours.insertionMarker = "#795548";

  // Scratch-blocks is accounting for the size of the flyout in a way that we don't want.
  Snowflake.workspace.translate(0,0);
  Snowflake.workspace.scrollY = 0;

  /* We don't want topBlocks other than the starter block being converted to code.
   * This disables blocks that aren't connected to the starter block so that they don't run. */
  Snowflake.workspace.addChangeListener(Blockly.Events.disableOrphans);
};

/**
 * Resize visualization element to fit screen size.
 */
Snowflake.Display.prototype.resizeVisualization = function() {
  var totalHeight = this.visualization_.offsetHeight;
  var totalWidth = this.visualization_.offsetWidth;
  var paddingHeight = window.innerHeight > Snowflake.Display.MAX_HEIGHT ?
      Snowflake.Display.BIG_PADDING: Snowflake.Display.SMALL_PADDING;
  this.displaySize_ = Math.min(
      totalWidth - Snowflake.Display.VIS_PADDING_WIDTH,
      totalHeight - paddingHeight);
  this.paper_.style.height = this.displaySize_ + 'px';
  this.paper_.style.width = this.displaySize_ + 'px';
  document.getElementById('display').height = this.displaySize_;
  document.getElementById('display').width = this.displaySize_;
  this.display();
  Blockly.DropDownDiv.hideWithoutAnimation();
};

/**
 * Show the tutorial if it hasn't been shown before, and hide the
 * "code your snowflake" message.
 * @private
 */
Snowflake.Display.prototype.maybeShowTutorial_ = function() {
  if (!this.hasShownTutorial) {
    this.tutorial.schedule();
    this.hasShownTutorial = true;
    if (Snowflake.Display.ENABLE_CODE_SNOWFLAKE_MESSAGE) {
      document.getElementById('snowflake_code_message').style.display = 'none';
    }
  }
};

/**
 * Show the "now repeat" message if it has never been shown before.
 */
Snowflake.Display.prototype.showRepeatMessage = function() {
  if (Snowflake.Execute.runCount < Snowflake.Display.MAX_RUNS_WITH_REPEAT_MSG) {
    // Don't show the first time, when we're auto-playing the starter code.
    if (Snowflake.Execute.runCount != -1) {
      document.getElementById('now_repeat_message').style.display = 'block';
    }
    Snowflake.Execute.runCount++;
  }
};

/**
 * Hide the "now repeat" message.
 */
Snowflake.Display.prototype.hideRepeatMessage = function() {
  document.getElementById('now_repeat_message').style.display = 'none';
};

/**
* Updates the current bounds of the rendered snowflake. Takes in a set of bounds
* for a drawing segment and expands the global bounds if necessary.
* @param {array} bounds The bounds of the drawing segment just drawn.
*/
Snowflake.Display.prototype.updateBounds = function(bounds) {
  if (Snowflake.boundsAreEmpty()) {
    Snowflake.bounds = bounds;
  } else {
    Snowflake.bounds[0] = Math.min(Snowflake.bounds[0], bounds[0]);
    Snowflake.bounds[1] = Math.min(Snowflake.bounds[1], bounds[1]);
    Snowflake.bounds[2] = Math.max(Snowflake.bounds[2], bounds[2]);
    Snowflake.bounds[3] = Math.max(Snowflake.bounds[3], bounds[3]);
  }
};

/**
 * Copy the scratch canvas to the display canvas. Add a turtle marker.
 */
Snowflake.Display.prototype.display = function() {
  var display = this.ctxDisplay_;
  var canvas = display.canvas;
  // Clip the canvas to its rendered size (centered)
  display.beginPath();
  display.rect(0, 0, canvas.width, canvas.height);
  display.clearRect(0, 0, canvas.width, canvas.height);
  display.fillStyle = "rgba(0, 0, 255, 0)";
  display.fill();

  // Draw the user layer.
  var offset = (Snowflake.Display.WIDTH - this.displaySize_) / 2;
  display.globalCompositeOperation = 'source-over';
  display.drawImage(this.ctxScratch.canvas, -offset, -offset);

  // Draw the turtle.
  if (this.turtleIsVisible_) {
    this.drawTurtle(offset);
  }
};

/**
 * Copy snowflake from scratch canvas to the output canvas.
 * @returns output canvas with snowflake drawn on it.
 */
Snowflake.Display.prototype.drawSnowflake = function() {
  if (Snowflake.sharing && Snowflake.boundsAreEmpty()) {
    Snowflake.bounds = [this.displaySize_, this.displaySize_];
  }

  var padding = this.ctxScratch.lineWidth;
  // We always want a square image, so use the min of x and y for both.
  var min = Math.min(Snowflake.bounds[0], Snowflake.bounds[1]) - padding;
  // Restrict the min to between 0 and 150
  min = Math.min(150, Math.max(0, min));
  // Similarly, max should use the max of x and y
  var max = Math.max(Snowflake.bounds[2], Snowflake.bounds[3]) + padding;
  // And restrict to between 350 and WIDTH
  var max = Math.max(350, Math.min(Snowflake.Display.WIDTH, max));

  var width = (max - min) + Snowflake.Display.SHADOW_OFFSET;
  var height = width;
  this.ctxOutput_.canvas.width = width;
  this.ctxOutput_.canvas.height = height;
  this.ctxOutput_.globalCompositeOperation = 'source-over';
  this.ctxOutput_.shadowBlur = 0;
  this.ctxOutput_.shadowOffsetX = Snowflake.Display.SHADOW_OFFSET;
  this.ctxOutput_.shadowOffsetY = Snowflake.Display.SHADOW_OFFSET;
  this.ctxOutput_.shadowColor = "rgba(0,0,0,0.06)";
  this.ctxOutput_.drawImage(this.ctxScratch.canvas, -min, -min);

  return this.ctxOutput_;
};

/**
 * Draw the turtle on the display canvas.
 * @param {number} offset Where to draw the turtle.
 */
Snowflake.Display.prototype.drawTurtle = function(offset) {
    var x = this.x_ - offset;
    var y = this.y_ - offset;

    // Make the turtle the colour of the pen.
    this.ctxDisplay_.strokeStyle = this.ctxScratch.strokeStyle;
    this.ctxDisplay_.fillStyle = this.ctxScratch.fillStyle;

    // Draw the turtle body.
    var radius = this.ctxScratch.lineWidth / 2 + 10;
    this.ctxDisplay_.beginPath();
    this.ctxDisplay_.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.ctxDisplay_.lineWidth = 3;
    this.ctxDisplay_.stroke();

    // Draw the turtle head.
    var WIDTH = 0.3;
    var HEAD_TIP = 10;
    var ARROW_TIP = 4;
    var BEND = 6;
    var radians = 2 * Math.PI * this.heading_ / 360;
    var tipX = x + (radius + HEAD_TIP) * Math.sin(radians);
    var tipY = y - (radius + HEAD_TIP) * Math.cos(radians);
    radians -= WIDTH;
    var leftX = x + (radius + ARROW_TIP) * Math.sin(radians);
    var leftY = y - (radius + ARROW_TIP) * Math.cos(radians);
    radians += WIDTH / 2;
    var leftControlX = x + (radius + BEND) * Math.sin(radians);
    var leftControlY = y - (radius + BEND) * Math.cos(radians);
    radians += WIDTH;
    var rightControlX = x + (radius + BEND) * Math.sin(radians);
    var rightControlY = y - (radius + BEND) * Math.cos(radians);
    radians += WIDTH / 2;
    var rightX = x + (radius + ARROW_TIP) * Math.sin(radians);
    var rightY = y - (radius + ARROW_TIP) * Math.cos(radians);

    this.ctxDisplay_.beginPath();
    this.ctxDisplay_.moveTo(tipX, tipY);
    this.ctxDisplay_.lineTo(leftX, leftY);
    this.ctxDisplay_.bezierCurveTo(leftControlX, leftControlY,
        rightControlX, rightControlY, rightX, rightY);
    this.ctxDisplay_.closePath();
    this.ctxDisplay_.fill();
  };

/**
 * Find the toolbox XML in the page.
 * return {!Element} XML document
 * @private
 */
Snowflake.Display.prototype.getToolboxElement_ = function() {
  return document.getElementById('toolbox');
};

/**
 * Reset the position of the turtle.
 */
Snowflake.Display.prototype.resetPosition = function() {
  this.x_ = Snowflake.Display.HEIGHT / 2;
  this.y_ = Snowflake.Display.WIDTH / 2;
  this.heading_ = 0;
  this.penDownValue_ = true;
  this.turtleIsVisible_ = true;
};

/**
 * Reset the style of the drawing.
 */
Snowflake.Display.prototype.resetStyle = function() {
  this.ctxScratch.strokeStyle = '#29b6f6';
  this.ctxScratch.fillStyle = '#29b6f6';
  this.ctxScratch.lineWidth = 6;
  this.ctxScratch.lineCap = 'round';
  this.ctxScratch.lineJoin = 'round';
};

/**
 * Stamp a polygon of numSides number of sides. Currently ensures that
 * triangles, squares, and pentagons of size X are all the same height. No
 * guarantees for polygons with more than 5 sides.
 * @param {number} size Desired height of polygon.
 * @param {number} numSides Number of sides polygon should have.
 * @param {string} id Id of block to be highlighted.
 */
Snowflake.Display.prototype.stampPolygon = function(size, numSides, id) {
  this.ctxScratch.lineWidth = Snowflake.Display.MIN_LINE_WIDTH;
  var sideLen;
  var bounds = [this.x_, this.y_, this.x_, this.y_]; // [minx, miny, maxx, maxy]
  switch(numSides) {
    case 4:
      sideLen = size;
      break;
    case 5:
      sideLen = size * 0.64984; // ratio of side to height for a pentagon
      break;
    default:
      // 2/sqrt(3)=1.1547 is the side of a triangle relative to its height
      sideLen = size * 1.1547;
      break;
  }
  this.ctxScratch.beginPath();
  this.ctxScratch.moveTo(this.x_, this.y_);
  this.turnWithoutAnimation(-90);
  this.drawLineWithoutMoving(sideLen / 2);
  bounds = [Math.min(bounds[0], this.x_), Math.min(bounds[1], this.y_),
            Math.max(bounds[2], this.x_), Math.max(bounds[3], this.y_)];
  for (var i = 0; i < numSides - 1; i++) {
    this.turnWithoutAnimation(360 / numSides);
    this.drawLineWithoutMoving(sideLen);
    bounds = [Math.min(bounds[0], this.x_), Math.min(bounds[1], this.y_),
              Math.max(bounds[2], this.x_), Math.max(bounds[3], this.y_)];
  }
  this.turnWithoutAnimation(360/numSides);
  this.drawLineWithoutMoving(sideLen / 2);
  bounds = [Math.min(bounds[0], this.x_), Math.min(bounds[1], this.y_),
            Math.max(bounds[2], this.x_), Math.max(bounds[3], this.y_)];
  this.turnWithoutAnimation(90);
  this.ctxScratch.closePath();
  if (Snowflake.Display.FILL) {
    this.ctxScratch.fill();
  }
  if (id) {
    Snowflake.Execute.animate(id);
  }
  this.updateBounds(bounds);
};

/**
 * Draws a line without moving the turtle visually.
 * @param {number} distance How long the line should be.
 */
Snowflake.Display.prototype.drawLineWithoutMoving = function(distance) {
  if (this.penDownValue_ && !Snowflake.Display.FILL) {
    this.ctxScratch.beginPath();
    this.ctxScratch.moveTo(this.x_, this.y_);
  }
  if (distance) {
    this.x_ += distance * Math.sin(2 * Math.PI * this.heading_ / 360);
    this.y_ -= distance * Math.cos(2 * Math.PI * this.heading_ / 360);
    var bump = 0;
  } else {
    // WebKit (unlike Gecko) draws nothing for a zero-length line.
    var bump = 0.1;
  }
  if (this.penDownValue_) {
    this.ctxScratch.lineTo(this.x_, this.y_ + bump);
    if (!Snowflake.Display.FILL) {
      this.ctxScratch.stroke();
    }
  }
};

/**
 * Turns without moving the turtle visually.
 * @param {number} angle Number of degrees to turn. Clockwise is positive.
 */
Snowflake.Display.prototype.turnWithoutAnimation = function(angle) {
  this.heading_ += angle;
  this.heading_ %= 360;
  if (this.heading_ < 0) {
    this.heading_ += 360;
  }
};

/**
 * Move the turtle forward or backward.
 * @param {number} distance Pixels to move.
 * @param {?string} id ID of block to be highlighted.
 */
Snowflake.Display.prototype.move = function(distance, id) {
  if (distance) {
    this.x_ += distance * Math.sin(2 * Math.PI * this.heading_ / 360);
    this.y_ -= distance * Math.cos(2 * Math.PI * this.heading_ / 360);
    var bump = 0;
  } else {
    // WebKit (unlike Gecko) draws nothing for a zero-length line.
    var bump = 0.1;
  }
  Snowflake.Execute.animate(id);
};

/**
 * Turn the turtle left or right.
 * @param {number} angle Degrees to turn clockwise.
 * @param {?string} id ID of block to be highlighted.
 */
Snowflake.Display.prototype.turn = function(angle, id) {
  this.heading_ += angle;
  this.heading_ %= 360;
  if (this.heading_ < 0) {
    this.heading_ += 360;
  }
  Snowflake.Execute.animate(id);
};

/**
 * Change the colour of the pen.
 * @param {string} colour Hexadecimal #rrggbb colour string.
 * @param {?string} id ID of block to be highlighted.
 */
Snowflake.Display.prototype.penColour = function(colour, id) {
  this.ctxScratch.strokeStyle = colour;
  this.ctxScratch.fillStyle = colour;
  Snowflake.Execute.animate(id);
};