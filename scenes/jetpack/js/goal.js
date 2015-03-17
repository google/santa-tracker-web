goog.provide('app.Goal');

goog.require('app.Constants');



/**
 * The goal
 * @param {!Element} elem The goal object
 * @param {!Game} game The game object.
 * @constructor
 */
app.Goal = function(elem, game) {
  this.elem = elem;
  this.game = game;
  this.reset();
};

/**
 * Bottom Padding Percentage
 * @type {number}
 * @private
 */
app.Goal.PADDING_ = 10;


/**
 * Reinitialize goal
 */
app.Goal.prototype.reset = function() {
  this.elem.attr('style', '').addClass('goal--hidden');
};


/**
 * Show the goal.
 */
app.Goal.prototype.transition = function() {
  var yPosition = this.game.sceneSize.height -
      this.elem.height() -
      this.game.sceneSize.height * app.Goal.PADDING_ / 100;

  this.elem
    .removeClass('goal--hidden')
    .css('transform', 'translate3d(0, ' + yPosition + 'px, 0)');

  window.setTimeout(function() {
    this.game.gameover();
  }.bind(this), app.Constants.GOAL_DURATION * 1000);
};
