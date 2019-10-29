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

goog.provide('app.Game');

goog.require('Klang');
goog.require('app.Blockly');
goog.require('app.Constants');
goog.require('app.Result');
goog.require('app.Scene');
goog.require('app.Levels');
goog.require('app.freestyleLevel');
goog.require('app.monkeypatches');
goog.require('app.shared.utils');
goog.require('app.Sequencer');

/**
 * @enum {string}
 */
app.GameMode = {
  TEACHER: 'teacher',
  FREESTYLE: 'freestyle',
  CUSTOM: 'custom',
};

/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
 * @constructor
 * @export
 */
app.Game = class {
  constructor(elem) {
    this.blockly = new app.Blockly(elem.querySelector('.blockly'), this);
    this.elem = elem;
    this.levelNumber = null;
    this.level = null;
    /** @type {?app.GameMode} */
    this.currentMode = null;
    this.isPlaying = false;

    const successEl = elem.querySelector('.result--success');
    this.successResult = new app.Result(successEl, this);
    this.failureResult = new app.Result(elem.querySelector('.result--failure'), this);
    this.scene = new app.Scene(elem.querySelector('.scene'), this, this.blockly);

    this.sequencer = new app.Sequencer((beat, bpm) => this.scene.player.onBeat(beat, bpm));

    this.scene.player.listen('start', () => this.sequencer.setVariant(1));
    this.scene.player.listen('finish', () => this.sequencer.setVariant(0));

    this.dismissBlocklyTutorial = () => this.dismissTutorial('codeboogie.gif');
    document.body.addEventListener('blocklyDragBlock', this.dismissBlocklyTutorial, false);
  }

  /**
   * Clean up game instance.
   * @private
   */
  dispose_() {
    document.body.removeEventListener('blocklyDragBlock', this.dismissBlocklyTutorial, false);

    this.scene.dispose();
  }

  /**
   * Transition to next level.
   */
  bumpLevel() {
    // Next level
    this.levelNumber++;

    this.level = this.levels[this.levelNumber];
    if (!this.level) {
      if (this.currentMode === app.GameMode.TEACHER) {
        window.santaApp.fire('game-stop', {
          level: this.levelNumber,
        });
      } else {
        this.restart(app.GameMode.TEACHER);
      }
      return;
    }

    if (this.currentMode === app.GameMode.TEACHER) {
      window.santaApp.fire('game-score', {
        level: this.levelNumber + 1,
        maxLevel: this.levels.length,
      });
    }
    this.sequencer.setTrack(this.level.track, this.level.bpm);

    this.elem.className = this.level.className();

    this.blockly.setLevel(this.level);
    this.scene.setLevel(this.level);
    this.scene.toggleVisibility(true);
  }

  /**
   * @param {!Array<string>} names
   */
  showTutorial(names = []) {
    window.santaApp.fire('tutorial-queue', names);
  }

  dismissTutorial(name) {
    window.santaApp.fire('tutorial-dismiss', [name]);
  }

  /**
   * Resets state of the current level.
   */
  restartLevel() {
    this.scene.restartLevel();
  }

  /**
   * Opens a share overlay to share a url.
   *
   * @param {string} query string to share.
   */
  share(query) {
    window.santaApp.fire('game-data', {dance: query});
    window.santaApp.fire('game-stop');
  }

  /**
   * Starts the game loop.
   */
  start() {
    this.sequencer.start();
  }

  /**
   * Resets all game entities and restarts the game. Can be called at any time.
   *
   * @param {app.GameMode=} mode to play.
   * @param {string=} param
   */
  restart(mode, param) {
    if (mode === app.GameMode.FREESTYLE && this.currentMode === mode) {
      // do nothing
      return;
    }

    this.levelNumber = -1;
    this.currentMode = mode || app.GameMode.TEACHER;

    if (mode === app.GameMode.FREESTYLE) {
      this.levels = app.Levels.createFreestyleLevel(param);
    } else if (mode === app.GameMode.CUSTOM) {
      let level = app.DanceLevel.deserialize(param);
      if (level) {
        this.levels = [level];
      }
    } else {
      this.levels = app.Levels.getDanceClasses();
      this.levelNumber = ~~(+param - 1 || 0);

      if (this.levelNumber < 0 || this.levelNumber >= this.levels.length) {
        this.levelNumber = 0;
      }
      this.levelNumber--;  // because of bumpLevel
    }

    this.scene.reset();
    this.bumpLevel();
  }
};
