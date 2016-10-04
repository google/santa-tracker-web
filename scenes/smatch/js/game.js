/*
 * Copyright 2016 Google Inc. All rights reserved.
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

goog.require('app.shared.Gameover');
goog.require('app.shared.Tutorial');

/**
 * @implements {SharedGame}
 * @export
 */
app.Game = class Game {

 /**
  * Main game class.
  * @param {!Element} elem A DOM element which wraps the game.
  */
  constructor(elem) {
    this.elem = elem;
    this.isPlaying = false;
    this.paused = false;
    this.gameStartTime = new Date();
    this.level = 0;
    this.scale = 1;

    this.scoreboard = new Scoreboard(this, elem.querySelector('.board'), 1);  // TODO levels?
    this.gameoverDialog = new Gameover(this, elem.querySelector('.gameover'));
    this.tutorial = new Tutorial(elem, 'touch-leftright', 'keys-space keys-leftright', 'spacenav-space spacenav-leftright');

    this.watchSceneSize_();
  }

  /**
   * Starts the game.
   * @export
   */
  start() {
    this.restart();
    this.tutorial.start();
  }

  /**
   * Resets all game entities and restarts the game. Can be called at any time.
   */
  restart() {
    window.santaApp.fire('sound-ambient', 'music_start_ingame');
    window.santaApp.fire('sound-trigger', 'pd_start_game');
    window.santaApp.fire('analytics-track-game-start', {gameid: 'smatch'});
    this.unfreezeGame();
  }

  /**
   * Scale the game down for smaller resolutions.
   * @param {number} scale A scale between 0 and 1 on how much to scale.
   */
  setScale(scale) {
    this.scale = scale;
    const view = this.elem.querySelector('.view');
    if (scale < 1) {
      view.style.transform = `scale(${scale})`;
    } else {
      view.style.transform = '';
    }
  }

  /**
   * Stops the onFrame loop and stops all relevant CSS3 animations.
   * Used by pause and gameover.
   */
  freezeGame() {
    this.isPlaying = false;
    this.elem.classList.add('frozen');
  }


  /**
   * Starts the onFrame loop and enables CSS3 animations.
   * Used by unpause and restart.
   */
  unfreezeGame() {
    if (!this.isPlaying) {
      this.elem.classList.remove('frozen');
      this.elem.focus();

      this.isPlaying = true;
      // this.lastFrame = Date.now() / 1000;
      // this.requestId = utils.requestAnimFrame(this.onFrame_);
    }
  }

  /**
   * Called by the scoreboard to stop the game when the time is up.
   */
  gameover() {
    this.freezeGame();
    this.gameoverDialog.show();
    window.santaApp.fire('sound-trigger', 'pd_game_over');
    window.santaApp.fire('sound-trigger', 'music_ingame_gameover');
    window.santaApp.fire('analytics-track-game-over', {
      gameid: 'presentdrop',
      score: this.scoreboard.score,
      level: this.level,
      timePlayed: Date.now() - this.gameStartTime
    });
  }

  /**
   * Detects scene size and manages scale. Updates on window resize.
   */
  watchSceneSize_() {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight - window.santaApp.headerSize;
      let scale = width < 890 ? width / 890 : 1;
      scale = height < 660 ? Math.min(height / 640, scale) : scale;
      this.setScale(scale);
    };

    updateSize();
    // TODO: better resize handler that gets removed
//    window.addEventListener('resize', updateSize);
  }

  /**
   * Pauses/unpauses the game.
   */
 togglePause() {
   // TODO: pause/resume is totally broken in all games (it nukes freeze state)
    if (this.paused) {
      this.resume();
    // Only allow pausing if the game is playing (not game over).
    } else if (this.isPlaying) {
      this.pause();
    }
  }

  /**
   * Pause the game.
   */
  pause() {
    this.paused = true;
    this.freezeGame();
  }

  /**
   * Resume the game.
   */
  resume() {
    this.paused = false;
    this.unfreezeGame();
  }

  /**
   * Cleanup
   * @export
   */
  dispose() {
    window.santaApp.fire('analytics-track-game-quit', {
      gameid: 'presentdrop',
      timePlayed: Date.now() - this.gameStartTime,
      level: this.level
    });
    this.freezeGame();
    this.tutorial.dispose();
  }

}

/**
 * Called by levels to bump the level.
 */
// app.Game.prototype.nextLevel = function() {
//   if (this.level === app.Constants.TOTAL_LEVELS - 1) {
//     this.gameover();
//     return;
//   }
//
//   this.level++;
//   this.scoreboard.setLevel(this.level);
//   this.chimneySpeed += app.Constants.CHIMNEY_SPEED_PER_LEVEL;
//   window.santaApp.fire('sound-trigger', 'pd_player_level_up');
// };

