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


import api from '../../src/scene/api.js';
import '../../src/elements/santa-weather.js';
import './js/snowball-game.js';

api.preload.sounds('snowball_load_sounds');
api.preload.images(
  'img/sleigh.png',
  'img/item-frame.png',
  'img/parachute.png',
  'img/powerup-1.png',
  'img/snowball.png',
  'img/tiles.png',
  'models/elf-tidy.png',
  'models/elf.png',
);
// api.preload.paths(
//   'models/elf-animated.bin',
//   'models/elf-animated.gltf',
//   'models/elf.bin',
//   'models/elf.gltf',
// );


const awaitAnimation = (element) => new Promise((resolve) => {
  const cleanup = (event) => {
    element.removeEventListener('animationend', cleanup);
    resolve();
  };
  element.addEventListener('animationend', cleanup);
});

const jumpBtn = document.getElementById('jumpBtn');
const splash = document.getElementById('splash');
let game = null;

api.ready(async () => {
  jumpBtn.addEventListener('click', (ev) => {
    jumpBtn.hidden = true;
    document.body.classList.add('intro');
    api.play('generic_button_click');

    // this.$.tutorial.show = false;  // only show before game starts

    awaitAnimation(dropCloud).then(() => startGame());
  });
});

api.addEventListener('restart', (ev) => {
  startGame();
});

// TODO(cdata): Wire this up to an API event.
function startGame() {
  api.play('music_start_ingame');

  if (game !== null) {
    game.teardown();
    document.body.removeChild(game);
  }

  document.body.classList.remove('intro');
  game = document.createElement('snowball-game');

  document.body.insertBefore(game, document.body.firstElementChild);

  game.assetBaseUrl = '';

  window.requestAnimationFrame(() => {
    game.start('local');

    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        if (splash.parentNode !== null) {
          document.body.removeChild(splash);
        }
      });
    }, 1000);
  });
}
