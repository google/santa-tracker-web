/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('app.ScoreScreen');

goog.require('Constants');

goog.require('app.LevelManager');
goog.require('app.shared.utils');

class ScoreScreen {
  init(game, elem, playerOption) {
    this.game = game;
    this.elem = elem;

    this.dom = {
      skipButton: this.elem.querySelector('[data-score-screen-skip]'),
      players: this.elem.querySelectorAll('[data-score-screen-player]'),
    };

    // if single player
    if (playerOption == Constants.PLAYER_OPTIONS.SINGLE) {
      this.dom.players[1].remove();
      this.elem.classList.add('single-player');
      // put winning image
      const domCharacter = this.dom.players[0].querySelector(`[data-score-screen-character]`);
      domCharacter.src = `img/players/a/win.svg`;
    }

    this.dom.skipButton.addEventListener('click', this.onSkipControlsClick.bind(this));
    this.dom.skipButton.addEventListener('mouseenter', this.onSkipControlsOver.bind(this));
  }

  show() {
    this.elem.classList.remove('is-hidden')
    this.dom.skipButton.focus();
    this.state = 'show'
    window.santaApp.fire('sound-trigger', 'buildandbolt_chord');
    window.santaApp.fire('sound-trigger', 'buildandbolt_level_transition');
    this.stopWalkSounds();
  }

   /**
   * Timeout to prevent walk loop to start after game has ended
   */
  stopWalkSounds() {
    setTimeout(()=>{
      window.santaApp.fire('sound-trigger', 'buildandbolt_player_walk_stop', 'all');
      window.santaApp.fire('sound-trigger', 'buildandbolt_ice_stop', 'all');
    }, 10)
  }

  showEnd(scoreResult, multiplayer) {
    // show end score screen
    this.show();
    this.elem.classList.add('game-end');

    if (multiplayer) {
      const { playersState, tie } = scoreResult;
      if (tie) {
        this.elem.classList.add('tie');
      } else {
        // Set right class to right player
        for (let i = 0; i < playersState.length; i++) {
          const { id, state } = playersState[i];
          const domPlayer = this.elem.querySelector(`.score-screen__player--${id}`);
          domPlayer.classList.add(state);
        }
      }
    } else {
      this.dom.players[0].classList.add('win');
    }
  }

  hide() {
    this.elem.classList.add('is-hidden');
    setTimeout(() => {
      this.state = 'hidden';
    }, 1000); // temporary prevent bug, game.gameover() is called twice after countdown is === 0
  }

  updateScore(id, score, toy) {
    // update score
    const domScore = this.elem.querySelector(`.score-screen__player--${id} [data-score-screen-score]`);
    domScore.innerHTML = score;

    // add toy image
    const domToys = this.elem.querySelector(`.score-screen__player--${id} [data-score-screen-toys]`);
    const domToy = document.createElement('div');
    domToy.classList.add('score-screen__toy');
    const img = document.createElement('img');
    img.classList.add('score-screen__toy-img');
    img.classList.add(`score-screen__toy-img--${toy}`);
    img.src = `img/toys/${toy}/full.svg`;
    domToy.appendChild(img);
    domToys.appendChild(domToy);

    if (domToy.offsetWidth * score > domToys.offsetWidth && !domToys.classList.contains('left-aligned')) {
      domToys.classList.add('left-aligned');
    }
  }

  updateCharacters(playersState) {
    for (let i = 0; i < playersState.length; i++) {
      const { id, state } = playersState[i];
      const domCharacter = this.elem.querySelector(`.score-screen__player--${id} [data-score-screen-character]`);
      domCharacter.src = `img/players/${id}/${state}.svg`;
    }
  }

  onSkipControlsClick(e) {
    window.santaApp.fire('sound-trigger', 'generic_button_click');
    this.game.goToNextLevel();

    e.currentTarget.blur();
  }

  onSkipControlsOver(element) {
    window.santaApp.fire('sound-trigger', 'generic_button_over');
  }

  reset(id, score) {
    const domPlayer = this.elem.querySelector(`.score-screen__player--${id}`);
    domPlayer.classList.remove('win');
    domPlayer.classList.remove('lose');

    const domScore = this.elem.querySelector(`.score-screen__player--${id} [data-score-screen-score]`);
    domScore.innerHTML = score;

    // add toy image
    const domToys = this.elem.querySelector(`.score-screen__player--${id} [data-score-screen-toys]`);
    domToys.innerHTML = '';

    this.elem.classList.remove('game-end');
    this.elem.classList.remove('tie');
  }
}


app.ScoreScreen = new ScoreScreen();