import '../../src/magic.js';
import api from '../../src/scene/api.js';
import { prepareAnimation } from '../../src/deps/lottie.js';
import Game from './:closure.js';

// TODO: list out all images
// api.preload.images(
//   'img/car-body.svg',
//   'img/car-wheel.svg',
//   'img/fence.svg',
//   'img/tree.svg',
// );

api.preload.sounds('buildandbolt_load_sounds');

const game = new Game(document.getElementById('module-buildandbolt'), api, prepareAnimation)

api.addEventListener('pause', (ev) => game.pause());
api.addEventListener('resume', (ev) => game.resume());
api.addEventListener('restart', (ev) => game.restart());

api.config({
  pause: true,
  orientation: 'landscape',
  sound: ['buildandbolt_tutorial_start'],
});

api.ready(async () => {
  // begin game
  game.showGui()
});

