goog.provide('app.Game');

goog.require('app.DragDrop');
goog.require('app.Drawer');
goog.require('app.Fallback');
goog.require('app.Instruments');
goog.require('app.Lights');
goog.require('app.shared.ShareOverlay');



/**
 * Main game class
 * @param {Element} elem An DOM element which wraps the game.
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.elem = $(elem);
  this.scene = this.elem.find('.scene');
  this.gui = this.elem.find('.gui');
  this.shareOverlay = new app.shared.ShareOverlay(this.elem.find('.shareOverlay'));

  this.drawer = new app.Drawer(this.elem);
  this.lights = new app.Lights(this.elem);
  this.instruments = new app.Instruments(this.elem);
};


/**
 * Starts the game.
 * @export
 */
app.Game.prototype.start = function() {
  this.elem.find('#drawer-button--share').
      on('click.jamband touchend.jamband', this.showShareOverlay.bind(this));

  new app.DragDrop(this.elem);

  var scaleToWindow = (function() {
    var scale = Math.min(1, $(window).width() / 1800);
    var guiScale = Math.min(1, scale * 1.5);
    this.scene.css('font-size', scale + 'px');
    this.gui.css('font-size', guiScale + 'px');
  }).bind(this);

  scaleToWindow();
  $(window).on('resize.jamband orientationchange.jamband', scaleToWindow);

  window.santaApp.fire('analytics-track-game-start', {gameid: 'jamband'});
};


/**
 * Show share overlay.
 */
app.Game.prototype.showShareOverlay = function() {
  var s = this.instruments.save();

  if (s) {
    window.history.pushState(null, '', 'https://santatracker.google.com/#jamband?band=' + s);
  }

  this.shareOverlay.show(window.location.href, true);
};


/**
 * Loads up a url-serialized band on the stage.
 * @param {string} band
 * @export
 */
app.Game.prototype.restoreBand = function(band) {
  this.instruments.restore(band);
};


/**
 * Cleanup
 * @export
 */
app.Game.prototype.dispose = function() {
  window.santaApp.fire('analytics-track-game-quit', {
    gameid: 'jamband', timePlayed: new Date - this.gameStartTime
  });

  app.Fallback.stop();
  $(window).off('.jamband');
  $(document).off('.jamband');
};
