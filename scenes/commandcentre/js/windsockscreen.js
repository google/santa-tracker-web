goog.provide('app.WindsockScreen');

goog.require('app.shared.utils');



/**
 * Main WindsockScreen class
 * @constructor
 */
app.WindsockScreen = function() {
  this.isActive = false;
};

app.WindsockScreen.prototype = {

  /**
   * Tell screen that it is visible
   * @public
   */
  onActive: function() {
    this.isActive = true;
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
