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

goog.require('app.GameManager');
goog.require('app.Mouse');
goog.require('app.Ornament');
goog.require('app.OrnamentExporter');
goog.require('app.OrnamentGallery');
goog.require('app.OrnamentNavigation');
goog.require('app.Tools');
goog.require('app.shared.utils');

/**
 * Main game class
 * @param {String} elem An string DOM element which wraps the game.
 * @param {String} componentDir component context
 * @constructor
 * @export
 */
app.Game = function(elem, componentDir) {
  this.elem = $(elem);
  this.gameStartTime = +new Date;
  this.sceneElem = this.elem.find('.scene');

  app.GameManager.ios = navigator.userAgent.match(/(iPod|iPhone|iPad)/);
  app.GameManager.ie = navigator.userAgent.indexOf('MSIE') !== -1 ||
    navigator.appVersion.indexOf('Trident/') > 0;

  if (app.GameManager.ios || app.GameManager.ie) {
    // replace all svgs with pngs
    $('img[src*="svg"]', this.elem).attr('src', function() {
      return $(this).attr('src').replace('.svg', '.png');
    });
  }

  this.exporter = new app.OrnamentExporter(this, componentDir);
  this.mouse = new app.Mouse(this.elem);
  this.tools = new app.Tools(this, this.elem, this.exporter);
  this.ornaments = [];

  if (document.documentElement.getAttribute('lang') !== 'en') {
    $('.no-en').remove();
  }

  // find all ornaments and build
  var masterOrnaments = this.elem.find('.canvas[id^="canvas--"]');
  var ornament;
  var self = this;
  masterOrnaments.each(function() {
    ornament = new app.Ornament('#' + $(this).attr('id'), self.elem);
    self.ornaments.push(ornament);
  });

  app.GameManager.ornaments = this.ornaments;

  this.ornamentGallery = new app.OrnamentGallery('.scene-gallery', this.elem);
  this.ornamentNavigation = new app.OrnamentNavigation(this.elem);
  this.onFrame = this.onFrame.bind(this);
};

/**
 * Start game
 * @export
 */
app.Game.prototype.start = function() {
  this.tools.start();
  this.restart();

  $(window).on('resize.seasonofgiving', this.handleResize.bind(this));

  this.ornamentGallery.init();
  for (var i = 0; i < this.ornaments.length; i++) {
    this.ornaments[i].init();
  }

  this.handleResize();
};

/**
 * Handle window resize.
 */
app.Game.prototype.handleResize = function() {
  this.elem.find('.scene-ornament').css({
    'width': $(window).width(),
    'height': $(window).width() <= 1024 ? $(window).height() : 'auto'
  });

  this.elem.find('.scene-ornament-wrapper').css({
    'transform': 'translate(' + $(window).width() + 'px, 0)'
  });
};

/**
 * Resets all game entities and restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  this.paused = false;
  this.unfreezeGame();
};

/**
 * Updates game state since last frame.
 */
app.Game.prototype.update = function() {
  if (!this.isPlaying) {
    return;
  }

  this.mouse.update();
};

/**
 * Freezes the game. Stops the onFrame loop and stops any CSS3 animations.
 * Used both for game over and pausing.
 */
app.Game.prototype.freezeGame = function() {
  this.isPlaying = false;
  this.elem.addClass('frozen');
};

/**
 * Unfreezes the game, starting the game loop as well.
 */
app.Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.elem.removeClass('frozen');

    this.isPlaying = true;
    this.requestId = app.shared.utils.requestAnimFrame(this.onFrame);
  }
};

/**
 * Game loop. Runs every frame using requestAnimationFrame.
 */
app.Game.prototype.onFrame = function() {
  if (!this.isPlaying) {
    return;
  }

  // Update game state with physics simulations.
  this.update();

  // Request next frame
  this.requestId = app.shared.utils.requestAnimFrame(this.onFrame);
};

/**
 * Pause the game.
 */
app.Game.prototype.pause = function() {
  this.paused = true;
  this.freezeGame();
};

/**
 * Resume the game.
 */
app.Game.prototype.resume = function() {
  this.paused = false;
  this.unfreezeGame();
};

/**
 * Dispose the game
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {
      gameid: 'seasonofgiving',
      timePlayed: new Date() - this.gameStartTime,
      level: 1
    });
    Klang.triggerEvent('spirit_end');
  }
  this.freezeGame();

  app.shared.utils.cancelAnimFrame(this.requestId);
  $(window).off('.seasonofgiving');
  $(document).off('.seasonofgiving');
  app.GameManager.dispose();
};
