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

goog.require('Constants');
goog.require('app.shared.utils');
goog.require('app.shared.LevelUp');
goog.require('app.shared.Gameover');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.Tutorial');
goog.require('app.utils');
goog.require('Door');
goog.require('Cards');
goog.require('LevelModel');

/**
 * Main game class.
 * @param {!Element} elem DOM element containing the game.
 * @constructor
 */
var Game = function(elem) {
  this.elem = $(elem);
  this.isPlaying = false;

  this.doors = [];
  this.doorsOpen = {};

  this.numberOfDoors = 0;
  this.numberOfOpenedDoors = 0;
  this.numberOfMismatchedDoors = 0;
  this.numberOfCompletedDoors = 0;
  this.gameStartTime = +new Date;

  this.cards = new Cards();
  this.gameoverDialog = new Gameover(this, this.elem.find('.gameover'));
  this.scoreboard = new Scoreboard(this, this.elem.find('.board'), 10);
  this.tutorial = new Tutorial(this.elem, 'touch-matching', 'mouse-matching', 'touch-matching');

  this.$doors = this.elem.find(Constants.SELECTOR_DOOR);
  this.$targets = this.elem.find(Constants.SELECTOR_DOOR_TARGET);
  this.mismatchTimeout = null;

  this.levelModel = new LevelModel(this.elem);
  this.levelUp = new LevelUp(this, this.elem.find('.levelup'), this.elem.find('.levelup--number'));

  // Cache a bound onFrame since we need it each frame.
  this.onFrame_ = this.onFrame_.bind(this);
};

/**
 * Bootstrap for the game.
 * Called when the module is ready.
 * @export
 */
Game.prototype.start = function() {
  this.$targets.on('click', this.onTargetClick_.bind(this));
  this.$targets.on('touchstart', this.onTargetTouch_.bind(this));
  window.santaApp.fire('sound-ambient', 'music_start_ingame');
  // Prepare the cards deck
  this.cards.prepare();

  // Start game
  this.paused = false;

  // Restart creates the doors and unfreezes the game
  this.restart();

  // Start tutorial
  this.tutorial.start();
  this.elem.on('click.tutorial', function(event) {
    if ($(event.target).closest('.start').length) {
      return;
    }
    this.tutorial.off('mouse-matching');
    this.elem.off('click.tutorial');
  }.bind(this)).one('touchstart', function() {
    this.tutorial.off('touch-matching');
  }.bind(this));
};

/**
 * Destroys the game when leaving the module.
 * @export
 */
Game.prototype.destroy = function() {
  if (this.isPlaying) {
    var opts = {
      gameid: 'matching',
      timePlayed: new Date - this.gameStartTime,
      level: this.levelModel.get() - 1
    };
    window.santaApp.fire('analytics-track-game-quit', opts);
  }
  if (this.mismatchTimeout != null) {
    window.clearTimeout(this.mismatchTimeout);
  }

  this.doors.forEach(function(door) {
    door.destroy();
  });

  this.levelUp.dispose();

  utils.cancelAnimFrame(this.requestId);
};

/**
 * Creates all of the doors for this level
 * @private
 */
Game.prototype.createDoors_ = function() {
  // Check the number of doors on creation, as it depends on the level the
  // player is currently on.
  this.numberOfDoors = this.levelModel.getNumberOfDoors();
  this.doors = [];

  var levelCards = this.cards.getLevelCards(this.numberOfDoors);
  levelCards = this.levelModel.shuffleCards(levelCards);

  var $door = null;
  var cardClass = null;

  for (var i = 0; i < this.numberOfDoors; i++) {
    $door = this.$doors.eq(this.levelModel.getDoorIndex(i));
    cardClass = levelCards.pop();

    this.doors.push(this.createDoor_($door, cardClass));
  }
};

/**
 * Creates a single door with a card class.
 * @param {!jQuery} $door
 * @param {string} cardClass
 * @return {!Door}
 * @private
 */
Game.prototype.createDoor_ = function($door, cardClass) {
  // the id is going to be the number of the card class
  var id = cardClass.match(/\d+$/)[0];
  return new Door(id, $door, this.onDoorClick_.bind(this), cardClass);
};

/**
 * Event to let the click go "through" the house.
 * Since our doors are located behind it, for design purposes (animation),
 * we need to add dummy elements to act as targets in front of the house.
 * @param {Event} event
 * @private
 */
Game.prototype.onTargetClick_ = function(event) {
  var target = $(event.target).data('target');
  target = parseInt(target, 10);

  // force click on the real target
  this.$doors.eq(target).click();
};


/**
 * Handles a touch and fakes a click event. This prevents any delay on touch
 * devices, which take time to register a click.
 * @param {Event} event
 * @private
 */
Game.prototype.onTargetTouch_ = function(event) {
  event.preventDefault();
  this.onTargetClick(event);
};

/**
 * Handles the door click event.
 * @param {!Door} door
 * @private
 */
Game.prototype.onDoorClick_ = function(door) {
  if (door.isCompleted || this.paused) {
    return;
  }
  if (door.isOpened) {
    this.closeDoor_(door);
    return;
  }

  // Make sure we don't have too many doors opened first
  if (this.numberOfOpenedDoors >= Constants.MAX_OPEN_DOORS) {
    this.closeLastOpenedDoors_();
  }
  this.openDoor_(door);

  // Don't count those previously set to close
  // enough to do a match check
  if (this.numberOfOpenedDoors - this.numberOfMismatchedDoors > 1) {
    this.checkDoorMatch_(door);
  }
};

/**
 * Checks if the opened doors match (same number). If so, complete those doors
 * and award points.
 * @param {!Door} door instance.
 * @private
 */
Game.prototype.checkDoorMatch_ = function(door) {
  if (this.isDoorMatched_(door.id)) {
    this.scoreboard.addScore(this.getMatchScore());
    this.completeDoors_(door.id);

    window.santaApp.fire('sound-trigger', 'm_match');
    return;
  }

  // Set them as a mismatch so it doesn't get in our way if the user clicks
  // fast before the timeout is run.
  for (var i in this.doorsOpen) {
    this.doorsOpen[i].isMismatched = true;
    this.numberOfMismatchedDoors++;
  }

  // Set a timeout to close this mismatch after the doors are done opening
  // (transition duration).
  this.mismatchTimeout = window.setTimeout(
      this.closeMismatchedDoors_.bind(this),
      Constants.SLIDING_DOOR_DURATION);

  window.santaApp.fire('sound-trigger', 'm_mismatch');
};

/**
 * Do we have two open doors with the same id (same number)?
 * @param {number} doorId number.
 * @return {boolean} whether there is a match
 * @private
 */
Game.prototype.isDoorMatched_ = function(doorId) {
  var cardCount = 0;
  var door;
  for (var i in this.doorsOpen) {
    var door = this.doorsOpen[i];
    if (!door.isMismatched && door.id === doorId) {
      cardCount++;
    }
  }
  return cardCount === 2;
};

/**
 * Adds a door to the doorsOpen model and calls the door to be opened.
 * @param {Door} door instance.
 * @private
 */
Game.prototype.openDoor_ = function(door) {
  if (!door) {
    throw new Error('Door is missing.');
  }
  door.open();
  this.doorsOpen[door.uniqueId] = door;
  this.numberOfOpenedDoors++;
  window.santaApp.fire('sound-trigger', 'm_door_open');
};

/**
 * Removes a door from the doorsOpen model and calls the door to be closed.
 * @param {Door} door instance
 * @param {boolean} mute whether to mute the sound
 * @private
 */
Game.prototype.closeDoor_ = function(door, mute) {
  if (!door) {
    throw new Error('Door is missing.');
  }
  door.close();
  delete this.doorsOpen[door.uniqueId];

  this.numberOfOpenedDoors--;
  this.numberOfOpenedDoors = Math.max(this.numberOfOpenedDoors, 0);
  this.numberOfMismatchedDoors--;
  this.numberOfMismatchedDoors = Math.max(this.numberOfMismatchedDoors, 0);

  if (!mute) {
    window.santaApp.fire('sound-trigger', 'm_door_close');
  }
};

/**
 * Closes all opened doors according to our doorsOpen model.
 * @private
 */
Game.prototype.closeLastOpenedDoors_ = function() {
  var door;
  for (var i in this.doorsOpen) {
    door = this.doorsOpen[i];
    if (!door.isCompleted) {
      this.closeDoor_(door);
    }
  }
};

/**
 * Closes all opened doors according to our doorsOpen model.
 * @private
 */
Game.prototype.closeMismatchedDoors_ = function() {
  var door;
  for (var i in this.doorsOpen) {
    door = this.doorsOpen[i];
    if (!door.isCompleted && door.isMismatched) {
      this.closeDoor_(door);
    }
  }
};

/**
 * Closes all doors - completed or not. This is useful to call when restarting
 * the level as you want the doors to be closed before changing cards.
 * @private
 */
Game.prototype.closeAllDoors_ = function() {
  for (var i in this.doors) {
    this.closeDoor_(this.doors[i], true);
  }
};

/**
 * Complete the doors that are matched in the doorsOpen model.
 * Also resets the model so we can compare again next time,
 * since these doors are already 'done' (completed).
 * @param {string} id
 * @private
 */
Game.prototype.completeDoors_ = function(id) {
  var door;
  for (var i in this.doorsOpen) {
    door = this.doorsOpen[i];
    if (door.id === id) {
      door.complete();
      this.numberOfCompletedDoors++;
      this.numberOfMismatchedDoors--;
      this.numberOfMismatchedDoors = Math.max(this.numberOfMismatchedDoors, 0);
    }
  }

  this.doorsOpen = {};
  this.numberOfOpenedDoors = 0;

  // Are we going to another level?
  this.checkCompletion_();
};

/**
 * Checks if we are finishing this level or just playing indefinitely because
 * the player completed all levels.
 * @private
 */
Game.prototype.checkCompletion_ = function() {
  // Are we finishing the level and have more to go?
  if (this.numberOfCompletedDoors === this.numberOfDoors) {
    this.finishLevel();
  }
};

/**
 * Resets all the doors to their initial state.
 * @private
 */
Game.prototype.resetDoors_ = function() {
  this.doors.forEach(function(door) {
    door.reset();
  });

  this.doorsOpen = {};
  this.numberOfOpenedDoors = 0;
  this.numberOfCompletedDoors = 0;
  this.numberOfMismatchedDoors = 0;
};

/**
 * Restarts the whole game - back to level 1.
 */
Game.prototype.restart = function() {
  this.levelModel.set(1);
  this.startLevel_();
  window.santaApp.fire('sound-trigger', 'music_start_ingame');
  // Reset the scoreboard
  this.scoreboard.reset();
  window.santaApp.fire('analytics-track-game-start', {gameid: 'matching'});
};

/**
 * Restarts the whole level, including its doors and the scoreboard.
 * @private
 */
Game.prototype.startLevel_ = function() {
  this.restartDoors_();  // closes and recreates doors

  if (this.paused) {
    this.togglePause();
  }

  this.unfreezeGame_();
  window.santaApp.fire('sound-trigger', 'm_game_start');
};

/**
 * Restart the doors by closing and then creating them again. This is
 * abstracted so you can restart the doors without restarting the whole level.
 * @private
 */
Game.prototype.restartDoors_ = function() {
  var timeout = 0;

  // Reset our cards deck again
  this.cards.prepare();

  // Do we have any door opened?
  if (this.numberOfOpenedDoors > 0 || this.numberOfCompletedDoors > 0) {
    // Timeout to make sure the doors are closed before restarting
    timeout = Constants.SLIDING_DOOR_DURATION;
  }

  // Force them closed
  this.closeAllDoors_();

  window.setTimeout(function() {
    // Make our doors
    this.resetDoors_();
    this.createDoors_();
  }.bind(this), timeout);
};

/**
 * Called every frame.
 * @private
 */
Game.prototype.onFrame_ = function() {
  if (!this.isPlaying) {
    return;
  }

  var now = +new Date() / 1000;
  var delta = now - this.lastFrame;
  this.lastFrame = now;

  this.scoreboard.onFrame(delta);

  // Request next frame.
  this.requestId = utils.requestAnimFrame(this.onFrame_);
};

/**
 * Finishes the level by calling levelComplete instance.
 */
Game.prototype.finishLevel = function() {
  if (this.levelModel.get() === 10) {
    this.gameover();
    return;
  }

  this.togglePause();

  // Add bonus score before bumping level and adding time as those
  // are variables in the level score.
  this.scoreboard.addScore(this.getLevelScore());

  // We go next level right away
  // so we can show it in the next level animation
  this.levelModel.next();

  // Update the level text in the scoreboard
  // the scoreboard setLevel already adds + 1
  this.scoreboard.setLevel(this.levelModel.get() - 1);

  // Send Klang event
  window.santaApp.fire('sound-trigger', 'm_level_up');

  this.levelUp
    .show(this.levelModel.get());

  this.levelUp
    .bgElem
    .one(utils.TRANSITION_END, prepareNextLevel.bind(this));

  function prepareNextLevel() {
    // Update our time for this level
    this.updateTime_();
    this.startLevel_();
  }
};

/**
 * When you level up from first level you get 500pts, and then we compound
 * 10% on top of that for each additional level (level 2 is 550, level 3 is
 * 605, level 4 is 660 etc). All of this is multiplied by the remaining time
 *
 * @return {number} the formula for the level score
*/
Game.prototype.getLevelScore = function() {
  var remainingSeconds = this.scoreboard.countdown;
  var timeMultiplier = remainingSeconds / 30;
  var baseScore = Constants.SCORE_LEVEL_UP;
  var extraScore = Constants.SCORE_LEVEL_UP / 10 * (this.levelModel.get() - 1);
  return Math.ceil((baseScore + extraScore) * timeMultiplier);
};

/**
 * When you find a match you get 50 pts in level one and then 5 extra points
 * for each level (level 2 55 pts, level 3 60 pts, level 4 65pts etc)
 * @return {number} the formula for the match score
 */
Game.prototype.getMatchScore = function() {
  return Math.ceil(Constants.SCORE_MATCH +
                   Constants.SCORE_MATCH / 10 * (this.levelModel.get() - 1));
};

/**
 * Updates the time in the scoreboard.
 */
Game.prototype.updateTime_ = function() {
  var levelDuration = Constants.INITIAL_COUNTDOWN - ((this.levelModel.get() - 1) * 5);
  levelDuration = Math.max(levelDuration, Constants.LEVEL_CAP_DURATION);

  this.scoreboard.addTime(levelDuration);
};

/**
 * For when the game is over.
 */
Game.prototype.gameover = function() {
  this.freezeGame_();
  this.gameoverDialog.show(0, this.levelModel.get());
  window.santaApp.fire('sound-trigger', 'music_ingame_gameover');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'matching',
    score: this.scoreboard.score,
    level: this.levelModel.get() - 1,
    timePlayed: new Date - this.gameStartTime
  });
};

/**
 * Freezes the game. Stops the onFrame loop and stops any CSS3 animations.
 * Used both for game over and pausing.
 * @private
 */
Game.prototype.freezeGame_ = function() {
  this.isPlaying = false;
  this.elem.addClass('frozen');
};

/**
 * Unfreezes the game.
 * @private
 */
Game.prototype.unfreezeGame_ = function() {
  if (!this.isPlaying) {
    this.isPlaying = true;
    this.elem.removeClass('frozen').focus();

    // Restart the onFrame loop
    this.lastFrame = +new Date() / 1000;
    this.requestId = utils.requestAnimFrame(this.onFrame_);
  }
};

/**
 * Pauses/unpauses the game.
 */
Game.prototype.togglePause = function() {
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
Game.prototype.pause = function() {
  this.paused = true;
  this.freezeGame_();
};

/**
 * Resume the game.
 */
Game.prototype.resume = function() {
  this.paused = false;
  this.unfreezeGame_();
};

/**
 * Export Game class.
 * @export
 */
app.Game = Game;
