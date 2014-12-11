goog.provide('app.WindsockScreen');

goog.require('app.Constants');
goog.require('app.WaveMotion');
goog.require('app.shared.utils');



/**
 * Main WindsockScreen class
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Element} elem a DOM element context for the screen
 * @constructor
 */
app.WindsockScreen = function(elem) {
  this.$el = $(elem);
  this.isActive = false;
  this.startTime = undefined;

  this.windsockPolygons = this.$el.find(app.Constants.WINDSOCK_POLYGONS_SELECTOR);
  this.windsock = new app.WaveMotion(this.windsockPolygons);

  this.onFrame_ = this.onFrame_.bind(this);
};

app.WindsockScreen.prototype = {

  /**
   * Runs on each frame of a requestAnimationFrame
   * Schedules next frame automatically as long as screen is visible
   * @private
   */
  onFrame_: function() {
    this.windsock.update(Date.now() - this.startTime);

    if (this.isActive) {
      app.shared.utils.requestAnimFrame(this.onFrame_);
    }
  },

  /**
   * Tell screen that it is visible
   * @public
   */
  onActive: function() {
    this.startTime = Date.now();
    this.isActive = true;
    this.onFrame_();

    window.santaApp.fire('sound-trigger', 'command_wind_start');
  },

  /**
   * Tell screen that it is hidden
   * @public
   */
  onInactive: function() {
    this.isActive = false;
    window.santaApp.fire('sound-trigger', 'command_wind_stop');
  }

};
