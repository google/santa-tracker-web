/**
 * Main game class.
 * @param {Element} el DOM element containing the game.
 * @constructor
 */
var Game = function (elem, sceneElement) {
  this.elem = $(elem);
  this.sceneElement = sceneElement;

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
  this.scoreboard = new Scoreboard(this, this.elem.find('.scoreboard'));
  this.tutorial = new Tutorial(this.elem, 'touch-matching', 'mouse-matching');

  this.$doors = this.elem.find(Constants.SELECTOR_DOOR);
  this.$targets = this.elem.find(Constants.SELECTOR_DOOR_TARGET);

  this.mismatchTimeout = null;

  this.levelModel = new LevelModel(this.elem);
  this.levelUp = new LevelUp(this, this.elem.find('.levelup'), this.elem.find('.levelup--number'));

  // Cache a bound onFrame since we need it each frame.
  this.onFrame = this.onFrame.bind(this);
};

/**
 * Bootstrap for the game.
 * Called when the module is ready.
 */
Game.prototype.start = function() {
  this.$targets.on('click', this.onTargetClick.bind(this));
  this.$targets.on('touchstart', this.onTargetTouch.bind(this));

  // Prepare the cards deck
  this.cards.prepare();

  // Start game
  this.paused = false;

  // Restart creates the doors and unfreezes the game
  this.restart();

  // Start tutorial
  var game = this;
  this.tutorial.start();
  this.elem.on('click.tutorial', function(event) {
    if ($(event.target).closest('.start').length) {
      return;
    }
    game.tutorial.off('mouse-matching');
    game.elem.off('click.tutorial');
  }).one('touchstart', function() {
    game.tutorial.off('touch-matching');
  });
};

/**
 * Destroys the game when leaving the module.
 */
Game.prototype.destroy = function() {
  if (this.isPlaying) {
    this.sceneElement.fire('analytics-track-game-quit',
        {gameid: 'matching', timePlayed: new Date - this.gameStartTime});
  }
  if (this.mismatchTimeout != null) {
    window.clearTimeout( this.mismatchTimeout );
  }

  for (var i = 0; i < this.doors.length; i++) {
    this.doors[i].destroy();
  };

  utils.cancelAnimFrame(this.requestId);
};

/**
 * Creates all of the doors for this level
 **/
Game.prototype.createDoors = function() {
  // Need to check this every creation time
  // because it depends on the level you are
  this.numberOfDoors = this.levelModel.getNumberOfDoors();
  this.doors = [];

  var levelCards = this.cards.getLevelCards( this.numberOfDoors );
  var $door = null;
  var cardClass = null;

  for (var i = 0; i < this.numberOfDoors; i++) {

    $door = this.$doors.eq( this.levelModel.getDoorIndex(i) );
    cardClass = levelCards.pop();

    this.doors.push( this.createDoor($door, cardClass) );
  }
};

/**
 * Creates a single door with a card class.
 */
Game.prototype.createDoor = function($door, cardClass) {
  // the id is going to be the number of the card class
  var id = cardClass.match(/\d+$/)[0];
  return new Door(id, $door, this.onDoorClick.bind(this), cardClass )
};

/**
 * Event to let the click go "through" the house.
 * Since our doors are located behind it, for design purposes (animation),
 * we need to add dummy elements to act as targets in front of the house.
 */
Game.prototype.onTargetClick = function(event) {
  var target = $(event.target).data('target');
  target = parseInt(target, 10);

  // force click on the real target
  this.$doors.eq(target).click();
};


/**
 * Event to let the touch go "through" and thus
 * prevent any delay if we are in a touch device.
 */
Game.prototype.onTargetTouch = function(event) {
  event.preventDefault();
  this.onTargetClick(event);
};

/**
 * Handles the door click event.
 */
Game.prototype.onDoorClick = function(door) {
  if (door.isCompleted || this.paused) {
    return;
  }

  if (door.isOpened) {
    this.closeDoor(door);
  } else {
    // Make sure we don't have too many doors opened first
    if (this.numberOfOpenedDoors >= Constants.MAX_OPEN_DOORS) {
      this.closeLastOpenedDoors();
    }

    this.openDoor(door);

    // Don't count those previously set to close
    // enough to do a match check
    if ( Math.max(this.numberOfOpenedDoors - this.numberOfMismatchedDoors, 0) > 1) {
      this.checkDoorMatch(door);
    }
  }
};

/**
 * Checks if the opened doors match (same number).
 * @param {Object} door door instance.
 */
Game.prototype.checkDoorMatch = function(door) {
  var _this = this;
  var timeout = null;

  if (this.isDoorMatched(door.id)) {
    this.completeDoors( door.id );
    this.scoreboard.addScore( this.getMatchScore() );

    window.santaApp.fire('sound-trigger', 'm_match');
  } else {
    // Set them as a mismatch
    // so it doesn't get in our way if the user clicks fast
    // before the timeout is run
    for (var i in this.doorsOpen) {
        this.doorsOpen[i].isMismatched = true;
        this.numberOfMismatchedDoors++;
    };

    // Set a timeout to close this mismatch
    // for when the doors is done opening (transition duration)
    this.mismatchTimeout = window.setTimeout(function() {
      _this.closeMismatchedDoors();
    }, Constants.SLIDING_DOOR_DURATION);

    window.santaApp.fire('sound-trigger', 'm_mismatch');
  }
};

/**
 * Do we have two doors with the same id (same number)?
 * @param {Number} doorid doorid number.
 */
Game.prototype.isDoorMatched = function(doorId) {
  var cardCount = 0;
  for (var i in this.doorsOpen) {
    if (!this.doorsOpen[i].isMismatched &&
      this.doorsOpen[i].id === doorId) {
      cardCount++;
    }
  }
  return cardCount === 2;
};

/**
 * Adds a door to the doorsOpen model and
 * calls the door to be opened.
 * @param {Object} door door instance.
 */
Game.prototype.openDoor = function(door) {
  if (door === undefined) {
    throw new Error("Door is undefined.")
    return;
  }
  door.open();
  this.doorsOpen[door.uniqueId] = door;
  this.numberOfOpenedDoors++;
  window.santaApp.fire('sound-trigger', 'm_door_open');
};

/**
 * Removes a door from the doorsOpen model and
 * calls the door to be closed.
 @param {Object} door door instance.
 */
Game.prototype.closeDoor = function(door, mute) {
  if (door === undefined) {
    throw new Error("Door is undefined.")
    return;
  }

  door.close();

  if (this.doorsOpen.hasOwnProperty(door.uniqueId)) {
    delete this.doorsOpen[door.uniqueId];
  }

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
 */
Game.prototype.closeLastOpenedDoors = function() {
  for (var i in this.doorsOpen) {
    if (!this.doorsOpen[i].isCompleted) {
      this.closeDoor( this.doorsOpen[i] );
    }
  }
};

/**
 * Closes all opened doors according to our doorsOpen model.
 */
Game.prototype.closeMismatchedDoors = function() {
  for (var i in this.doorsOpen) {
    if (!this.doorsOpen[i].isCompleted &&
      this.doorsOpen[i].isMismatched) {

      this.closeDoor( this.doorsOpen[i] );

    }
  }
};

/**
 * Closes all doors - completed or not.
 * This is useful to call when restarting the level
 * as you want the doors to be closed before changing cards.
 */
Game.prototype.closeAllDoors = function() {
  for (var i in this.doors) {
    this.closeDoor( this.doors[i], true );
  }
};

/**
 * Complete the doors that are matched in the doorsOpen model.
 * Also resets the model so we can compare again next time,
 * since these doors are already 'done' (completed).
 */
Game.prototype.completeDoors = function(id) {

  for (var i in this.doorsOpen) {
    if(this.doorsOpen[i].id === id) {
      this.doorsOpen[i].complete();
      this.numberOfCompletedDoors++;
      this.numberOfMismatchedDoors--;
      this.numberOfMismatchedDoors = Math.max(this.numberOfMismatchedDoors, 0);
    }
  }

  this.doorsOpen = {};
  this.numberOfOpenedDoors = 0;

  // Are we going to another level?
  this.checkCompletion();

};

/**
 * Checks if we are finishing this level or
 * just playing indefinitely because the player completed all.
 */
Game.prototype.checkCompletion = function() {
  var _this = this;

  // Are we finishing the level and have more to go?
  if (this.numberOfCompletedDoors === this.numberOfDoors) {
    this.finishLevel();
  }

};

/**
 * Resets all the doors to it's initial state.
 */
Game.prototype.resetDoors_ = function() {
  for (var i = 0; i < this.doors.length; i++) {
    this.doors[i].reset();
  }

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
  this.startLevel();

  // Reset the scoreboard
  this.scoreboard.reset();
  this.sceneElement.fire('analytics-track-game-start', {gameid: 'matching'});
};

/**
 * Restarts the whole level, including it's doors and the scoreboard.
 */
Game.prototype.startLevel = function() {

  // Fix our doors by creating them again with new cards
  this.restartDoors();

  if (this.paused) {
    this.togglePause();
  }

  this.unfreezeGame();
  window.santaApp.fire('sound-ambient', 'm_game_start');
};

/**
 * Restars the doors by creating them again.
 * This is abstracted so you can restart the doors without restarting
 * the whole level.
 */
Game.prototype.restartDoors = function() {
  var _timeout = 0;
  var _this = this;

  // Reset our cards deck again
  this.cards.prepare();

  // Do we have any door opened?
  if (this.numberOfOpenedDoors > 0 ||
    this.numberOfCompletedDoors > 0) {

    // Timeout to make sure the doors are closed
    // before restarting
    _timeout = Constants.SLIDING_DOOR_DURATION;

  }

  // Force them closed
  this.closeAllDoors();

  window.setTimeout(function() {
    // Make our doors
    _this.resetDoors_();
    _this.createDoors();
  }, _timeout);

};

/**
 * Called every frame.
 */
Game.prototype.onFrame = function() {
  if (!this.isPlaying) {
    return;
  }

  var now = +new Date() / 1000,
      delta = now - this.lastFrame;
  this.lastFrame = now;

  this.scoreboard.onFrame(delta);

  // Request next frame.
  this.requestId = utils.requestAnimFrame(this.onFrame);
};

/**
 * Finishes the level by calling levelComplete instance.
 */
Game.prototype.finishLevel = function() {
  var _this = this;

  this.togglePause();

  // We go next level right away
  // so we can show it in the next level animation
  this.levelModel.next();

  window.santaApp.fire('sound-trigger', 'm_level_up');

  this.levelUp.show( this.levelModel.get() );
  this.levelUp
    .bgElem
    .one(utils.TRANSITION_END, function() {
      _this.prepareNextLevel();
    });

};

/**
 * Next level funtionality.
 * Note: finishLevel should be called before this one.
 */
Game.prototype.prepareNextLevel = function() {

  // Update our time for this level
  this.updateTime();

  // Update the level text in the scoreboard
  // the scoreboard setLevel already adds + 1
  this.scoreboard.setLevel( this.levelModel.get() - 1 );
  this.scoreboard.addScore( this.getLevelScore() );

  // Go
  this.startLevel();
};

/**
 * Returns the formula for the level score:
 * When you level up from first level you get 500pts, and then we compound
 * 10% on top of that for each additional level (level 2 is 550, level 3 is
 * 605, level 4 is 660 etc)
*/
Game.prototype.getLevelScore = function() {
  return Math.ceil(Constants.SCORE_LEVEL_UP * Math.pow(1.1, this.levelModel.get() - 1));
};

/**
 * returns the formula for the match score:
 * when you find a match you get 50 pts in level one and then again compound
 * 10% for each level (level 2 55 pts, level 3 61 pts, level 4 66pts etc)
 */
Game.prototype.getMatchScore = function() {
  return Math.ceil(Constants.SCORE_MATCH * Math.pow(1.1, this.levelModel.get() - 1));
};

/**
 * Updates the time in the scoreboard.
 */
Game.prototype.updateTime = function() {
  var levelDuration = Constants.INITIAL_COUNTDOWN - ((this.levelModel.get() - 1) * 5);
  levelDuration = Math.max(levelDuration, Constants.LEVEL_CAP_DURATION);

  this.scoreboard.addTime( levelDuration );

};

/**
 * For when the game is over.
 */
Game.prototype.gameover = function() {
  this.freezeGame();
  this.gameoverDialog.show(0, this.levelModel.get());
  this.sceneElement.fire('analytics-track-game-over', {
    gameId: 'matching', score: this.scoreboard.score,
    level: this.levelModel.get() - 1,
    timePlayed: new Date - this.gameStartTime
  });
};

/**
 * Freezes the game. Stops the onFrame loop and stops any CSS3 animations.
 * Used both for game over and pausing.
 */
Game.prototype.freezeGame = function() {
  this.isPlaying = false;
  this.elem.addClass('frozen');
};

/**
 * Unfreezes the game.
 */
Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.isPlaying = true;
    this.elem.removeClass('frozen');

    // Restart the onFrame loop
    this.lastFrame = +new Date() / 1000;
    this.requestId = utils.requestAnimFrame(this.onFrame);
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
  this.freezeGame();
};

/**
 * Resume the game.
 */
Game.prototype.resume = function() {
  this.paused = false;
  this.unfreezeGame();
};
