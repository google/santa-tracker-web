goog.provide('app.Scene');

goog.require('app.CandyMachine');
goog.require('app.Constants');
goog.require('app.InputEvent');
goog.require('app.TetrisTruck');
goog.require('app.shared.utils');


/**
 * Class for main Factory scene
 *
 * @param {!Element} div DOM element containing the scene.
 * @constructor
 * @export
 */
app.Scene = function(div) {
  this.$el = $(div);
  this.div_ = div;
  this.pinballTimer_ = -1;
  this.hasDroppedChocolate_ = false;

  this.$pinballButton_ = this.$el.find('#button');
  this.$chocolatePipeLever_ = this.$el.find('.js-chocolate-pipe-lever');
  this.$chocolateDrop_ = this.$el.find('.js-chocolate-drop');

  var $truckEl = this.$el.find('.js-truck');
  var $cogEl = this.$el.find('.js-tetris-machine-cog');

  this.tetrisTruck = new app.TetrisTruck($truckEl, $cogEl);
  this.candyMachine = new app.CandyMachine(div);

  this.init_();

  this.shootBall = this.shootBall.bind(this);
  this.dumpChocolate = this.dumpChocolate.bind(this);
};

/**
 * @private
 */
app.Scene.prototype.init_ = function() {
  this.$pinballButton_.on(app.InputEvent.START, this.shootBall);
  this.$chocolatePipeLever_.on(app.InputEvent.START, this.dumpChocolate);
};

/**
 * Stop scene and unbind
 * @export
 */
app.Scene.prototype.stop = function() {
  window.clearTimeout(this.pinballTimer_);

  this.$pinballButton_.off(app.InputEvent.START, this.shootBall);
  this.$chocolatePipeLever_.off(app.InputEvent.START, this.dumpChocolate);

  this.tetrisTruck.destroy();
  this.tetrisTruck = null;

  this.candyMachine.destroy();
  this.candyMachine = null;
};

/**
 * Shoots a ball through the tube.
 */
app.Scene.prototype.shootBall = function() {
  var pinball = this.$el.find('.pinball');
  if (pinball.hasClass('fire')) return;

  pinball.addClass('fire');
  window.santaApp.fire('sound-trigger', 'factory_shootball');

  this.pinballTimer_ = window.setTimeout(function() {
    pinball.removeClass('fire');
  }, 5500);
};

/**
 * Dump chocolate on the poor elf. This can only happen once.
 */
app.Scene.prototype.dumpChocolate = function() {
  if (!this.hasDroppedChocolate_) {
    this.hasDroppedChocolate_ = true;
    this.$chocolatePipeLever_.addClass('flip');
    this.$chocolateDrop_.addClass('run-animation');
    window.santaApp.fire('sound-trigger', 'factory_choco');
  }
};

/**
 * Has the elf eat candy.
 */
app.Scene.prototype.eatCandy = function() {
  this.candyMachine.run();
};
