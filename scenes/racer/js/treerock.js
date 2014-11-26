goog.provide('SB.Object.TreeRock');

goog.require('SB.Object.Renderable');

/**
 * Represents the generic scenery (trees, rocks) that Santa must avoid.
 * @param {object} position The global position of the object.
 * @param {number} rotation The local rotation of the object.
 * @param {object} scale The local scale of the object.
 * @param {number} radius The radius of the hit area for collisions.
 * @constructor
 * @extends SB.Object.Renderable
 */
SB.Object.TreeRock = function (position, rotation, scale) {

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
   * The sprite for the tree / rock.
   * @type {HTMLImageElement}
   * @const
   */
  this.IMAGE = SB.Assets.get("tree");

  /**
   * Whether this object is available for use.
   * @type {boolean}
   */
  this.active = false;

  /**
   * The X coordinate to use for the tree / rock image. The sprite
   * contains multiple images.
   * @private
   */
  this.imageX_ = 0;

};

SB.Object.TreeRock.prototype = new SB.Object.Renderable();

/**
 * Chooses a tree or rock image from the sprite at random.
 */
SB.Object.TreeRock.prototype.chooseRender = function () {
  this.imageX_ = 0;

  if (Math.random() > 0.8) {
    this.imageX_ = Math.floor(Math.random() * 3) * 130;
  }
};

/**
 * Renders the scenery to the canvas context.
 */
SB.Object.TreeRock.prototype.render = function (ctx) {
  ctx.save();
  ctx.translate(-50, -50);
  ctx.drawImage(this.IMAGE, this.imageX_,
    0, 130, 100, 0, 0, 130, 100);
  ctx.restore();
};
