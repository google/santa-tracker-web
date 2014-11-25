/**
 * Manages the scoreboard and game countdown.
 * @constructor
 * @param Game game The game object.
 * @param HTMLElement el The scoreboard element.
 */
function Scoreboard(game, elem) {
  this.game = game;
  this.elem = $(elem);
  this.scoreElem = this.elem.find('.score .value');
  this.levelElem = this.elem.find('.level .value');
  this.countdownElem = this.elem.find('.countdown .tracker');

  this.attachEvents();

  // Initial state
  this.reset();
};

/**
 * Resets the scoreboard for a new game.
 */
Scoreboard.prototype.reset = function() {
  this.score = 0;
  this.countdown = Constants.INITIAL_COUNTDOWN;
  this.lastSeconds = null;
  this.losing = false;

  if (this.levelElem.length > 0) {
    this.levelElem.text('1');
  }

  if (this.countdownElem.length > 0) {
    this.countdownElem.removeClass('losing');
  }

  this.elem.find('.pause').removeClass('paused');
  this.onFrame(0);
  this.addScore(0);
};

/**
 * Attaches events for scoreboard interactions.
 */
Scoreboard.prototype.attachEvents = function() {
  var self = this;
  this.elem.find('.pause').on('click', function() {
    $(this).toggleClass('paused');
    self.game.togglePause();

    // TODO(bckenny): should this be firing global_pause? or handled elsewhere?
    if ($(this).hasClass('paused')) {
      window.santaApp.fire('sound-ambient', 'global_pause');
    } else {
      window.santaApp.fire('sound-ambient', 'global_unpause');
    }
  });
  this.elem.find('.restart').on('click', function() {
    self.game.restart();
  });
};

/**
 * Updates the scoreboard each frame.
 * @param {number} delta Time since last frame.
 */
Scoreboard.prototype.onFrame = function(delta) {
  // Are we game over?
  this.countdown -= delta;
  if (this.countdown < 0) {
    this.countdown = 0;
    this.game.gameover();
  }

  // Update track position
  var trackX = this.countdown / Constants.COUNTDOWN_TRACK_LENGTH * Constants.COUNTDOWN_TRACK_MAX_X;
  trackX = Math.min(trackX, Constants.COUNTDOWN_TRACK_MAX_X);

  if (this.countdownElem.length > 0) {
    this.countdownElem.css('transform', 'translate3d(' + trackX + 'px, 0, 0)');
  }

  // Cache track text changes.
  var seconds = Math.ceil(this.countdown);
  if (seconds !== this.lastSeconds) {
    this.lastSeconds = seconds;

    var text = '' + Math.floor(seconds / 60) + ':' + Scoreboard.pad_(seconds % 60);

    if (this.countdownElem.length > 0) {
      this.countdownElem[0].textContent = text;
    }

    // Are we losing (But not yet gameover).
    var losing = seconds <= Constants.COUNTDOWN_FLASH && seconds !== 0;
    if (this.losing !== losing) {
      this.losing = losing;
      if (this.countdownElem.length > 0) {
        this.countdownElem.toggleClass('losing', losing);
      }
      window.santaApp.fire('sound-trigger',
          losing ? 'game_hurry_up' : 'game_hurry_up_end');
    }
  }
};

/**
 * Adds score to the scoreboard.
 * @param {number} score The amount of score to add.
 */
Scoreboard.prototype.addScore = function(score) {
  this.score += score;

  if (this.scoreElem.length > 0) {
    this.scoreElem.text(this.score);
  }

};

/**
 * Sets the current level on the scoreboard.
 * @param {number} level The current level, 0-based.
 */
Scoreboard.prototype.setLevel = function(level) {
  if (this.levelElem.length > 0) {
    this.levelElem.text(level + 1);
  }
};

/**
 * Bumps the time ball drop.
 * @param {number} time Time to add in seconds.
 */
Scoreboard.prototype.addTime = function(time) {
  this.countdown += time;
};

/**
 * A helper that zero-pads a number to 2 digits. F.ex. 5 becomes "05".
 * @param {number} num The number to pad.
 * @return {string} Zero padded number.
 * @private
 */
Scoreboard.pad_ = function(num) {
  return (num < 10 ? '0' : '') + num;
};
