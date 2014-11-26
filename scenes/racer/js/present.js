goog.provide('SB.Object.Present');

goog.require('SB.Object.Renderable');

/**
 * Represents a present that Santa can pick up for extra time
 * and points.
 * @param {object} position The global position of the object.
 * @param {number} rotation The local rotation of the object.
 * @param {object} scale The local scale of the object.
 * @param {number} radius The radius of the hit area for collisions.
 * @constructor
 * @extends SB.Object.Renderable
 */
SB.Object.Present = function(position, rotation, scale) {

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
   * The sprite for the present.
   * @type {HTMLImageElement}
   * @const
   */
  this.IMAGE = SB.Assets.get("present");

  /**
   * Whether this object is available for use.
   * @type {boolean}
   */
  this.active = false;

  /**
   * The X coordinate to use for the present image. The sprite
   * contains multiple images.
   * @private
   */
  this.imageX_ = 0;

};

SB.Object.Present.prototype = new SB.Object.Renderable();

/**
 * Chooses a present image from the sprite at random.
 */
SB.Object.Present.prototype.chooseRender = function () {
  this.imageX_ = Math.floor(Math.random() * 4) * 64;
};

/**
 * Draws the present to the canvas context.
 */
SB.Object.Present.prototype.render = function (ctx) {
  ctx.save();
  ctx.translate(-22, -17);
  ctx.drawImage(this.IMAGE, this.imageX_,
    0, 64, 64, 0, 0, 64, 64);
  ctx.restore();
};
