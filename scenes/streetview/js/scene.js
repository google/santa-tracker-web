goog.provide('app.Scene');

goog.require('app.Constants');
goog.require('app.Viewport');



/**
 * Main scene class.
 * @param {!Element} el DOM element containing the scene.
 * @constructor
 * @export
 */
app.Scene = function(el) {
  this.elem = $(el);
  this.blocksElem = this.elem.find(app.Constants.SELECTOR_BLOCKS);
  this.blocksContainerElem = this.elem.find(app.Constants.SELECTOR_BLOCKS_CONTAINER);
  this.viewport = new app.Viewport(this.elem, this.blocksElem, this.blocksContainerElem);
  this.viewport.init();
};


/**
 * Clean up
 * @export
 */
app.Scene.prototype.destroy = function() {
  this.viewport.destroy();
  this.blocksElem = null;
  this.blocksContainerElem = null;
};
