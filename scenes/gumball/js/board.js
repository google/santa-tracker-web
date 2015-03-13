/*global GB:true */

goog.provide('app.Board');
goog.require('app.Constants');
goog.require('app.Platform');

/**
 * Manages the board, its physics model and makes sure it rotates based on user
 * input.
 * @param {!app.Game} game The game instance
 * @param {!jQuery} elem The board DOM element
 * @constructor
 */
app.Board = function(game, elem) {
  this.game = game;
  this.elem = elem;
  this.bigGearLeft = this.game.elem.find('.gearBig--left');
  this.smallGearLeft = this.game.elem.find('.gearSmall--left');
  this.bigGearRight = this.game.elem.find('.gearBig--right');
  this.smallGearRight = this.game.elem.find('.gearSmall--right');

  this.isRotating = false;
  this.angle = 0;
  this.currentBoard = null;
  this.platforms = [];
  this.boardBody = null;

  for (var i = 0; i < 10; i++) {
    app.Platform.pool(this);
  }
};

/**
 * Resets the board for a new game or level.
 */
app.Board.prototype.reset = function() {
  if (this.boardBody) {
    this.boardBody.SetAngularVelocity(0);
    this.boardBody.SetAngle(0);
  }
};

/**
 * Loads a specific level.
 * @param {number} level The level number.
 */
app.Board.prototype.switchToLevel = function(level) {
  // Reset rotation.
  this.reset();

  // Save some work if it's the same board.
  if (level.board === this.currentBoard) { return; }
  this.currentBoard = level.board;

  // Clean up old board.
  this.platforms.forEach(function(p) { p.remove(); });
  this.platforms = [];
  if (this.boardBody) {
    this.game.boxWorld.DestroyBody(this.boardBody);
  }

  // Create a new physics body.
  var bd = new b2.BodyDef();
  bd.userData = 'board';
  bd.type = b2.Body.b2_kinematicBody;
  bd.position.Set(6, 4.5);
  this.boardBody = this.game.boxWorld.CreateBody(bd);

  // Create the platforms specified in the board.
  var boardInfo = Constants.BOARDS[level.board];
  for (var i = 0, stick; stick = boardInfo.sticks[i]; i++) {
    var platform = app.Platform.pop.apply(app.Platform, [this].concat(stick));
    this.platforms.push(platform);
  }
};

/**
 * Updates the board each frame. Applies rotation to box2d model based
 * on input.
 * @param {number} delta Seconds since last frame
 */
app.Board.prototype.update = function(delta) {
  if (!this.boardBody) return;

  var targetAngle = this.game.controls.tilt;
  if (this.game.controls.isRightDown) {
    targetAngle += 90;
  }
  if (this.game.controls.isLeftDown) {
    targetAngle -= 90;
  }
  targetAngle = Math.min(Constants.MAX_ANGLE, Math.max(-Constants.MAX_ANGLE, targetAngle));

  var currentVelocity = (this.boardBody.GetAngularVelocity() / Math.PI) * 180;
  var currentAngle = (this.boardBody.GetAngle() / Math.PI) * 180;

  var timeToStop = currentVelocity / Constants.ANGULAR_ACCELERATION;
  var direction = targetAngle > currentAngle ? 1 : -1;
  var distance = Math.abs(targetAngle - currentAngle);
  if (distance < 0.01) {
    // Stop
    currentVelocity = 0;
  } else if (distance > Math.abs(currentVelocity * timeToStop)) {
    // Accelerate or keep speed.
    currentVelocity = Math.min(app.Constants.MAX_ANGULAR_VELOCITY,
        Math.max(
            -app.Constants.MAX_ANGULAR_VELOCITY,
            currentVelocity + direction * Constants.ANGULAR_ACCELERATION * delta
            )
        );
  } else {
    // Decelerate
    if (currentVelocity > app.Constants.ANGULAR_ACCELERATION * delta) {
      currentVelocity -= app.Constants.ANGULAR_ACCELERATION * delta;
    } else if (currentVelocity < -Constants.ANGULAR_ACCELERATION * delta) {
      currentVelocity += app.Constants.ANGULAR_ACCELERATION * delta;
    } else {
      currentVelocity = targetAngle - currentAngle;
    }
  }

  this.boardBody.SetAngularVelocity(currentVelocity / 180 * Math.PI);
};

/**
 * Renders the state of the board.
 */
app.Board.prototype.render = function() {
  if (!this.boardBody) return;

  // Yay, magic constant!
  var newIsRotating = Math.abs(this.boardBody.GetAngularVelocity()) > 0.4;
  if (this.isRotating !== newIsRotating) {
    this.isRotating = newIsRotating;
    window.santaApp.fire('sound-trigger', newIsRotating ? 'gb_box_turn_start' : 'gb_box_turn_stop');
  }

  var boardAngle = this.boardBody.GetAngle();
  var bigGearAngle = -boardAngle * app.Constants.GEAR_SPEED * 1;
  var smallGearAngle = boardAngle * app.Constants.GEAR_SPEED * 1.7;
  this.elem.css('transform', 'translateZ(0) rotate(' + boardAngle + 'rad)');
  this.bigGearLeft.css('transform',
      'translateZ(0) rotate(' + (bigGearAngle - 0.104719755) + 'rad)');
  this.smallGearLeft.css('transform',
      'translateZ(0) rotate(' + (smallGearAngle + 0.366519143) + 'rad)');
  this.bigGearRight.css('transform',
      'translateZ(0) rotate(' + (bigGearAngle + 0.0872664626) + 'rad)');
  this.smallGearRight.css('transform',
      'translateZ(0) rotate(' + (smallGearAngle + 0.34906585) + 'rad)');
};
