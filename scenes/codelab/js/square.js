goog.provide('app.DecoratedSquare');
goog.provide('app.EmptySquare');
goog.provide('app.TreeSquare');

goog.require('app.shared.pools');
goog.require('goog.dom');
goog.require('goog.style');

/**
 * Abstract base-class which represents a square on the maze.
 * @param {!app.Scene} scene which owns this square.
 * @constructor
 */
app.Square = function(scene) {
  this.el = null; // Created by subclass.
  this.owner = scene;
  this.x = null;
  this.y = null;
};

/**
 * Initialises a pooled square on the map.
 * @param {number} x tile position.
 * @param {number} y tile position.
 */
app.Square.prototype.onInit = function(x, y) {
  this.x = x;
  this.y = y;

  x = x * app.Scene.TILE_OUTER_SIZE;
  y = y * app.Scene.TILE_OUTER_SIZE;
  var transform = 'translate(' + x + 'em, ' + y + 'em)';
  goog.style.setStyle(this.el, 'transform', transform);
  this.el.style.display = 'block';
};

/**
 * Cleans up the instance before being returned to the pool.
 */
app.Square.prototype.onDispose = function() {
  this.el.style.display = 'none';
};

/**
 * Draws an empty square on the maze.
 * @param {!app.Scene} scene which owns this square.
 * @constructor
 */
app.EmptySquare = function(scene) {
  app.Square.call(this, scene);

  this.el = goog.dom.createDom('div', 'square square--empty');
  scene.bgEl.appendChild(this.el);
};
goog.inherits(app.EmptySquare, app.Square);
app.shared.pools.mixin(app.EmptySquare);

/**
 * Draws a tree square on the maze.
 * @param {!app.Scene} scene which owns this square.
 * @constructor
 */
app.TreeSquare = function(scene) {
  app.Square.call(this, scene);

  this.el = Blockly.createSvgElement('svg', {
    'class': 'square square--tree'
  }, null);
  var useEl = Blockly.createSvgElement('use', null, this.el);
  useEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#maze-tree');

  scene.bgEl.appendChild(this.el);
};
goog.inherits(app.TreeSquare, app.Square);
app.shared.pools.mixin(app.TreeSquare);


/**
 * An empty square which has a special graphic on top of it.
 * @param {!app.Scene} scene which owns this square.
 * @constructor
 */
app.DecoratedSquare = function(scene) {
  app.Square.call(this, scene);

  this.el = Blockly.createSvgElement('svg', {
    'class': 'square square--decorated'
  }, null);
  this.useEl_ = Blockly.createSvgElement('use', null, this.el);

  scene.bgEl.appendChild(this.el);
};
goog.inherits(app.DecoratedSquare, app.Square);
app.shared.pools.mixin(app.DecoratedSquare);

/**
 * Map from tile types to decoration names.
 * @type {!Object<app.TileType, string>}
 * @const
 */
app.DecoratedSquare.DECORATIONS = {};
app.DecoratedSquare.DECORATIONS[app.TileType.SLED] = 'sled';
app.DecoratedSquare.DECORATIONS[app.TileType.TUTORIAL_ARROW] = 'arrow';
app.DecoratedSquare.DECORATIONS[app.TileType.YETI] = 'yeti';

/**
 * Initialises a pooled decorated square. Setting the appropriate graphic.
 * @param {number} x tile position.
 * @param {number} y tile position.
 * @param {app.TileType} tile information for what decoration to use.
 */
app.DecoratedSquare.prototype.onInit = function(x, y, tile) {
  app.Square.prototype.onInit.call(this, x, y);

  this.decoration = app.DecoratedSquare.DECORATIONS[tile];
  if (!this.decoration) {
    throw new Error('Unknown decoration: ' + tile);
  }

  this.el.setAttribute('class', 'square square--decorated square--' + this.decoration);
  this.useEl_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                             '#maze-' + this.decoration);
  this.el.style.display = 'block';
};
