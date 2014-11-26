goog.provide('SB.Object.Rudolf');

goog.require('SB.Object.Renderable');

/**
 * Represents Rudolf in the game.
 * @param {object} position The global position of the object.
 * @param {number} rotation The local rotation of the object.
 * @param {object} scale The local scale of the object.
 * @constructor
 * @extends SB.Object.Renderable
 */
SB.Object.Rudolf = function (position, rotation, scale) {

  /**
   * Rudolf's maximum velocity.
   * @type {number}
   * @const
   */
  this.MAX_VELOCITY = 15;

  /**
   * Rudolf's maximum deviation from true north, in radians.
   * @type {number}
   * @const
   */
  this.MAX_ANGLE = 0.35;

  /**
   * The sprite for rendering Rudolf
   * @type {HTMLImageElement}
   * @const
   */
  this.IMAGE = SB.Assets.get("rudolf");

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
   * Rudolf's velocity.
   * @type {number}
   */
  this.velocity = 0;

  /**
   * The target velocity used for easing purposes.
   * @type {number}
   */
  this.targetVelocity = 0;

  /**
   * The target rotation used for easing purposes.
   * @type {number}
   */
  this.targetRotation = 0;

  /**
   * Whether Rudolf has rebounded from a collision and
   * is still immune to further collisions.
   * @type {boolean}
   */
  this.rebound = false;

  /**
   * The hit area used for collisions.
   * @type {number}
   */
  this.radius = 25;

};

SB.Object.Rudolf.prototype = new SB.Object.Renderable();

/**
 * Lower speed on hit.
 */
SB.Object.Rudolf.prototype.hit = function () {
  this.velocity = this.MAX_VELOCITY / 3;
};

/**
 * Clamps a value internally, e.g. rotation / velocity
 * @param {number} value The starting value.
 * @param {number} max The maximum value.
 * @param {number} min The minimum value.
 * @return {number} The value clamped to max and min.
 * @private
 */
SB.Object.Rudolf.prototype.limit_ = function (value, max, min) {
  return Math.min(max, Math.max(min, value));
};

/**
 * Updates Rudolf's target rotation.
 * @param {number} value The rotation delta, in radians.
 */
SB.Object.Rudolf.prototype.turn = function (value) {
  var amount = value -
      (value * 0.3 * (this.targetVelocity / this.MAX_VELOCITY));

  this.targetRotation += amount;
};

/**
 * Causes Rudolf to accelerate.
 * @param {number} value The velocity delta.
 */
SB.Object.Rudolf.prototype.accelerate = function (value) {
  this.targetVelocity += value;
};

/**
 * Causes Rudolf to decelerate.
 * @param {number} value The velocity delta.
 */
SB.Object.Rudolf.prototype.decelerate = function (value) {
  this.targetVelocity -= value;
};

/**
 * Updates Rudolf's velocity, rotation and position.
 */
SB.Object.Rudolf.prototype.update = function () {

  this.targetVelocity = this.limit_(this.targetVelocity,
      this.MAX_VELOCITY, 0);
  this.targetRotation = this.limit_(this.targetRotation,
      this.MAX_ANGLE, -this.MAX_ANGLE);

  var velocityMultiplier = this.velocity > this.targetVelocity ||
      this.velocity < this.MAX_VELOCITY / 3 ? 0.2 : 0.01;
  this.velocity += (this.targetVelocity - this.velocity) * velocityMultiplier;
  this.rotation += (this.targetRotation - this.rotation) * 0.2;

  this.position.x += Math.sin(this.rotation) * (this.velocity);
  this.position.y -= Math.cos(this.rotation) * (this.velocity);

  var newX = this.limit_(this.position.x, window.worldWidth - 20, 20);
  if (newX != this.position.x) {
    this.targetRotation = 0;
  }

  this.position.x = newX;

  window.santaApp.fire('sound-trigger', {
    name: 'rc_sled_speed',
    args: [(this.targetVelocity / this.MAX_VELOCITY)]
  });
};

/**
 * Draws Rudolf to the canvas context.
 */
SB.Object.Rudolf.prototype.render = function (ctx) {
  ctx.fillStyle = "#FF0000";
  ctx.save();
  ctx.translate(-15, -20);
  ctx.drawImage(this.IMAGE, 0, 0);
  ctx.restore();
};
