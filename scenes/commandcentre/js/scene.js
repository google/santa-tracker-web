goog.provide('app.Scene');

goog.require('app.Constants');
goog.require('app.InputEvent');
goog.require('app.PresentsScreen');
goog.require('app.SleighScreen');
goog.require('app.WindsockScreen');
goog.require('app.shared.utils');



/**
 * Main scene class
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Element} elem An DOM element which wraps the scene.
 * @constructor
 * @export
 */
app.Scene = function(elem) {
  this.$el = $(elem);
  this.$windsockEl = this.$el.find(app.Constants.WINDSOCK_SCREEN_SELECTOR);
  this.$presentsEl = this.$el.find(app.Constants.PRESENTS_SCREEN_SELECTOR);
  this.$sleighEl = this.$el.find(app.Constants.SLEIGH_SCREEN_SELECTOR);

  this.javascriptScreens = [];
  this.javascriptScreens['windsock'] = new app.WindsockScreen(this.$windsockEl);
  this.javascriptScreens['presents'] = new app.PresentsScreen(this.$presentsEl);
  this.javascriptScreens['sleigh'] = new app.SleighScreen(this.$sleighEl);
  this.currentScreen = undefined;

  this.onScreenLinkClick_ = this.onScreenLinkClick_.bind(this);
  this.onElfClick_ = this.onElfClick_.bind(this);

  this.addEventHandlers_();

  this.showScreen_(app.Constants.DEFAULT_SCREEN);
};

/**
 * Notifies Javascript for currently loaded screen that it's inactive
 * @private
 */
app.Scene.prototype.inactivateCurrentScreenJavascript_ = function () {
  if (this.currentScreen && this.javascriptScreens.hasOwnProperty(this.currentScreen)) {
    this.javascriptScreens[this.currentScreen].onInactive();
  }
};

/**
 * Notifies Javascript for screen that it's active
 * @param {String} name Name of screen to activate
 * @private
 */
app.Scene.prototype.activateScreenJavascript_ = function (name) {
  if (this.javascriptScreens.hasOwnProperty(name)) {
    this.javascriptScreens[name].onActive();
  }
};

/**
 * Shows screen and activates any associated JavaScript class
 * @param {String} name Name of screen to show
 * @private
 */
app.Scene.prototype.showScreen_ = function (name) {
  if (this.currentScreen == name) {
    return;
  }

  this.$el.find('.big-screen__container').hide();
  this.$el.find('.big-screen__container[data-screen=' + name + ']').show();

  this.inactivateCurrentScreenJavascript_();
  this.activateScreenJavascript_(name);

  if (name === 'map') {
    window.santaApp.fire('sound-trigger', 'command_map');
  }

  this.currentScreen = name;
};

/**
 * @private
 */
app.Scene.prototype.onScreenLinkClick_ = function (e) {
  var $link = $(e.currentTarget);
  var screenName = $link.data('screen');
  this.showScreen_(screenName);
};

/**
 * @private
 */
app.Scene.prototype.onElfClick_ = function (e) {
  var $elf = $(e.currentTarget);
  app.shared.utils.animWithClass($elf, 'run-animation');
};

/**
 * @private
 */
app.Scene.prototype.addEventHandlers_ = function () {
  this.$el.find('[data-big-screen-link]').on(app.InputEvent.START, this.onScreenLinkClick_);
  this.$el.find('[data-trigger-elf-wave]').on(app.InputEvent.START, this.onElfClick_);
};

/**
 * @private
 */
app.Scene.prototype.removeEventHandlers_ = function () {
  this.$el.find('[data-big-screen-link]').off(app.InputEvent.START, this.onScreenLinkClick_);
  this.$el.find('[data-trigger-elf-wave]').off(app.InputEvent.START, this.onElfClick_);
};

/**
 * @export
 */
app.Scene.prototype.destroy = function() {
  this.removeEventHandlers_();

  this.javascriptScreens.forEach(function(screen) {
    screen.onInactive();
  });

  this.javascriptScreens = null;
};
