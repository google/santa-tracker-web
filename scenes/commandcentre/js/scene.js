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

goog.provide('app.Scene');

goog.require('app.Constants');
goog.require('app.InputEvent');
goog.require('app.PresentsScreen');
goog.require('app.SleighScreen');
goog.require('app.WindsockScreen');
goog.require('app.shared.utils');



/**
 * Main scene class
 * @param {!Element} elem An DOM element which wraps the scene.
 * @constructor
 * @export
 */
app.Scene = function(elem) {
  this.$el = $(elem);
  this.$windsockEl = this.$el.find(app.Constants.WINDSOCK_SCREEN_SELECTOR);
  this.$presentsEl = this.$el.find(app.Constants.PRESENTS_SCREEN_SELECTOR);
  this.$sleighEl = this.$el.find(app.Constants.SLEIGH_SCREEN_SELECTOR);

  this.javascriptScreens = {};
  this.javascriptScreens['windsock'] = new app.WindsockScreen();
  this.javascriptScreens['presents'] = new app.PresentsScreen(this.$presentsEl);
  this.javascriptScreens['sleigh'] = new app.SleighScreen(this.$sleighEl);
  this.currentScreen = undefined;

  this.onScreenLinkClick_ = this.onScreenLinkClick_.bind(this);
  this.onElfClick_ = this.onElfClick_.bind(this);

  this.addEventHandlers_();

  this.showScreen_(app.Constants.DEFAULT_SCREEN);
};

app.Scene.prototype = {

  /**
   * Shows screen and activates any associated JavaScript class
   * @param {string} name Name of screen to show
   * @private
   */
  showScreen_: function(name) {
    if (this.currentScreen == name) {
      return;
    }

    var previousScreen = this.javascriptScreens[this.currentScreen];
    if (previousScreen) {
      previousScreen.onInactive();
    }

    this.$el.find('.big-screen__container').hide();
    this.$el.find('.big-screen__container[data-screen=' + name + ']').show();

    this.currentScreen = name;
    var upcomingScreen = this.javascriptScreens[this.currentScreen];
    if (upcomingScreen) {
      upcomingScreen.onActive();
    }

    // NOTE: This fires a single event for the 'map' scene, rather than
    // creating a whole Screen class.
    if (name === 'map') {
      window.santaApp.fire('sound-trigger', 'command_map');
    }
  },

  /**
   * @private
   */
  onScreenLinkClick_: function(e) {
    var $link = $(e.currentTarget);
    var screenName = $link.data('screen');
    this.showScreen_(screenName);
  },

  /**
   * @private
   */
  onElfClick_: function(e) {
    var $elf = $(e.currentTarget);
    app.shared.utils.animWithClass($elf, 'run-animation');
  },

  /**
   * @private
   */
  addEventHandlers_: function() {
    this.$el.find('[data-big-screen-link]').on(app.InputEvent.START, this.onScreenLinkClick_);
    this.$el.find('[data-trigger-elf-wave]').on(app.InputEvent.START, this.onElfClick_);
  },

  /**
   * @private
   */
  removeEventHandlers_: function() {
    this.$el.find('[data-big-screen-link]').off(app.InputEvent.START, this.onScreenLinkClick_);
    this.$el.find('[data-trigger-elf-wave]').off(app.InputEvent.START, this.onElfClick_);
  },

  /**
   * Destroy scene and mark all screens as inactive.
   */
  destroy: function() {
    this.removeEventHandlers_();

    Object.keys(this.javascriptScreens).forEach(function(name) {
      var screen = this.javascriptScreens[name];
      screen.onInactive();
    }, this);

    this.javascriptScreens = null;
  }

};
