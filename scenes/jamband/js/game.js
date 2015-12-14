/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.Game');

goog.require('app.DragDrop');
goog.require('app.Drawer');
goog.require('app.Fallback');
goog.require('app.Instruments');
goog.require('app.Lights');
goog.require('app.shared.ShareOverlay');

/**
 * Main jamband game class
 *
 * @param {!Element} elem An DOM element which wraps the game.
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.elem = $(elem);
  this.scene = this.elem.find('.scene');
  this.gui = this.elem.find('.gui');
  this.shareOverlay = null;

  this.drawer = new app.Drawer(this.elem);
  this.lights = new app.Lights(this.elem);
  this.instruments = null;

  this.shareOverlay = new app.shared.ShareOverlay(this.elem.find('.shareOverlay'));
  this.elem.find('#drawer-button--share').
      on('click.jamband touchend.jamband', this.showShareOverlay.bind(this));
};

/**
 * Starts the game.
 * @export
 */
app.Game.prototype.start = function() {
  this.instruments = new app.Instruments(this.elem);

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
    var newHref = location.href.substr(0,
        location.href.length - location.hash.length) + '#jamband?band=' + s;
    window.history.pushState(null, '', newHref);
  }

  this.shareOverlay.show('https://santatracker.google.com/#jamband?band=' + s, true);
};

/**
 * Loads up a url-serialized band on the stage.
 *
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
    gameid: 'jamband', timePlayed: new Date - this.gameStartTime, level: 1
  });

  app.Fallback.stop();
  $(window).off('.jamband');
  $(document).off('.jamband');
};
