goog.provide('app.Present');

goog.require('app.shared.pools');

/**
 * Simple present graphic manager.
 * @param {!app.Scene} scene which owns this present.
 * @constructor
 */
app.Present = function(scene) {
  this.el = Blockly.createSvgElement('svg', {
    'class': 'present',
    'viewBox': '0 0 61 40'
  }, null);
  var useEl = Blockly.createSvgElement('use', null, this.el);
  useEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#maze-present');

  scene.presentsEl.appendChild(this.el);
};
app.shared.pools.mixin(app.Present);

/**
 * Initializes a present from the pool.
 * @param {number} x tile position.
 * @param {number} y tile position.
 * @param {number} level which employs this present.
 */
app.Present.prototype.onInit = function(x, y, level) {
  this.x = x;
  this.y = y;
  this.level = level;

  x = x * app.Scene.TILE_OUTER_SIZE;
  y = y * app.Scene.TILE_OUTER_SIZE;
  goog.style.setStyle(this.el, 'transform', 'translate(' + x + 'em, ' + y + 'em)');
  this.el.style.display = 'block';
};

/**
 * Resets the present so it can be released to the pool.
 */
app.Present.prototype.onDispose = function() {
  this.el.style.display = 'none';
};
