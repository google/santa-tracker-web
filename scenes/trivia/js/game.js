goog.provide('app.Game');

goog.require('app.Constants');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.Gameover');
goog.require('app.shared.utils');



/**
 * The trivia game.
 * @param scene
 * @param elem
 * @constructor
 * @export
 */
app.Game = function(scene, elem) {
  this.scene = scene;
  this.elem = elem;

  this.scoreboard = new app.shared.Scoreboard(this, elem.querySelector('.board'));
  this.gameoverView = new app.shared.Gameover(this, elem.querySelector('.gameover'));

  this.current = {number: 0};
  this.isPlaying = false;
  this.paused = false;
  this.gameStartTime = +new Date;

  this.onFrame = this.onFrame.bind(this);
};

/**
 * Game loop. Runs every frame using requestAnimationFrame.
 */
app.Game.prototype.onFrame = function() {
  if (!this.isPlaying) {
    return;
  }

  // Calculate delta since last frame.
  var now = +new Date() / 1000;
  var delta = Math.min(1, now - this.lastFrame);
  this.lastFrame = now;

  this.scoreboard.onFrame(delta);

  // Request next frame
  this.requestId = app.shared.utils.requestAnimFrame(this.onFrame);
};

/**
 * Transition to the next level.
 * @private
 */
app.Game.prototype.bumpLevel_ = function() {
  // Next level
  this.level++;
  if (this.level === app.Constants.TOTAL_LEVELS) {
    this.gameover(true);
  } else {
    this.scoreboard.setLevel(this.level);
    this.current.number = 0;
    this.nextQuestion_();
  }
};

/**
 * Starts the game.
 * @param {string} difficulty
 * @export
 */
app.Game.prototype.start = function(difficulty) {
  this.difficulty = difficulty;
  this.restart();
};

/**
 * Restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  // Cleanup last game
  var match = location.search.match(/[?&]level=(\d+)/) || [];
  this.level = (+match[1] || 1) - 1;
  this.paused = false;
  this.current = {number: 0};

  this.scoreboard.reset();

  // Start game
  window.santaApp.fire('sound-trigger', 'trivia_game_start');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'trivia'});
  this.unfreezeGame();

  this.nextQuestion_();
};

/**
 * Freezes the game. Stops the onFrame loop and stops any CSS3 animations.
 * Used both for game over and pausing.
 */
app.Game.prototype.freezeGame = function() {
  this.isPlaying = false;
  this.elem.classList.add('frozen');
};

/**
 * Unfreezes the game, starting the game loop as well.
 */
app.Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.elem.classList.remove('frozen');

    this.isPlaying = true;
    this.lastFrame = +new Date() / 1000;
    this.requestId = app.shared.utils.requestAnimFrame(this.onFrame);
  }
};

/**
 * Stops the game as game over. Displays the game over screen as well.
 */
app.Game.prototype.gameover = function(really) {
  // Check if count down on scoreboard is over
  if (!really && this.scoreboard.countdown === 0) {
    this.answer(false);
    return;
  }

  this.freezeGame();
  this.gameoverView.show();
  window.santaApp.fire('sound-trigger', 'trivia_game_over');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'trivia',
    score: this.scoreboard.score,
    level: this.level,
    timePlayed: new Date - this.gameStartTime
  });
};

/**
 * Pauses/unpauses the game.
 */
app.Game.prototype.togglePause = function() {
  if (this.paused) {
    this.resume();
  // Only allow pausing if the game is playing (not game over).
  } else if (this.isPlaying) {
    this.pause();
  }
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
 * Cleanup
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {
      gameid: 'trivia',
      timePlayed: new Date - this.gameStartTime
    });
  }
  this.freezeGame();

  app.shared.utils.cancelAnimFrame(this.requestId);
  $(window).off('.trivia');
  $(document).off('.trivia');
};

/**
 * Answer the current question.
 * @param isCorrect Is the answer correct?
 */
app.Game.prototype.answer = function(isCorrect) {
  this.scoreboard.addScore(isCorrect ? 1 : 0);
  if (this.current.number === app.Constants.QUESTIONS_PER_LEVEL) {
    this.bumpLevel_();
  } else {
    this.nextQuestion_();
  }
};

app.Game.prototype.nextQuestion_ = function() {
  var index = Math.ceil(Math.random() * 97);
  var questionElem = this.elem.querySelector('.quiz-' + this.difficulty + ' .question--' + index);
  this.current.number++;
  this.current.question = questionElem.children[0].textContent;
  this.current.choices = Array.prototype.map.call(questionElem.children[1].children, function(el) {
    return el.textContent;
  });
  this.scoreboard.restart();
  this.scene.fire('new-question');
};
