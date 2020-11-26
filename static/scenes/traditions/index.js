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
import Game from './:closure.js';
import maps from '../../src/deps/maps.js';
import mapstyles from '../../src/deps/mapstyles.json';

api.preload.sounds('traditions_load_sounds');
api.preload.sounds('generic');  // for generic_button_click
api.preload.images(
  'img/pins_small.png',
  'img/pins_small_2x.png',
  'img/pins_large.png',
  'img/pins_large_2x.png',
);

const all = Array.prototype.slice.call(document.getElementById('traditions-all'));
const icons = all.map((div) => `img/country/${div.getAttribute('data-id')}.png`);
api.preload.images(...icons);

const mapsApi = maps();
api.preload.wait(mapsApi);

const gamePromise = mapsApi.then(() => {
  return new Game(document.getElementById('module-traditions'), mapstyles);
});

api.config({
  sound: ['music_start_scene'],
});

api.ready(async () => {
  const game = await gamePromise;

  document.getElementById('button-next').addEventListener('click', () => game.nextCountry());
  document.getElementById('button-prev').addEventListener('click', () => game.prevCountry());
  document.getElementById('button-world').addEventListener('click', () => game.showWorld());

  window.addEventListener('keydown', (ev) => {
    switch (ev.key) {
      case 'Left':
      case 'ArrowLeft':
        game.nextCountry();
        break;

      case 'Right':
      case 'ArrowRight':
        game.prevCountry();
        break;

      case ' ':
        game.showWorld();
        break;

      default:
        return;
    }

    ev.preventDefault();
  });
});
