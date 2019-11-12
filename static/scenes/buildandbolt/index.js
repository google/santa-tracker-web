import '../../src/magic.js';
import api from '../../src/scene/api.js';

import Game from './:closure.js';

api.preload.images(
  'img/car-body.svg',
  'img/car-wheel.svg',
  'img/fence.svg',
  'img/player-a.svg',
  'img/player-b.svg',
  'img/table-1.svg',
  'img/table-2.svg',
  'img/table-3.svg',
  'img/tree.svg',
);

api.preload.sounds('village_load_sounds');

const game = new Game(document.getElementById('module-buildandbolt'));

api.config({
  sound: ['music_start_village', 'village_start'],
});

api.ready(async () => {
  // do nothing
});

