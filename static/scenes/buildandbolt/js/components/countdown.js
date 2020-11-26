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

goog.provide('app.Countdown');

goog.require('Constants');

goog.require('app.Walkthrough');

class Countdown {
  init(game, elem) {
    this.elem = elem;
    this.game = game;

    this.dom = {
      numbers: this.elem.querySelectorAll('[data-countdown-numbers]'),
      go: this.elem.querySelector('[data-countdown-go]')
    }
  }

  start() {
    const second = 1000;
    // animate
    for (let i = 0; i < this.dom.numbers.length; i++) {
      const start = i * second;
      setTimeout(() => {
        this.dom.numbers[i].classList.add('animate');
        window.santaApp.fire('sound-trigger', 'buildandbolt_game_count');
      }, start);

      setTimeout(() => {
        this.dom.numbers[i].classList.remove('animate');
      }, start + second);

      if (i === this.dom.numbers.length - 1) {
        setTimeout(() => {
          this.dom.go.classList.add('animate');
          window.santaApp.fire('sound-trigger', 'buildandbolt_level_end');
          window.santaApp.fire('sound-trigger', 'buildandbolt_game_count_go');
        }, start + second + 200);

        setTimeout(() => {
          this.dom.go.classList.remove('animate');
          // resume game
          this.game.canResume = true;
          this.game.resume();
          this.game.startMusic();
          // hide walkthrough
          app.Walkthrough.hide();
        }, start + second + 1500);
      }
    }
  }
}

app.Countdown = new Countdown();
