goog.provide('SB.Object.Scenery');

goog.require('SB.Object.Renderable');

/**
 * Grid system representing the scenery through
 * which Santa and Rudolf are racing.
 * @constructor
 * @extends SB.Object.Renderable
 */
SB.Object.Scenery = function () {

  /**
   * The size of a grid cell.
   * @type {number}
   * @const
   */
  this.GRID_SIZE = 64;

  /**
   * Half the size of a grid cell.
   * @type {number}
   * @const
   */
  this.GRID_SIZE_HALF = this.GRID_SIZE * 0.5;

  /**
   * Quarter the size of a grid cell.
   * @type {number}
   * @const
   */
  this.GRID_SIZE_QUARTER = this.GRID_SIZE_HALF * 0.5;

  /**
   * Eighth the size of a grid cell.
   * @type {number}
   * @const
   */
  this.GRID_SIZE_EIGTH = this.GRID_SIZE_QUARTER * 0.5;

  /**
   * The size of the object pool from which we pull trees and rocks.
   * @type {number}
   * @const
   */
  this.OBJECT_POOL_SIZE = 140;

  /**
   * The size of the object pool from which we pull presents.
   * @type {number}
   * @const
   */
  this.PRESENT_POOL_SIZE = 20;

  /**
   * The size of the object pool from which we pull text objects.
   * @type {number}
   * @const
   */
  this.TEXT_POOL_SIZE = 5;

  /**
   * Cached value of half PI.
   * @type {number}
   * @const
   */
  this.HALF_PI = Math.PI * 0.5;

  /**
   * The currently inspected cell of the grid system.
   * @private
   * @type {object}
   */
  this.cell_ = null;

  /**
   * The currently inspected cell of the grid system.
   * @private
   * @type {object}
   */
  this.worldEl_ = null;

  /**
   * The array of cells.
   * @private
   * @type {Array.<object>}
   */
  this.grid_ = [];

  /**
   * The first index of the grid cell matching Santa's or Rudolf's Y position.
   * @private
   * @type {number}
   */
  this.gridMarker_ = 0;

  /**
   * The number of grid cells in the X axis.
   * @private
   * @type {number}
   */
  this.gridMarkersX_ = window.worldWidth / this.GRID_SIZE;

  /**
   * The height of the grid in Y.
   * @private
   * @type {number}
   */
  this.gridHeight_ = window.worldHeight + (this.GRID_SIZE * 4);

  /**
   * The Y position of the last recycled grid cell.
   * @private
   * @type {number}
   */
  this.gridLastY_ = 0;

  /**
   * The threshold for Math.random to clear before a new clearing position
   * can be selected.
   * @private
   * @type {number}
   */
  this.clearingTolerance_ = 1;

  /**
   * The threshold for how much difference there must be between the last
   * clearing position and the newly selected one.
   * @private
   * @type {number}
   */
  this.clearingDiffTolerance_ = 0;

  /**
   * The target position for the clearing value, used for easing.
   * @private
   * @type {number}
   */
  this.targetClearing_ = window.worldWidth * 0.5;

  /**
   * The actual position for the clearing value.
   * @private
   * @type {number}
   */
  this.clearing_ = this.targetClearing_;

  /**
   * The width of the clearing, centered around the clearing_ property.
   * @private
   * @type {number}
   */
  this.clearingWidth_ = window.worldWidth * 0.40;

  /**
   * The last value for the left boundary (clearing_ - clearingWidth_).
   * @private
   * @type {number}
   */
  this.lastLeftBound_ = 0;

  /**
   * The last value for the right boundary (clearing_ + clearingWidth_).
   * @private
   * @type {number}
   */
  this.lastRightBound_ = window.worldWidth;

  /**
   * The pool of all scenery objects and presents.
   * @private
   * @type {Array.<object>}
   */
  this.objectPool_ = [];

  /**
   * The currently inspected object.
   * @private
   * @type {object}
   */
  this.object_ = null;

  /**
   * The index of currently inspected object.
   * @private
   * @type {number}
   */
  this.objectIndex_ = 0;

  /**
   * The number of attempts the algorithm gets to find a suitable
   * object with which to fill a gap in the grid.
   * @private
   * @type {number}
   */
  this.objectTries_ = 10;

  /**
   * The position of the left clearing boundary for rendering.
   * @private
   * @type {number}
   */
  this.renderLeft_ = 0;

  /**
   * The position of the left clearing boundary for rendering.
   * @private
   * @type {number}
   */
  this.renderRight_ = 0;

  /**
   * Store where last present was hit to add the score.
   * @type {{x: number, y: number}}
   * @private
   */
  this.lastHitPresent_ = {
    x: 0,
    y: 0
  };

  // fill up the object pool
  for (var o = 0; o < this.OBJECT_POOL_SIZE; o++) {
    this.objectPool_.push(new SB.Object.TreeRock());
  }

  for (var p = 0; p < this.PRESENT_POOL_SIZE; p++) {
    this.objectPool_.push(new SB.Object.Present());
  }

  // Pool text objects
  for (var m = 0; m < this.TEXT_POOL_SIZE; m++) {
    SB.Object.Text.pool();
  }

  // fill up the grid
  for (var y = 0, h = this.gridHeight_; y < h; y += this.GRID_SIZE) {
    for (var x = 0, w = window.worldWidth; x < w; x += this.GRID_SIZE) {
      this.grid_.push({
        x: x,
        y: -y,
        valid: false,
        objectIndex: null,
        leftBound: this.lastLeftBound_,
        rightBound: this.lastRightBound_,
        leftAngle: this.HALF_PI,
        rightAngle: this.HALF_PI,
        hit: false
      });
    }
  }
  this.gridLastY_ = -y;

};

SB.Object.Scenery.prototype = new SB.Object.Renderable();

/**
 * Stores a reference to the world instance for convenience.
 * @param {SB.Object.Renderable} newWorld The world instance to store.
 */
SB.Object.Scenery.prototype.connectTo = function (newWorld) {
  this.worldEl_ = newWorld;
};

/**
 * Resets the scenery.
 */
SB.Object.Scenery.prototype.reset = function () {

  var g = 0;

  // reset all the internal vars
  // back to their original values
  this.clearingTolerance_ = 1;
  this.clearingDiffTolerance_ = 0;
  this.targetClearing_ = window.worldWidth * 0.5;
  this.clearing_ = this.targetClearing_;
  this.clearingWidth_ = window.worldWidth * 0.40;
  this.lastLeftBound_ = 0;
  this.lastRightBound_ = window.worldWidth;
  this.gridMarker_ = 0;

  for (var y = 0, h = this.gridHeight_; y < h; y += this.GRID_SIZE) {
    for (var x = 0, w = window.worldWidth; x < w; x += this.GRID_SIZE) {

      this.cell_ = this.grid_[g];

      // remove any objects if they're in use
      if (this.cell_.objectIndex !== null) {
        this.resetObject(this.cell_);
      }

      // reset each cell
      this.cell_.x = x;
      this.cell_.y = -y;
      this.cell_.valid = false;
      this.cell_.objectIndex = null;
      this.cell_.leftBound = this.lastLeftBound_;
      this.cell_.rightBound = this.lastRightBound_;
      this.cell_.leftAngle = this.HALF_PI;
      this.cell_.rightAngle = this.HALF_PI;
      this.cell_.hit = false;

      g++;
    }
  }

  // reset the last Y position of the grid
  this.gridLastY_ = -y;
};

/**
 * Tests an object (Santa, Rudolf) against the scenery for collisions. Handles
 * the collision response directly.
 * @param {SB.Object.Renderable} target The target to test.
 * @return {boolean} Whether or not the target hit a present.
 * Scenery collisions are handled internally and not returned.
 */
SB.Object.Scenery.prototype.test = function (target) {

  var targetAngle = null;
  var hitPresent = false;

  // check for matches against the 0th grid items
  for (var g = 0, l = this.grid_.length; g < l; g++) {

    this.cell_ = this.grid_[g];

    if (target.position.y >= this.cell_.y &&
        target.position.y <= this.cell_.y + this.GRID_SIZE) {

      // check for collisions with presents
      if (target.position.x >= this.cell_.x &&
          target.position.x <= this.cell_.x + this.GRID_SIZE) {

        // if there is a present in this cell
        if (this.cell_.objectIndex !== null &&
            this.cell_.objectIndex >= this.OBJECT_POOL_SIZE) {

          this.lastHitPresent_.x = target.position.x;
          this.lastHitPresent_.y = target.position.y;
          this.resetObject(this.cell_);
          hitPresent = true;

          window.santaApp.fire('sound-trigger', "rc_player_present_pickup");
        }
      }

      // check for collisions with boundaries.
      // We only store the boundaries in the first
      // cell of each row of blocks so check
      // that before proceeding
      if (g % this.gridMarkersX_ === 0) {

        var relativeY = target.position.y - this.cell_.y;
        var leftBound = this.cell_.leftBound +
            Math.sin(this.cell_.leftAngle * 2) * relativeY;
        var rightBound = this.cell_.rightBound -
            Math.sin(this.cell_.rightAngle * 2) * relativeY;

        // check for left and right
        if (target.position.x - target.radius <= leftBound) {

          targetAngle = this.cell_.leftAngle - this.HALF_PI;
          target.position.x = leftBound + target.radius + 0.1;

        } else if (target.position.x + target.radius >= rightBound) {

          targetAngle = -this.cell_.rightAngle + this.HALF_PI;
          target.position.x = rightBound - target.radius - 0.1;

        } else {
          // the target did not hit anything
          // so is no longer immune to collisions
          target.rebound = false;
        }

        // if we detected a collision have the
        // object match the grid's boundary's angle
        // and slow it down.
        if (targetAngle !== null) {

          if (!target.rebound) {
            target.hit();
          }

          target.targetRotation = targetAngle;
          target.rebound = true;
          target.targetVelocity *= 0.97;

          break;
        }
      }
    }
  }

  return hitPresent;
};

/**
 * Picks a new clearing value and clearing width. Called whenever
 * a grid row is recycled.
 */
SB.Object.Scenery.prototype.updateClearingValues = function () {

  // pick a new clearing value
  // start by making it more likely
  // that we will pick a new centre point
  this.clearingTolerance_ -= 0.001;
  this.clearingTolerance_ = Math.max(this.clearingTolerance_, 0.85);

  // make sure it gets capped
  this.clearingDiffTolerance_ += 0.1;
  this.clearingDiffTolerance_ = Math.min(this.clearingDiffTolerance_,
      window.worldWidth * 0.8);

  // slowly reduce the width of the
  // path as we recycle each row
  // of the grid
  this.clearingWidth_ -= 0.05;
  this.clearingWidth_ = Math.max(this.clearingWidth_, this.GRID_SIZE * 3);

  if (Math.random() > this.clearingTolerance_) {

    var oldTargetClearing = this.targetClearing_;

    // pick a new one based on the world width
    // and make sure it varies enough from the
    // last clearing value
    do {
      this.targetClearing_ = Math.random() * window.worldWidth;
    } while (Math.abs(this.targetClearing_ - oldTargetClearing) <
      this.clearingDiffTolerance_);
  }

  // tend our clearing val towards it
  this.clearing_ += (this.targetClearing_ - this.clearing_) * 0.1;
};

/**
 * Checks for a grid row needing to be recycled. If recycled it moves
 * the entire row and populates it with scenery and presents.
 */
SB.Object.Scenery.prototype.update = function () {

  var adjustedWorldPos = (this.worldEl_.position.y - window.worldHeight) -
    (this.GRID_SIZE * 2);
  var adjustedGridPos = -this.grid_[this.gridMarker_].y;
  var gridMarkerCount = this.gridMarker_ + this.gridMarkersX_;

  if (adjustedWorldPos > adjustedGridPos) {

    this.updateClearingValues();

    for (var g = this.gridMarker_; g < gridMarkerCount; g++) {

      this.cell_ = this.grid_[g];
      this.cell_.y = this.gridLastY_;
      this.cell_.valid = true;
      this.cell_.hit = false;

      if (this.cell_.objectIndex !== null) {
        this.resetObject(this.cell_);
      }

      if (this.cell_.x >= this.clearing_ - this.clearingWidth_ &&
        this.cell_.x + this.GRID_SIZE <= this.clearing_ + this.clearingWidth_) {
        this.cell_.valid = false;
      }

      if (g === this.gridMarker_) {

        this.cell_.leftBound = Math.ceil((this.clearing_ -
            this.clearingWidth_) / this.GRID_SIZE) * this.GRID_SIZE;
        this.cell_.rightBound = Math.floor((this.clearing_ +
            this.clearingWidth_) / this.GRID_SIZE) * this.GRID_SIZE;

        this.cell_.leftBound = Math.max(0, this.cell_.leftBound);
        this.cell_.rightBound = Math.min(window.worldWidth,
            this.cell_.rightBound);

        this.cell_.leftAngle = Math.atan2(this.GRID_SIZE,
          this.lastLeftBound_ - this.cell_.leftBound);
        this.cell_.rightAngle = Math.atan2(this.GRID_SIZE,
          this.cell_.rightBound - this.lastRightBound_);

        this.lastLeftBound_ = this.cell_.leftBound;
        this.lastRightBound_ = this.cell_.rightBound;

      }

      this.objectIndex_ = null;
      this.objectTries_ = 10;

      // for valid cells we get some piece
      // of scenery, a rock or tree
      if (this.cell_.valid) {

        // pull objects from the pool to fill
        // up those blocks now
        if (Math.random() > 0.4) {
          do {
            this.objectIndex_ = Math.floor(Math.random() *
                this.OBJECT_POOL_SIZE);
            this.objectTries_--;
          } while (this.objectPool_[this.objectIndex_].active);
        }

      } else {

        // we may or may not choose to fill
        // the other cells with presents
        if (Math.random() > 0.98) {
          do {
            this.objectIndex_ = this.OBJECT_POOL_SIZE +
              Math.floor(Math.random() * this.PRESENT_POOL_SIZE);
            this.objectTries_--;

            if (this.objectTries_ <= 0) {
              this.objectIndex_ = null;
              break;
            }

          } while (this.objectPool_[this.objectIndex_].active);
        }
      }

      if (this.objectIndex_ !== null) {

        // assign the index
        this.cell_.objectIndex = this.objectIndex_;

        // get the object
        this.object_ = this.objectPool_[this.objectIndex_];

        // set it as active so that nobody
        // else tries to select it
        this.object_.active = true;

        // add the object to the world
        // for rendering
        this.worldEl_.addChild(this.object_);

        // now position the object in the cell
        this.object_.position.x = this.cell_.x +
          this.GRID_SIZE_HALF - this.GRID_SIZE_EIGTH +
          Math.random() * this.GRID_SIZE_QUARTER;

        this.object_.position.y = this.cell_.y +
          this.GRID_SIZE_HALF - this.GRID_SIZE_EIGTH +
          Math.random() * this.GRID_SIZE_QUARTER;

        // this object should allow us
        // to choose the rendering
        // e.g. present colours
        this.object_.chooseRender();
      }
    }

    this.gridMarker_ += this.gridMarkersX_;
    this.gridMarker_ %= this.grid_.length;
    this.gridLastY_ -= this.GRID_SIZE;
  }
};

SB.Object.Scenery.prototype.addScore = function(score) {
  SB.Object.Text.pop(null, this.lastHitPresent_, score, this.worldEl_);
};

/**
 * Removes an object from the world and makes it available for use.
 * @param {object} cell The cell containing the recyclable object.
 */
SB.Object.Scenery.prototype.resetObject = function (cell) {

  // get the object
  this.object_ = this.objectPool_[cell.objectIndex];

  // set it back to being selectable
  this.object_.active = false;

  // and from the world
  this.worldEl_.removeChild(this.object_);

  cell.objectIndex = null;
};

/**
 * Renders the scenery and race boundary lines to the canvas context.
 */
SB.Object.Scenery.prototype.render = function (ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#D3D3D3";

  for (var g = 0, l = this.grid_.length; g < l; g++) {
    this.cell_ = this.grid_[g];

    if (g % this.gridMarkersX_ === 0) {

      // Start of left
      this.renderLeft_ = this.cell_.leftBound + 5 +
        Math.sin(this.cell_.leftAngle * 2) * this.GRID_SIZE;
      ctx.moveTo(this.renderLeft_, this.cell_.y + this.GRID_SIZE);

      // End of left
      this.renderLeft_ = this.cell_.leftBound + 5;
      ctx.lineTo(this.renderLeft_, this.cell_.y);

      // Start of right
      this.renderRight_ = this.cell_.rightBound - 5 -
        Math.sin(this.cell_.rightAngle * 2) * this.GRID_SIZE;
      ctx.moveTo(this.renderRight_, this.cell_.y + this.GRID_SIZE);

      // End of right
      this.renderRight_ = this.cell_.rightBound - 5;
      ctx.lineTo(this.renderRight_, this.cell_.y);
    }
  }

  ctx.stroke();
  ctx.closePath();
  ctx.restore();
};

SB.Object.Scenery.prototype.getCenter = function() {
  return this.lastLeftBound_ + ((this.lastRightBound_ - this.lastLeftBound_) / 2);
};
