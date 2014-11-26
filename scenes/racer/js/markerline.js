goog.provide('SB.Object.MarkerLine');

goog.require('SB.Object.Renderable');

/**
 * Represents the red line over which you drive Santa and
 * Rudolf. Triggers a level up and some points.
 * @param {object} position The global position of the object.
 * @param {number} rotation The local rotation of the object.
 * @param {object} scale The local scale of the object.
 * @constructor
 * @extends SB.Object.Renderable
 */
SB.Object.MarkerLine = function (position, rotation, scale) {

  /**
   * Whether the marker line should include 3, 2, 1 numbers below itself
   * as per the start of the game.
   * @type {boolean}
   * @private
   */
  this.drawNumbers_ = true;

  /**
   * The position of the object in world space.
   * @type {object}
   */
  this.position = position || {x: 0, y: 0};

  /**
   * The scale of the object in local space.
   * @type {object}
   */
  this.scale = scale || {x: 1, y: 1};

  /**
   * The rotation of the object in local space.
   * @type {number}
   */
  this.rotation = rotation || 0;

  /**
   * Whether the marker has been triggered. Set to true
   * when the user drives over it and reset once the
   * marker has been moved to its next position. Prevents
   * multiple hits from being registered.
   * @type {boolean}
   */
  this.triggered = false;

  this.reset();
};

SB.Object.MarkerLine.prototype = new SB.Object.Renderable();

/**
 * Draws the marker line to the canvas.
 */
SB.Object.MarkerLine.prototype.render = function (ctx) {
  // line shadow
  ctx.fillStyle = "#f9c6c8";
  ctx.fillRect(2, -1, window.worldWidth - 4, 4);

  // the line
  ctx.fillStyle = "#e91c24";
  ctx.fillRect(2, -2, window.worldWidth - 4, 4);

  // the level number
  if (this.showLevel) {
    ctx.save();
    ctx.beginPath();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#E5E5E5";
    ctx.font = "800 268px Lobster";
    ctx.fillText(this.level, this.center || window.worldWidth * 0.5, 180);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
};

/**
 * Reset the marker line.
 */
SB.Object.MarkerLine.prototype.reset = function () {
  /**
   * The number of the next level.
   * @type {number}
   */
  this.level = 1;

  /**
   * The center of the path.
   * @type {number}
   */
  this.center = window.worldWidth * 0.5;

  /**
   * Show the level number before the line?
   * @type {boolean}
   */
  this.showLevel = true;
};
