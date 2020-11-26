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

goog.provide('app.Gui');

goog.require('app.shared.utils');
goog.require('Constants');

app.Gui = class Gui {
  constructor(game) {
    this.game = game;
    this.guiElem = this.game.context.querySelector('[data-gui]');
    this.playerSelectionScreen = this.game.context.querySelector('[data-player-selection]');
    this.playerSelectionOptions = this.game.context.querySelectorAll('[data-player-option]');
    this.controlsScreen = this.game.context.querySelector('[data-player-controls]');
    this.controlsButton = this.game.context.querySelector('[data-player-controls-skip]');

    if (app.shared.utils.touchEnabled) {
      this.playerOption = Constants.PLAYER_OPTIONS.SINGLE;
      this.startGame();
      return;
    }

    this.playerSelectionScreen.classList.remove('is-hidden');
    this.playerSelectionOptions.forEach((element) => {
        element.addEventListener('click',
            this.onPlayerOptionClick.bind(this, element));

        element.addEventListener('mouseenter', this.onPlayerOptionOver.bind(this, element));
    });


    this.controlsButton.addEventListener('click',
        this.onSkipControlsClick.bind(this));
    this.controlsButton.addEventListener('mouseenter',
        this.onSkipControlsOver.bind(this));

    // Debug mode
    // this.onPlayerOptionClick(this.playerSelectionOptions[1])
    // this.onSkipControlsClick()
    // end debug mode
  }

  onPlayerOptionClick(element) {
    this.playerSelectionScreen.classList.add('is-hidden');
    this.playerOption = element.getAttribute('data-player-option');
    this.controlsScreen.classList.remove('is-hidden');
    this.controlsScreen.setAttribute('data-player-controls', this.playerOption);
    window.santaApp.fire('sound-trigger', 'generic_button_click');
  }

  onPlayerOptionOver(element) {
    window.santaApp.fire('sound-trigger', 'generic_button_over');
  }

  onSkipControlsClick(e) {
    this.startGame();
    window.santaApp.fire('sound-trigger', 'generic_button_click');

    e.currentTarget.blur();
  }

  onSkipControlsOver(element) {
    window.santaApp.fire('sound-trigger', 'generic_button_over');
  }

  startGame() {
    this.game.init(this.playerOption);
  }
}