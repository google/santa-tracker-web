// three.js must be imported before Game so window.THREE is defined before
// Game and its deps refer to it in module scope.
import THREE from './three.js';

import api from '../../src/scene/api.js';
import Game from './:closure.js';

// Quick hack: Load sounds from an existing game.
api.preload.sounds('bl_load_sounds');

api.ready(() => initialize());

api.config({
    pause: true,
    orientation: 'landscape',
    sound: ['music_start_scene'],
  });

function initialize() {
  const contentElement = document.querySelector('#content');

  const game = new Game();
  api.addEventListener('pause', (ev) => game.pause());
  api.addEventListener('resume', (ev) => game.resume());
  api.addEventListener('restart', (ev) => game.restart());
  game.start(contentElement);
}
