/**
 * Gameover screen.
 * @param {Game} game The game object.
 * @param {HTMLElement} elem The gameover element.
 * @constructor
 */
function Gameover(game, elem) {
  this.game = game;
  this.elem = $(elem);
  this.scoreElem = this.elem.find('.score .value');
  this.levelElem = this.elem.find('.level .value');

  this.attachEvents_();
};

/**
 * Attaches events to the gameover screen.
 * @private
 */
Gameover.prototype.attachEvents_ = function() {
  var self = this;
  this.elem.find('.again').on('click', function(e) {
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
  this.elem.addClass('visible');
};

/**
 * Hides the gameover screen with an animation.
 * @param  {Function} cb Runs when the animation is finished.
 */
Gameover.prototype.hide = function(cb) {
  var self = this;
  utils.animWithClass(this.elem, 'close', function() {
    self.elem.removeClass('visible');
    if (cb) cb();
  });
};
