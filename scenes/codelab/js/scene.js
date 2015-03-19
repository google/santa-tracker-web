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

goog.provide('app.Scene');

goog.require('app.BlockRunner');
goog.require('app.DecoratedSquare');
goog.require('app.EmptySquare');
goog.require('app.InputEvent');
goog.require('app.Map');
goog.require('app.Player');
goog.require('app.Present');
goog.require('app.ResultType');
goog.require('app.SceneTutorial');
goog.require('app.TileType');
goog.require('app.TreeSquare');
goog.require('goog.style');

/**
 * The main view for the maze game. Manages the gameplay viewport and
 * graphics which appear to the right of the blockly scene.
 *
 * @param {Element} el root .scene element.
 * @param {app.Game} game instance.
 * @param {app.Blockly} blockly wrapper.
 * @constructor
 */
app.Scene = function(el, game, blockly) {
  this.active_ = true;
  this.blockly_ = blockly;
  this.blockRunner_ = new app.BlockRunner(this, blockly);
  this.cachedWindowHeight_ = null;
  this.cachedWindowWidth_ = null;
  this.el_ = el;
  this.game = game;
  this.level = null;
  this.map_ = new app.Map();
  this.portraitMode_ = false;
  this.player = new app.Player(el.querySelector('.player'), this.map_);
  this.presents = [];
  this.scaleRatio_ = 1;
  this.squares_ = [];
  this.svgEl_ = el.querySelector('.scene__svg');
  this.tileProgress_ = 0;
  this.visible_ = false;

  // The world stage
  this.underlayEl_ = el.parentNode.querySelector('.scene-underlay');
  this.worldEl_ = el.querySelector('.scene__world');
  this.bgEl = el.querySelector('.scene__bg');
  this.presentsEl = el.querySelector('.scene__presents');
  this.buttonEl_ = el.querySelector('.scene__play');

  // Portrait draggability
  this.dragPlayer_ = document.timeline.play();
  this.dragStartTime_ = null;
  this.dragStartX_ = null;
  this.dragLastX_ = null;
  this.dragDirection_ = null;

  // Bind handlers
  this.calculateViewport_ = this.calculateViewport_.bind(this);
  this.onClickRun_ = this.onClickRun_.bind(this);
  this.onMouseDown_ = this.onMouseDown_.bind(this);
  this.onMouseMove_ = this.onMouseMove_.bind(this);
  this.onMouseUp_ = this.onMouseUp_.bind(this);
  this.createSquare_ = this.createSquare_.bind(this);
  this.cleanWorld_ = this.cleanWorld_.bind(this);

  // Calculate the viewport now and whenever the browser resizes.
  window.addEventListener('resize', this.calculateViewport_, false);
  this.calculateViewport_();

  // Other events
  this.buttonEl_.addEventListener('click', this.onClickRun_, false);
  this.el_.addEventListener(app.InputEvent.START, this.onMouseDown_, false);
  this.underlayEl_.addEventListener(app.InputEvent.START, this.onMouseDown_, false);
  window.addEventListener(app.InputEvent.MOVE, this.onMouseMove_, false);
  window.addEventListener(app.InputEvent.END, this.onMouseUp_, false);
};

/**
 * Number of tile widths to allow as margin around the level tiles,
 * either as whitespace on left, or as actual tiles from other directions.
 * @type {number}
 */
app.Scene.VIEWPORT_TILE_MARGIN = 0.3;

/**
 * Maximum number of tiles to show horizontally.
 * @type {number}
 */
app.Scene.VIEWPORT_MAX_TILES_X = app.Constants.LEVEL_USABLE_MAX_COLS +
    app.Scene.VIEWPORT_TILE_MARGIN * 2;

/**
 * Minimum number of tiles to show horizontally. This is important for
 * mobile portrait windows. All gameplay must fit in these tiles.
 * @type {number}
 */
app.Scene.VIEWPORT_MIN_TILES_X = app.Constants.LEVEL_USABLE_MIN_COLS +
    app.Scene.VIEWPORT_TILE_MARGIN * 1.5;

/**
 * Maximum number of tiles to show vertically.
 * @type {number}
 */
app.Scene.VIEWPORT_MAX_TILES_Y = app.Constants.LEVEL_USABLE_ROWS +
    app.Scene.VIEWPORT_TILE_MARGIN * 2;

/**
 * Maximum number of tiles to show vertically.
 * @type {number}
 */
app.Scene.VIEWPORT_MIN_TILES_Y = 9 +
    app.Scene.VIEWPORT_TILE_MARGIN * 2;

/**
 * The virtual size of each tile, gets scaled based on window size according to the
 * VIEWPORT tile requirements above.
 * @type {number}
 */
app.Scene.TILE_SIZE = 8;

/**
 * Margin between tiles in (virtual) scaled em units.
 * @type {number}
 */
app.Scene.TILE_MARGIN = 0.4;

/**
 * Full size of each tile, including the margin to next tile. Useful in layout of tiles.
 * @type {number}
 */
app.Scene.TILE_OUTER_SIZE = app.Scene.TILE_SIZE + app.Scene.TILE_MARGIN;

/**
 * Clean up resources. Not really used atm as our iframe will be destroyed anyways when
 * leaving this game.
 */
app.Scene.prototype.dispose = function() {
  window.removeEventListener('resize', this.calculateViewport_, false);

  this.buttonEl_.removeEventListener('click', this.onClickRun_, false);
  this.el_.removeEventListener(app.InputEvent.START, this.onMouseDown_, false);
  this.underlayEl_.removeEventListener(app.InputEvent.START, this.onMouseDown_, false);
  window.removeEventListener(app.InputEvent.MOVE, this.onMouseMove_, false);
  window.removeEventListener(app.InputEvent.END, this.onMouseUp_, false);
};

/**
 * Resets the state of the scene for a new game.
 */
app.Scene.prototype.reset = function() {
  this.level = null;
  this.cleanWorld_();
};

/**
 * Create background graphics for the map.
 * @private
 */
app.Scene.prototype.createWorld_ = function() {
  var existingMin = Number.MAX_VALUE;
  var existingMax = -1;
  for (var i = 0, square; square = this.squares_[i]; i++) {
    if (existingMin > square.y) {
      existingMin = square.y;
    }
    if (existingMax < square.y) {
      existingMax = square.y;
    }
  }

  var that = this;

  if (this.squares_.length) {
    this.map_.iterateTiles(this.level.minY - 1, Math.min(existingMin, this.level.maxY + 1),
                           this.createSquare_);
    this.map_.iterateTiles(Math.max(existingMax, this.level.minY - 1), this.level.maxY + 1,
                           this.createSquare_);
  } else {
    this.map_.iterateTiles(this.level.minY - 1, this.level.maxY + 1, this.createSquare_);
  }
};

/**
 * Creates a square in the world.
 * @param {app.TileInfo} tile to create.
 * @param {number} x position of square.
 * @param {number} y position of square.
 * @private
 */
app.Scene.prototype.createSquare_ = function(tile, x, y) {
  if (tile === app.TileType.TREE) {
    this.squares_.push(app.TreeSquare.pop(this, x, y));
  } else if (tile === app.TileType.EMPTY || tile === app.TileType.POI) {
    this.squares_.push(app.EmptySquare.pop(this, x, y));
  } else {
    this.squares_.push(app.EmptySquare.pop(this, x, y));
    this.squares_.push(app.DecoratedSquare.pop(this, x, y, tile));
  }
};

/**
 * Pops unused squares and presents to the pool.
 * @private
 */
app.Scene.prototype.cleanWorld_ = function() {
  // Clean up old squares.
  this.squares_ = this.squares_.filter(function(square) {
    if (!this.level || square.y < this.level.minY - 1 || square.y > this.level.maxY) {
      square.remove();
    } else {
      return true;
    }
  }, this);

  // Clean up old presents.
  this.presents = this.presents.filter(function(present) {
    if (!this.level || this.level !== present.level) {
      present.remove();
    } else {
      return true;
    }
  }, this);
};

/**
 * Changes the current level.
 * @param {number} level
 */
app.Scene.prototype.setLevel = function(level) {
  var oldProgress = this.tileProgress_;
  var shouldTransition = !!this.level;

  this.level = level;
  this.tileProgress_ = this.map_.height - level.maxY;

  this.createWorld_();
  this.createPresents_();
  this.player.setLevel(level);
  this.blockRunner_.resetAnimation();
  this.updateWorld_();

  if (shouldTransition) {
    this.animateLevelTransition_(oldProgress);
  }

  // Show the scene in portrait, then hide it after 3 seconds.
  this.portraitToggleScene(true);
  setTimeout(this.portraitToggleScene.bind(this, false), 3000);
};

/**
 * Resets state to the current level. Need to reset graphics as well when changing levels
 * or restarting the level. Does not need to reset graphics after doing a dry run of
 * blocks.
 */
app.Scene.prototype.restartLevel = function() {
  this.player.restartLevel();
  this.blockRunner_.restartLevel();
};

/**
 * Create present instances for a new level.
 * @private
 */
app.Scene.prototype.createPresents_ = function() {
  // Clean up old presents.
  this.presents.forEach(function(oldPresent) {
    oldPresent.remove();
  });
  this.presents = [];

  // Create new presents.
  this.level.presents.forEach(function(info) {
    var present = app.Present.pop(this, info.x, info.y, this.level);
    this.presents.push(present);
  }, this);
};

/**
 * Positions the map correctly for the current level.
 * @private
 */
app.Scene.prototype.updateWorld_ = function() {
  var worldTransform = this.getWorldTransform_(this.tileProgress_);
  goog.style.setStyle(this.worldEl_, 'transform', worldTransform);
};

/**
 * Animates the map position from an old level to a new level.
 * @param {number} oldProgress tile progress from the old level.
 * @private
 */
app.Scene.prototype.animateLevelTransition_ = function(oldProgress) {
  var player = this.worldEl_.animate([
    {transform: this.getWorldTransform_(oldProgress)},
    {transform: this.getWorldTransform_(this.tileProgress_)}
  ], {duration: 800, easing: 'ease-in-out'});
  player.addEventListener('finish', this.cleanWorld_);
};

/**
 * Calculates the transform/positioning of the world.
 * @param {number} progress how many tiles have we progressed on the map.
 * @return {string} a css transform statement.
 * @private
 */
app.Scene.prototype.getWorldTransform_ = function(progress) {
  var bottomTile = this.map_.height - progress + app.Scene.VIEWPORT_TILE_MARGIN;
  var viewportHeight = app.Scene.VIEWPORT_MAX_TILES_Y * app.Scene.TILE_OUTER_SIZE;
  var translateY = -bottomTile * app.Scene.TILE_OUTER_SIZE + viewportHeight;

  return 'translate(0, ' + translateY + 'em)';
};

/**
 * Configures scaling and width of scene elements. Runs on init and resize.
 * @private
 */
app.Scene.prototype.calculateViewport_ = function() {
  // Blockly spams window.onresize for their scrollbar logic. Let's ignore those.
  if (window.innerHeight === this.cachedWindowHeight_ &&
      window.innerWidth === this.cachedWindowWidth_) {
    return;
  }
  this.cachedWindowHeight_ = window.innerHeight;
  this.cachedWindowWidth_ = window.innerWidth;

  // Calculate width and scaling for the scene, with special handling for portrait-like
  // windows.
  var aspectRatio = Math.min(Math.max(window.innerWidth / 2 / window.innerHeight,
      app.Scene.VIEWPORT_MIN_TILES_X / app.Scene.VIEWPORT_MAX_TILES_Y),
      app.Scene.VIEWPORT_MAX_TILES_X / app.Scene.VIEWPORT_MIN_TILES_Y);
  var width = window.innerHeight * aspectRatio;

  var tileSize = Math.max(window.innerHeight / app.Scene.VIEWPORT_MAX_TILES_Y,
      width / app.Scene.VIEWPORT_MAX_TILES_X);

  var portraitMode = false;
  var workspaceWidth = window.innerWidth - this.blockly_.getToolbarWidth();
  if (workspaceWidth - width < app.Constants.BLOCKLY_MIN_WIDTH) {
    portraitMode = true;
    width = window.innerWidth - app.Constants.EDGE_MIN_WIDTH;
  }

  this.portraitMode_ = portraitMode;
  this.width_ = width;
  this.scaleRatio_ = tileSize / (app.Scene.TILE_OUTER_SIZE * 10); // em2px

  // Apply width and scaling in DOM.
  this.el_.style.fontSize = this.scaleRatio_ * 10 + 'px';
  this.el_.style.width = width + 'px';

  this.configPortraitDraggability_();
};

/**
 * Disables or enables and reconfigures the expand/collapse animation for portrait.
 * @private
 */
app.Scene.prototype.configPortraitDraggability_ = function() {
  if (this.portraitMode_) {
    this.dragPlayer_.source = new AnimationGroup([
      new Animation(this.el_, [
        {transform: 'translate3d(0, 0, 0)'},
        {transform: 'translate3d(' + (this.width_ - app.Constants.EDGE_MIN_WIDTH) + 'px, 0, 0)'}
      ], {duration: app.Constants.SCENE_TOGGLE_DURATION, fill: 'forwards'}),
      new Animation(this.underlayEl_, [
        {opacity: 1, visibility: 'visible'},
        {opacity: 0, visibility: 'visible', offset: 0.95},
        {opacity: 0, visibility: 'hidden'}
      ], {duration: app.Constants.SCENE_TOGGLE_DURATION, fill: 'forwards'})
    ], {fill: 'forwards'});
    this.dragPlayer_.pause();
  } else if (this.dragPlayer_) {
    this.dragPlayer_.source = null;
  }
};

/**
 * Mouse/touch down handler for portrait mode. Stores mouse/tap position
 * for other handlers to use.
 * @param {MouseEvent|TouchEvent} e event object.
 * @private
 */
app.Scene.prototype.onMouseDown_ = function(e) {
  if (!this.portraitMode_) {
    return;
  }

  e = app.InputEvent.normalize(e);
  this.dragLastX_ = this.dragStartX_ = e.clientX;
};

/**
 * Mouse/touch move handler for portrait mode. Starts moving the scene if
 * dragged far enough.
 * @param {MouseEvent|TouchEvent} e event object.
 * @private
 */
app.Scene.prototype.onMouseMove_ = function(e) {
  if (this.dragStartX_ == null) {
    return;
  }
  e.preventDefault();

  // Figure out if we have dragged far enough to start moving the scene.
  e = app.InputEvent.normalize(e);
  var deltaX = e.clientX - this.dragStartX_;
  if (this.dragStartTime_ == null) {
    if (Math.abs(deltaX) < app.Constants.SCENE_TOGGLE_MIN_DRAG) {
      return;
    }
    this.dragStartTime_ = this.dragPlayer_.currentTime;
    this.dragPlayer_.pause();
  }

  // Figure out which direction is currently being dragged in.
  // Could be more elaborate for sure.
  this.dragDirection_ = (e.clientX - this.dragLastX_) === 0 ?
      this.dragDirection_ :
      (e.clientX - this.dragLastX_) < 0;
  this.dragLastX_ = e.clientX;

  // Calculate a currentTime for the animation based on drag.
  var newCurrentTime = this.dragStartTime_ +
      deltaX / this.width_ * app.Constants.SCENE_TOGGLE_DURATION;
  newCurrentTime = Math.max(0, Math.min(app.Constants.SCENE_TOGGLE_DURATION, newCurrentTime));
  this.dragPlayer_.currentTime = newCurrentTime;
};

/**
 * Mouse/touch up handler for portrait mode. Makes sure the scene is either
 * visible or hidden. Also checks if the user clicked/tapped to show/hide the
 * scene.
 * @param {MouseEvent|TouchEvent} e event object.
 * @private
 */
app.Scene.prototype.onMouseUp_ = function(e) {
  if (this.dragStartX_ == null) {
    return;
  }

  // We're either finishing an elaborate tap, or finishing a drag. Let's figure out if we should
  // expand or collapse.
  var didTap = this.dragStartTime_ == null && e.target !== this.buttonEl_;

  var makeVisible = didTap ?
      this.dragPlayer_.currentTime > app.Constants.SCENE_TOGGLE_DURATION / 2 :
      this.dragDirection_;
  var tappingUnderlay = e.target === this.underlayEl_;
  var didTapCorrectSide = didTap && tappingUnderlay === !makeVisible;

  var notAtEnd = this.dragPlayer_.currentTime > 0 &&
      this.dragPlayer_.currentTime < app.Constants.SCENE_TOGGLE_DURATION;

  if (didTapCorrectSide || notAtEnd) {
    this.portraitToggleScene(makeVisible);
  }

  this.dragStartX_ = null;
  this.dragStartTime_ = null;
};

/**
 * Checks if the scene is currently visible in portrait mode.
 * @return {boolean} true if visible.
 * @private
 */
app.Scene.prototype.isSceneVisibleInPortrait_ = function() {
  return this.dragPlayer_.currentTime === 0;
};

/**
 * Conditionally show or hide the scene with animation in portrait mode.
 * @param {boolean} visible true if the scene should be shown.
 */
app.Scene.prototype.portraitToggleScene = function(visible) {
  if (!this.portraitMode_) {
    return;
  }

  var targetTime = visible ? 0 : app.Constants.SCENE_TOGGLE_DURATION;
  if (this.dragPlayer_.currentTime === targetTime) {
    return;
  }

  this.dragPlayer_.playbackRate = visible ? -1 : 1;
  this.dragPlayer_.play();
};

/**
 * Click handler on play button. Starts execution of the blockly code.
 * @private
 */
app.Scene.prototype.onClickRun_ = function() {
  this.buttonEl_.blur();

  if (this.portraitMode_ && !this.isSceneVisibleInPortrait_()) {
    this.portraitToggleScene(true);
    setTimeout(this.blockRunner_.execute.bind(this.blockRunner_),
        app.Constants.SCENE_TOGGLE_DURATION);
  } else {
    this.blockRunner_.execute();
  }
};

/**
 * Callback after running the blockly code. Presents user with smart
 * success or failure messages.
 * @param {app.LevelResult} result of execution.
 */
app.Scene.prototype.onFinishExecution = function(result) {
  if (this.level === app.levels[app.levels.length - 1]) {
    result.graphic = result.levelComplete ? '#result-final' : null;
    result.isFinalLevel = true;
  }

  if (result.levelComplete) {
    this.game.successResult.show(result);
  } else {
    this.game.failureResult.show(result);
  }
};

/**
 * Returns the width the scene steals from the blockly workspace.
 * @return {number} minimum size of scene in pixels.
 */
app.Scene.prototype.getWidth = function() {
  if (!this.visible_) {
    return 0;
  } else if (this.portraitMode_) {
    return app.Constants.EDGE_MIN_WIDTH;
  } else {
    return this.width_;
  }
};

/**
 * Sets if the maze viewport should be visible or not. Depends on the active level.
 * @param {boolean} visible should be true to show the maze.
 */
app.Scene.prototype.toggleVisibility = function(visible) {
  if (this.visible_ === visible) {
    return;
  }
  this.visible_ = visible;

  // Keep it simple for now. Translation animation might conflict with portrait dragging.
  this.el_.style.display = visible ? 'block' : 'none';
  this.underlayEl_.style.display = visible ? 'block' : 'none';
};
