goog.provide('SB.Object.Text');

goog.require('SB.Object.Renderable');
goog.require('app.shared.pools');

/**
 * Represents a text to show score or time gained.
 * @param {object} position The global position of the object.
 * @param {number} rotation The local rotation of the object.
 * @param {object} scale The local scale of the object.
 * @constructor
 * @extends SB.Object.Renderable
 */
SB.Object.Text = function(position, rotation, scale) {

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
   * Alpha channel of the text color.
   * @type {number}
   */
  this.alpha = 0;

  /**
   * Whether this object is available for use.
   * @type {boolean}
   */
  this.active = false;

  /**
   * Is this text a child of the world.
   * @type {boolean}
   */
  this.inWorld = false;
};

SB.Object.Text.prototype = new SB.Object.Renderable();

SB.Object.Text.prototype.onInit = function(position, text, worldEl) {
  this.position = position;
  this.text = text;
  this.alpha = 1;
  this.active = true;
  this.lastUpdateTime = +new Date;
  if (!this.inWorld) {
    this.inWorld = true;
    worldEl.addChild(this);
  }
};

SB.Object.Text.prototype.onDispose = function() {
  this.active = false;
  this.alpha = 0;
};

app.shared.pools.mixin(SB.Object.Text);

/**
 * Draws the present to the canvas context.
 * @param {!CanvasRenderingContext2D} ctx
 */
SB.Object.Text.prototype.render = function(ctx) {
  if (!this.active) return;

  // Calculate delta since last frame.
  var updateTime = +new Date;
  var deltaSec = Math.min(1000, updateTime - this.lastUpdateTime) / 1000;
  this.lastUpdateTime = updateTime;

  this.alpha -= 2 * deltaSec;

  if (this.alpha < 0.01) {
    this.remove();
  }

  ctx.save();
  ctx.beginPath();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0, 170, 232, ' + this.alpha + ')';
  ctx.font = '800 48px Roboto';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.fillText('+ ' + this.text, 0, -50);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
};
