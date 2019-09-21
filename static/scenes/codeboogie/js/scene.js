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
'use strict';

goog.provide('app.Scene');

goog.require('app.AnimationPlayer');
goog.require('app.BlockRunner');
goog.require('app.InputEvent');
goog.require('app.ResultType');
goog.require('goog.style');

/**
 * The main view for the maze game. Manages the gameplay viewport and
 * graphics which appear to the right of the blockly scene.
 *
 * @param {Element} el root .scene element.
 * @param {!app.Game} game instance.
 * @param {!app.Blockly} blockly wrapper.
 * @constructor
 */
app.Scene = class {
  constructor(el, game, blockly) {
    this.blockly_ = blockly;
    this.player = new app.AnimationPlayer(el);
    this.blockRunner_ = new app.BlockRunner(this, blockly);
    this.cachedWindowHeight_ = null;
    this.cachedWindowWidth_ = null;
    this.el_ = el;
    this.game = game;
    /** @type {app.Level} */
    this.level = null;
    this.portraitMode_ = false;
    this.scaleRatio_ = 1;
    this.visible_ = false;
    this.width_ = 0;

    // The world stage
    this.parentEl_ = el.parentNode;
    this.underlayEl_ = el.parentNode.querySelector('.scene-underlay');
    this.charactersEl_ = el.querySelector('.scene__characters');
    this.buttonEl_ = el.querySelector('.scene__play');

    // Bind handlers
    this.calculateViewport_ = this.calculateViewport_.bind(this);
    this.onClickRun_ = this.onClickRun_.bind(this);
    this.onClickScene_ = this.onClickScene_.bind(this);
    this.onClickUnderlay_ = this.onClickUnderlay_.bind(this);

    // Calculate the viewport now and whenever the browser resizes.
    window.addEventListener('resize', this.calculateViewport_, false);
    window.requestAnimationFrame(() => this.calculateViewport_(true));
    this.calculateViewport_();

    // Other events
    this.buttonEl_.addEventListener('click', this.onClickRun_, false);
    this.el_.addEventListener('click', this.onClickScene_, false);
    this.underlayEl_.addEventListener('click', this.onClickUnderlay_, false);
  }

  /**
   * Clean up resources. Not really used atm as our iframe will be destroyed anyways when
   * leaving this game.
   */
  dispose() {
    window.removeEventListener('resize', this.calculateViewport_, false);

    this.buttonEl_.removeEventListener('click', this.onClickRun_, false);
    this.el_.removeEventListener('click', this.onClickScene_, false);
    this.underlayEl_.removeEventListener('click', this.onClickUnderlay_, false);
  }

  /**
   * Resets the state of the scene for a new game.
   */
  reset() {
    this.level = null;
  }

  /**
   * @return {boolean} whether we're in portrait mode
   */
  getPortraitMode() {
    return this.portraitMode_;
  };

  /**
   * Changes the current level.
   *
   * @param {app.DanceLevel} level
   */
  setLevel(level) {
    this.level = level;
    this.player.setLevel(level);

    // Show the scene in portrait, then hide it after 3 seconds.
    this.portraitToggleScene(true);

    let introAnimation = !level.freestyle && level.introAnimation();
    if (introAnimation) {
      this.blockRunner_.runAnimation(introAnimation);
    } else {
      // show immediately, we're in freestyle mode
      this.showTutorials_();
    }
  }

  /**
   * Resets state to the current level. Need to reset graphics as well when changing levels
   * or restarting the level. Does not need to reset graphics after doing a dry run of
   * blocks.
   */
  restartLevel() {
    this.blockRunner_.restartLevel();
  }

  /**
   * Configures scaling and width of scene elements. Runs on init and resize.
   * @private
   */
  calculateViewport_(force = false) {
    // Blockly spams window.onresize for their scrollbar logic. Let's ignore those.
    if (!force &&
        window.innerHeight === this.cachedWindowHeight_ &&
        window.innerWidth === this.cachedWindowWidth_) {
      return;
    }
    this.cachedWindowHeight_ = window.innerHeight;
    this.cachedWindowWidth_ = window.innerWidth;

    // Calculate width and scaling for the scene, with special handling for portrait-like
    // windows.
    var sceneHeight = window.innerHeight;
    var sceneAspectRatio = Math.max(
        Math.min(window.innerWidth / 2 / sceneHeight,
            app.Scene.CONTENT_ASPECT_RATIO_MAX),
        app.Scene.CONTENT_ASPECT_RATIO_MIN
    );
    var sceneWidth = sceneHeight * sceneAspectRatio;

    var portraitMode = false;
    var workspaceWidth = window.innerWidth - this.blockly_.getToolbarWidth();
    if (workspaceWidth - sceneWidth < app.Constants.BLOCKLY_MIN_WIDTH) {
      portraitMode = true;
      sceneWidth = window.innerWidth - app.Constants.EDGE_MIN_WIDTH;
    }

    this.portraitMode_ = portraitMode;
    this.parentEl_.classList.toggle('responsive', this.portraitMode_);
    this.width_ = sceneWidth;
    this.scaleRatio_ = Math.min(sceneWidth / 540, sceneHeight / app.Scene.CONTENT_HEIGHT);

    // Apply width and scaling in DOM.
    this.el_.style.fontSize = this.scaleRatio_ * 10 + 'px';
    this.el_.style.width = sceneWidth + 'px';
    this.charactersEl_.style.transform = 'scale(' + Math.min(1, this.scaleRatio_) + ')';
  }

  /**
   * Click handler for scene. Shows tools.
   * @private
   */
  onClickScene_() {
    this.portraitToggleScene(true, true);
  }

  /**
   * Click handler for overlay. Shows play area.
   * @private
   */
  onClickUnderlay_() {
    this.portraitToggleScene(false, true);
  }

  /**
   * Conditionally show or hide the scene with animation in portrait mode.
   * @param {boolean} visible true if the scene should be shown.
   */
  portraitToggleScene(visible, userAction) {
    if (userAction) {
      this.game.dismissTutorial('codeboogie_tray.mp4');
    }
    this.parentEl_.classList.toggle('show', !visible);
  }

  /**
   * Click handler on play button. Starts execution of the blockly code.
   * @private
   */
  onClickRun_(ev) {
    ev.stopPropagation();  // don't trigger scene click
    this.buttonEl_.blur();
    this.game.dismissTutorial();

    if (this.portraitMode_) {
      this.portraitToggleScene(true);
      window.setTimeout(() => this.blockRunner_.execute(), app.Constants.SCENE_TOGGLE_DURATION);
    } else {
      this.blockRunner_.execute();
      Klang.triggerEvent('generic_button_click');
    }
  }

  showTutorials_() {
    const tutorials = ['codeboogie.gif'];
    if (this.portraitMode_) {
      // This isn't perfect because transitions back from mobile mode will retain the tray, but it's
      // fine for now.
      tutorials.unshift('codeboogie_tray.mp4');  // put before regular tutorial
    }
    this.game.showTutorial(tutorials);
  }

  /**
   * Callback after running the blockly code. Presents user with smart
   * success or failure messages.
   *
   * @param {app.LevelResult} result of execution.
   */
  onFinishExecution(result) {
    if (!result.showResult()) {
      // this occurs on the "follow these steps" guide
      this.showTutorials_();
      return;
    }
    if (this.level === this.game.levels[this.game.levels.length - 1]) {
      result.isFinalLevel = true;
    }

    if (result.levelComplete) {
      Klang.triggerEvent('cb_win');
      this.game.successResult.show(result);
    } else {
      Klang.triggerEvent('cb_fail');
      this.game.failureResult.show(result);
    }
  }

  /**
   * Returns the width the scene steals from the blockly workspace.
   * @return {number} minimum size of scene in pixels.
   */
  getWidth() {
    if (!this.visible_) {
      return 0;
    } else if (this.portraitMode_) {
      return app.Constants.EDGE_MIN_WIDTH;
    } else {
      return this.width_;
    }
  }

  /**
   * Sets if the maze viewport should be visible or not. Depends on the active level.
   * @param {boolean} visible should be true to show the maze.
   */
  toggleVisibility(visible) {
    this.visible_ = visible;

    // Keep it simple for now. Translation animation might conflict with portrait dragging.
    this.el_.hidden = !visible;
    this.underlayEl_.hidden = !visible;
  }
};

/**
 * Base height of scene contents. Characters will be scaled when smaller.
 * @type {number}
 */
app.Scene.CONTENT_HEIGHT = 800;

/**
 * Maximum aspect ratio for scene.
 * @type {number}
 */
app.Scene.CONTENT_ASPECT_RATIO_MAX = 1;

/**
 * Minimum aspect ratio for scene before going into portrait mode.
 * @type {number}
 */
app.Scene.CONTENT_ASPECT_RATIO_MIN = 1 / 2;

/**
 * Minimum margin from scene contents to edge.
 * @type {number}
 */
app.Scene.SCENE_PADDING = 20;
