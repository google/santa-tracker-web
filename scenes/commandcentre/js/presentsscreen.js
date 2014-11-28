goog.provide('app.PresentsScreen');

goog.require('app.Constants');
goog.require('app.PresentsBelt');
goog.require('app.shared.utils');



/**
 * Main PresentsScreen class
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Element} elem a DOM element context for the screen
 * @constructor
 */
app.PresentsScreen = function(elem) {
  this.$el = $(elem);
  this.$leftBeltEl = this.$el.find('.presents-screen__belt--left');
  this.$rightBeltEl = this.$el.find('.presents-screen__belt--right');
  this.isActive = false;
};

app.PresentsScreen.prototype = {

  /**
   * Tell screen that it is visible
   * @public
   */
  onActive: function() {
    this.isActive = true;
    this.leftBelt = new app.PresentsBelt(this.$leftBeltEl);
    this.rightBelt = new app.PresentsBelt(this.$rightBeltEl, {direction: 'rtl', timeOffset: -1});

    window.santaApp.fire('sound-trigger', 'command_conveyor_start');
  },

  /**
   * Tell screen that it is hidden
   * @public
   */
  onInactive: function() {
    this.isActive = false;
    this.leftBelt.destroy();
    this.rightBelt.destroy();

    window.santaApp.fire('sound-trigger', 'command_conveyor_stop');
  }

};
