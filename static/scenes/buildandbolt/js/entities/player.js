goog.provide('app.Player');

goog.require('Constants');
goog.require('Utils');

goog.require('app.AnimationManager');
goog.require('app.Board');
goog.require('app.ControlsManager');
goog.require('app.LevelManager');
goog.require('app.ScoreManager');
goog.require('app.ScoreScreen');
goog.require('app.ToysBoard');




app.Player = class Player {
  constructor(controls, id) {
    this.animations = app.AnimationManager.animations[`player-${id}`];
    this.controls = controls;
    this.toyParts = [];
    this.id = id;

    this.elem = document.querySelector(`.player--${id}`);
    this.elem.classList.add('is-active');
    this.spawnElem = document.querySelector(`.player-spawn--${id}`);
    this.spawnElem.classList.add('is-active');
    this.innerElem = this.elem.querySelector('.player__inner');
    this.toysElem = this.elem.querySelector('.player__toys');
  }

  /**
   * Initializes player for the start of each level
   */
  init(config) {
    this.config = { ...config, type: 'player', checkBorder: true, checkCell: true };

    this.resetPosition();

    Utils.renderAtGridLocation(this.spawnElem, this.position.x, this.position.y);
    app.Board.addEntityToBoard(this, this.position.x, this.position.y);
  }

  /**
   * Restarts the player to the beginning of the level, progress lost
   */
  restart() {
    this.dead = true;
    this.animationQueue = [];

    // initialize death animation
    this.innerElem.classList.add('is-dead');
    this.currentAnimationFrame = Constants.PLAYER_FRAMES.DEATH.start;
    this.currentAnimationState = {
      animation: Object.assign({repeat: 2}, Constants.PLAYER_FRAMES.DEATH),
      callback: () => {
        this.dead = false;
        this.innerElem.classList.remove('is-dead');

        window.santaApp.fire('sound-trigger', 'buildandbolt_respawn');
        window.santaApp.fire('sound-trigger', 'buildandbolt_ice_stop', this.id);

        this.resetPosition();

        app.Board.updateEntityPosition(this,
            this.prevPosition.x, this.prevPosition.y,
            this.position.x, this.position.y);
      }
    };
  }

  resetPosition() {
    this.position = {
      x: this.config.startPos.x,
      y: this.config.startPos.y,
      angle: 0
    };

    this.velocity = {
      x: 0,
      y: 0
    };

    if (this.playingIceSound) {
      this.playingIceSound = false;
      window.santaApp.fire('sound-trigger', 'buildandbolt_ice_stop', this.id);
    }

    this.clearToyParts();
    this.platform = null;
    this.onIce = false;
    this.playingIceSound = false;

    this.currentAnimationFrame = Constants.PLAYER_FRAMES.REST.start;
    this.currentAnimationState = {
      animation: Constants.PLAYER_FRAMES.REST
    };
    this.playerState = Constants.PLAYER_STATES.REST;
    this.setDirection('front');
    this.animationQueue = [];
  }

  onFrame(delta, now) {
    if (this.dead) {
      // Keep updating death animation
      this.updateAnimationFrame(now);
      this.render();
      return;
    }

    this.blockPlayer = false;
    this.blockingPosition = {
      x: this.position.x,
      y: this.position.y,
    };

    this.prevPosition = Object.assign({}, this.position);

    this.updatePosition(delta);
    this.checkActions();

    const restThreshold = Constants.PLAYER_ACCELERATION_STEP * 8;
    if ((this.velocity.x == 0 && this.velocity.y == 0) ||
        (this.isDecelerating && Math.abs(this.velocity.x) <= restThreshold && Math.abs(this.velocity.y) <= restThreshold)) {
      this.setPlayerState(Constants.PLAYER_STATES.REST);
    } else {
      this.setPlayerState(Constants.PLAYER_STATES.WALK);
    }
    this.updateAnimationFrame(now);

    this.movePlayer();
    this.render();
  }

  render() {
    if (this.dead) {
      this.animations['death'].goToAndStop(this.currentAnimationFrame, true);
    } else {
      this.animations[this.currentDirection].goToAndStop(this.currentAnimationFrame, true);
    }
    Utils.renderAtGridLocation(this.elem, this.position.x, this.position.y);
  }

  /**
   * Updates player position and velocity based on user controls
   */
  updatePosition(delta) {
    this.isDecelerating = false;

    const {
      PLAYER_ACCELERATION_FACTOR,
      PLAYER_DECELERATION_FACTOR,
      PLAYER_ICE_ACCELERATION_FACTOR,
      PLAYER_ICE_DECELERATION_FACTOR,
      PLAYER_MAX_VELOCITY,
      PLAYER_ACCELERATION_STEP,
      PLAYER_DIRECTION_CHANGE_THRESHOLD,
      GRID_DIMENSIONS,
    } = Constants;
    const { left, right, up, down } = app.ControlsManager.getMovementDirections(
        this.controls, this.position);

    let accelerationFactor = PLAYER_ACCELERATION_FACTOR;
    let decelerationFactor = PLAYER_DECELERATION_FACTOR;
    if (this.onIce) {
      accelerationFactor = PLAYER_ICE_ACCELERATION_FACTOR;
      decelerationFactor = PLAYER_ICE_DECELERATION_FACTOR;
      this.onIce = false; // only leave it on for one step
    }

    if (left) {
      this.velocity.x = Math.max(-PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.x - PLAYER_ACCELERATION_STEP * left * accelerationFactor);

      if (left > PLAYER_DIRECTION_CHANGE_THRESHOLD) {
        this.setDirection('left');
      }
    } else if (this.velocity.x < 0) {
      this.velocity.x = Math.min(0, this.velocity.x + PLAYER_ACCELERATION_STEP * decelerationFactor);
      this.isDecelerating = true;
    }

    if (right) {
      this.velocity.x = Math.min(PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.x + PLAYER_ACCELERATION_STEP * right * accelerationFactor);

      if (right > PLAYER_DIRECTION_CHANGE_THRESHOLD) {
        this.setDirection('right');
      }
    } else if (this.velocity.x > 0) {
      this.velocity.x = Math.max(0, this.velocity.x - PLAYER_ACCELERATION_STEP * decelerationFactor);
      this.isDecelerating = true;
    }

    if (up) {
      this.velocity.y = Math.max(-PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.y - PLAYER_ACCELERATION_STEP * up * accelerationFactor);

      if (up > PLAYER_DIRECTION_CHANGE_THRESHOLD) {
        this.setDirection('back');
      }
    } else if (this.velocity.y < 0) {
      this.velocity.y = Math.min(0, this.velocity.y + PLAYER_ACCELERATION_STEP * decelerationFactor);
      this.isDecelerating = true;
    }

    if (down) {
      this.velocity.y = Math.min(PLAYER_MAX_VELOCITY * accelerationFactor,
          this.velocity.y + PLAYER_ACCELERATION_STEP * down * accelerationFactor);

      if (down > PLAYER_DIRECTION_CHANGE_THRESHOLD) {
        this.setDirection('front');
      }
    } else if (this.velocity.y > 0) {
      this.velocity.y = Math.max(0, this.velocity.y - PLAYER_ACCELERATION_STEP * decelerationFactor);
      this.isDecelerating = true;
    }

    if (this.platform) {
      this.platformOffset.x += this.velocity.x * delta;
      this.platformOffset.y += this.velocity.y * delta;
    } else {
      this.position.x = Math.min(GRID_DIMENSIONS.WIDTH - 1,
          Math.max(0, this.position.x + this.velocity.x * delta));

      this.position.y = Math.min(GRID_DIMENSIONS.HEIGHT - 1,
          Math.max(0, this.position.y + this.velocity.y * delta));
    }

    // check if you left the platform
    if (this.platform) {
      this.position.x = this.platform.position.x + this.platformOffset.x;
      this.position.y = this.platform.position.y + this.platformOffset.y;

      if (this.platformOffset.x > this.platform.config.width ||
          this.platformOffset.x < -1 ||
          this.platformOffset.y > this.platform.config.height ||
          this.platformOffset.y < -1) {
        this.platform = null;
      }
    }
  }

  movePlayer() {
    // if block player is blocked
    if (this.blockPlayer) {
      this.position.x = this.blockingPosition.x;
      this.position.y = this.blockingPosition.y;
      this.velocity.x = 0;
      this.velocity.y = 0;
    }

    // move player
    app.Board.updateEntityPosition(this,
          this.prevPosition.x, this.prevPosition.y,
          this.position.x, this.position.y);
  }

  /**
   * Check for any effects other entities have on the player at the
   * current position
   */
  checkActions() {
    const surroundingEntities = app.Board.getSurroundingEntities(this);
    const resultingActions = {};

    for (const entity of surroundingEntities) {
      const actions = entity.onContact(this);

      for (const action of actions) {
        if (!resultingActions[action]) { // if this action is not referred yet, create it
          resultingActions[action] = [];
        }
        resultingActions[action].push(entity);
      }
    }

    this.processActions(resultingActions);
  }

  processActions(resultingActions) {
    const restartEntities = resultingActions[Constants.PLAYER_ACTIONS.RESTART];
    if (restartEntities && restartEntities.length) {
      this.restart();
      return; // ignore all other actions
    }

    const platforms = resultingActions[Constants.PLAYER_ACTIONS.STICK_TO_PLATFORM];
    if (platforms && platforms.length) {
      const entity = platforms[0];
      this.platform = entity;
      this.platformOffset = {
        x: this.position.x - entity.position.x,
        y: this.position.y - entity.position.y
      };
    }

    const pitEntities = resultingActions[Constants.PLAYER_ACTIONS.PIT_FALL];
    if (!this.platform && pitEntities && pitEntities.length) {
      // TODO: pit falling animation
      window.santaApp.fire('sound-trigger', 'buildandbolt_pit');
      window.santaApp.fire('sound-trigger', 'buildandbolt_player_walk_stop', this.id);
      this.restart();
      return; // ignore all other actions
    }

    // block player
    const blockEntities = resultingActions[Constants.PLAYER_ACTIONS.BLOCK];
    if (blockEntities && blockEntities.length) {
      for (const entity of blockEntities) {
        // block player
        if (entity.blockingPosition) {
          this.blockPlayer = true;
          if (entity.blockingPosition.x !== this.position.x) {
            this.blockingPosition.x = entity.blockingPosition.x;
          }
          if (entity.blockingPosition.y !== this.position.y) { // Realized that the player position Y at the very top is 0.01 instead of 0
            this.blockingPosition.y = entity.blockingPosition.y;
          }
        }
      }
    }

    // pick up a toy part
    const toyEntities = resultingActions[Constants.PLAYER_ACTIONS.ADD_TOY_PART];
    if (toyEntities && toyEntities.length) {
      for (const entity of toyEntities) {
        this.addToyPart(entity.config.part);
      }
    }

    // drop off toy
    const acceptToyEntities = resultingActions[Constants.PLAYER_ACTIONS.ACCEPT_TOY];
    if (acceptToyEntities && acceptToyEntities.length) {
      this.setPlayerState(Constants.PLAYER_STATES.DROP_OFF);
      this.clearToyParts();
      window.santaApp.fire('sound-trigger', 'buildandbolt_toymaking');

      // increment score
      app.ScoreManager.updateScore(this.id);
    }

    const ices = resultingActions[Constants.PLAYER_ACTIONS.ICE];
    if (ices && ices.length) {
      this.onIce = true;
      if (!this.playingIceSound) {
        this.playingIceSound = true;
        window.santaApp.fire('sound-trigger', 'buildandbolt_ice_start', this.id);
      }
    } else {
      if (this.playingIceSound) {
        this.playingIceSound = false;
        window.santaApp.fire('sound-trigger', 'buildandbolt_ice_stop', this.id);
      }
    }

    // bounce against other player
    const playerEntities = resultingActions[Constants.PLAYER_ACTIONS.BOUNCE];
    if (playerEntities && playerEntities.length) {
      this.isCloseToOtherPlayer = true;
    } else {
      this.isCloseToOtherPlayer = false;
    }
  }

  // bump the player in a specific direction with a specific force
  bump(angle, force, reverse = 1) {
    if (this.id === 'a') {
      window.santaApp.fire('sound-trigger', 'buildandbolt_elfbump');
    }
    this.velocity.x = Math.cos(angle) * force * reverse;
    this.velocity.y = Math.sin(angle) * force * reverse;
  }

  // get current angle of player's direction
  getDirectionAngle() {
    return Utils.getAngle(this.position, this.prevPosition);
  }

  // get current speed
  getSpeed() {
    return Math.abs(this.position.x - this.prevPosition.x) + Math.abs(this.position.y - this.prevPosition.y);
  }

  addToyPart(partId) {
    const { toyType } = app.LevelManager;
    if (this.toyParts.indexOf(partId) == -1) {
      this.toyParts.push(partId);

      if (this.toyParts.length == 1) {
        // transition to holding animation
        this.setPlayerState(Constants.PLAYER_STATES.PICK_UP);
      }

      const toyElem = document.createElement('img');

      if (this.toyParts.length == toyType.size) {
        // Replace all toy parts with full toy
        while (this.toysElem.firstChild) {
          this.toysElem.removeChild(this.toysElem.firstChild);
        }

        toyElem.setAttribute('class',
          `toypart toypart--${toyType.key}--full`);
        toyElem.setAttribute('src',
          `img/toys/${toyType.key}/full.svg`);
        this.toysElem.appendChild(toyElem);
        window.santaApp.fire('sound-trigger', 'buildandbolt_yay_1', this.id);

      } else {
        const toyElem = document.createElement('img');
        toyElem.setAttribute('class',
          `toypart toypart--${toyType.key}--${partId}`);
        toyElem.setAttribute('src',
          `img/toys/${toyType.key}/${partId}.svg`);
        this.toysElem.appendChild(toyElem);
      }

      window.santaApp.fire('sound-trigger', 'buildandbolt_pickitem');
    }
  }

  clearToyParts() {
    for (const toyPart of this.toyParts) {
      this.elem.classList.remove(`toypart--${toyPart}`);
    }

    // todo: move this to utils
    while (this.toysElem.firstChild) {
      this.toysElem.removeChild(this.toysElem.firstChild);
    }

    this.toyParts = [];
  }

  setDirection(direction) {
    if (direction == 'left') {
      this.innerElem.classList.add('is-flipped');
    } else {
      this.innerElem.classList.remove('is-flipped');
    }

    if (direction == 'left' || direction == 'right') {
      direction = 'side';
    }

    if (direction != this.currentDirection) {
      if (this.animations[this.currentDirection]) {
        this.innerElem.classList.remove(`direction--${this.currentDirection}`);
      }
      this.innerElem.classList.add(`direction--${direction}`);
      this.currentDirection = direction;
    }
  }

  /**
   * Update animation based on player state
   */
  setPlayerState(state) {
    if (state == this.playerState) {
      return;
    }

    let rest = Constants.PLAYER_FRAMES.REST;
    let walk = Constants.PLAYER_FRAMES.WALK;
    let restToWalk = Constants.PLAYER_FRAMES.REST_TO_WALK;
    let walkToRest = Constants.PLAYER_FRAMES.WALK_TO_REST;

    if (this.toyParts.length) {
      rest = Constants.PLAYER_FRAMES.HOLD_REST;
      walk = Constants.PLAYER_FRAMES.HOLD_WALK;
      restToWalk = Constants.PLAYER_FRAMES.HOLD_REST_TO_HOLD_WALK;
      walkToRest = Constants.PLAYER_FRAMES.HOLD_WALK_TO_HOLD_REST;
    }

    switch(state) {
      case Constants.PLAYER_STATES.WALK:
        switch(this.playerState) {
          case Constants.PLAYER_STATES.REST:
            this.addAnimationToQueueOnce(restToWalk);
            // fall-through
          default:
            this.playerState = Constants.PLAYER_STATES.WALK;
            this.addAnimationToQueueOnce(walk);
            window.santaApp.fire('sound-trigger', 'buildandbolt_player_walk_start', this.id);
            if (this.onIce) {
              window.santaApp.fire('sound-trigger', 'buildandbolt_ice_start', this.id);
            }
        }
        break;
      case Constants.PLAYER_STATES.REST:
        switch(this.playerState) {
          case Constants.PLAYER_STATES.WALK:
            this.addAnimationToQueueOnce(walkToRest);
            // fall-through
          default:
            this.playerState = Constants.PLAYER_STATES.REST;
            this.animationQueue.push({
              animation: rest
            });
            window.santaApp.fire('sound-trigger', 'buildandbolt_player_walk_stop', this.id);
            window.santaApp.fire('sound-trigger', 'buildandbolt_ice_stop', this.id);
        }
        break;
      case Constants.PLAYER_STATES.PICK_UP:
        this.playerState = Constants.PLAYER_STATES.PICK_UP;
        this.addAnimationToQueueOnce(Constants.PLAYER_FRAMES.REST_TO_HOLD_REST);
        break;
      case Constants.PLAYER_STATES.DROP_OFF:
        this.playerState = Constants.PLAYER_STATES.DROP_OFF;
          this.addAnimationToQueueOnce(Constants.PLAYER_FRAMES.HOLD_REST_TO_REST);
        break;
    }
  }

  /**
   * Checks for repeats to make sure the animation is not queued multiple times
   */
  addAnimationToQueueOnce(animation, callback) {
    if (!this.animationQueue.find(item => item.animation == animation)) {
      this.animationQueue.push({
        animation,
        callback
      });
    }
  }

  updateAnimationFrame(now) {
    let animation = this.currentAnimationState.animation;

    // Frame is not within range. Set it to start of range.
    if (this.currentAnimationFrame < animation.start ||
        this.currentAnimationFrame > animation.end) {
      this.currentAnimationFrame = animation.start;
      this.lastAnimationFrame = now;
      return;
    }

    if (!this.lastAnimationFrame) {
      this.lastAnimationFrame = now;
    }

    let loop = animation.loop && !this.animationQueue.length;
    const {
      nextFrame,
      frameTime,
      finished
    } = Utils.nextAnimationFrame(animation,
        this.currentAnimationFrame, loop, this.lastAnimationFrame, now);

    this.currentAnimationFrame = nextFrame;
    this.lastAnimationFrame = frameTime;

    if (finished) {
      if (animation.repeat) {
        animation.repeat--;
        this.currentAnimationFrame = animation.start;
        return;
      }

      if (this.currentAnimationState.callback) {
        this.currentAnimationState.callback.call(this);
      }

      if (this.animationQueue.length) {
        this.currentAnimationState = this.animationQueue.shift();
      } else {
        // No pending animations, go back to rest state
        this.setPlayerState(Constants.PLAYER_STATES.REST);
        if (this.animationQueue.length) {
          this.currentAnimationState = this.animationQueue.shift();
        }
      }
    }
  }

  onContact(player) {
    return [Constants.PLAYER_ACTIONS.BOUNCE];
  }
}
