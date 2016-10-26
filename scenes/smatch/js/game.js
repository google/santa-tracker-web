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

goog.require('app.Board');
goog.require('app.Constants');

/**
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

    this.interactionOk = false;

    this.board = new app.Board(elem.querySelector('.gameboard'));

    this.board.ongesture = (x, y, ox, oy) => {
      if (!this.interactionOk) {
        return;  // drop event while a step is happening
      }
      this.interactionOk = false;

      this.board.swap(x, y, ox, oy);
      window.setTimeout(() => this.step(() => {
        console.info('swap step done');
      }), 500);
    };
  }

  fillBoard() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    for (let x = 0; x < this.board.size; ++x) {
      for (;;) {
        let color = colors[Math.floor(Math.random() * colors.length)];
        if (this.board.drop(x, 'present', color) == -1) {
          break;
        }
      }
    }
  }

  /**
   * Starts the game.
   * @export
   */
  start() {
    this.restart();

    // Fill board, wait 1s for it to settle.
    this.fillBoard();
    window.setTimeout(() => this.step(() => {
      console.info('initial step done');
    }), 500);
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
   * Perform a step of the game, matching gems and creating new ones.
   */
  step(done) {
    this.interactionOk = false;  // TODO(samthor): get a 'lock' on the board
    this.elem.classList.add('step');

    const internalStep = () => {
      const count = this.board.doMatch();
      this.board.doFall();

      if (count > 0) {
        // Something matched: drop new cells, run internal step again.
        window.setTimeout(() => {
          this.fillBoard();
          window.setTimeout(internalStep, 500);
        }, 500);
      } else {
        this.elem.classList.remove('step');
        this.interactionOk = true;
        done();
      }
    }

    internalStep();
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
    }
  }

  /**
   * Called by the scoreboard to stop the game when the time is up.
   */
  gameover() {
    this.freezeGame();
//    this.gameoverDialog.show();
    window.santaApp.fire('sound-trigger', 'pd_game_over');
    window.santaApp.fire('sound-trigger', 'music_ingame_gameover');
    window.santaApp.fire('analytics-track-game-over', {
      gameid: 'presentdrop',
      score: 0,
      level: this.level,
      timePlayed: Date.now() - this.gameStartTime
    });
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
//    this.tutorial.dispose();
  }

}
