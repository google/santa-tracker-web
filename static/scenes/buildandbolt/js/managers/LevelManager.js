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

goog.provide('app.LevelManager');

goog.require('Constants');
goog.require('Levels');

goog.require('app.shared.LevelUp');

// singleton to manage the levels
class LevelManager {
  init(_, bgElem, numberElem) {
    this.levelUp = new LevelUp(_, bgElem, numberElem);
    this.current = 0; // current level
  }

  transition(transitionInEnd, transitionOutEnd) {
    // startLevel is called after end of levelup transition OUT
    this.levelUp.show(this.current + 1, transitionOutEnd);

    // end of levelup transition IN
    setTimeout(() => {
      transitionInEnd();
    }, Constants.LEVEL_TRANSITION_TIMING);
  }

  goToNextLevel(updateLevel, startCountdown) {
    this.current++;
    this.transition(updateLevel, startCountdown);
  }

  reset(updateLevel, startCountdown) {
    this.current = 0;
    this.transition(updateLevel, startCountdown);
  }

  updateLevel() {
    this.toyType = Levels[this.current].toyType;
    this.toysCapacity = Levels[this.current].toysCapacity;
  }
}

app.LevelManager = new LevelManager();
