goog.provide('app.Scene');

goog.require('app.Fan');
goog.require('app.FanStateManager');
goog.require('app.Rudolf');
goog.require('app.Snow');
goog.require('app.Snowblower');

/**
 * Main class for Windtunnel scene.
 *
 * @param {Element} context DOM element that wraps the scene.
 * @constructor
 * @export
 */
app.Scene = function(context) {
  this.context_ = $(context);

  this.rudolf = new app.Rudolf(this.context_.find('.rudolf-wrap'));

  this.snowblower = new app.Snowblower(this.context_.find('.snowblower'));

  this.fanStateManager = new app.FanStateManager(context, this.rudolf);
  this.fan = new app.Fan(this.context_.find('.fan-base'),
      this.fanStateManager);

  this.snow = new app.Snow(this.context_.find('.snow-canvas')[0],
      this.snowblower, this.fanStateManager);

  this.init_();
};

/**
 * Initializes the scene.
 *
 * @private
 */
app.Scene.prototype.init_ = function() {
  this.fan.init();
  this.fanStateManager.init();
  this.rudolf.init();
  this.snowblower.init();
  this.snow.init();
};

/**
 * Stops the scene.
 * @export
 */
app.Scene.prototype.destroy = function() {
  this.fan.destroy();
  this.fanStateManager.destroy();
  this.rudolf.destroy();
  this.snowblower.destroy();
  this.snow.destroy();
};
