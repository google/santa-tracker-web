goog.provide('app.shared.Gameover');

goog.require('app.shared.Overlay');
goog.require('app.shared.ShareButtons');
goog.require('app.shared.utils');

// We are *leaking* the Gameover global for backwards compatibility.
app.shared.Gameover = Gameover;

/**
 * Gameover screen.
 * @param {Game} game The game object.
 * @param {HTMLElement} elem The gameover element.
 * @constructor
 */
function Gameover(game, elem) {
  this.game = game;
  this.elem = $(elem);

  this.overlay = new app.shared.Overlay(this.elem);
  new app.shared.ShareButtons(this.elem.find('.shareButtons'));
  this.scoreElem = this.elem.find('.gameover-score .gameover-number');
  this.levelElem = this.elem.find('.gameover-level .gameover-number');

  this.attachEvents_();
}

/**
 * Attaches events to the gameover screen.
 * @private
 */
Gameover.prototype.attachEvents_ = function() {
  var self = this;
  this.elem.find('.gameover-play').on('click', function(e) {
    e.preventDefault();

    self.hide();
    self.game.restart();
  });
};

/**
 * Shows the gameover screen with an animation. Displays score and time
 * from the game.
 * @param {Number} score The final score.
 * @param {Number} level The final level.
 */
Gameover.prototype.show = function(score, level) {
  this.scoreElem.text(score || this.game.scoreboard.score);
  this.levelElem.text(level || this.game.level);
  this.overlay.show();
};

/**
 * Hides the gameover screen with an animation.
 * @param  {Function} callback Runs when the animation is finished.
 */
Gameover.prototype.hide = function(callback) {
  this.overlay.hide(callback);
};
