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

const playerSelectionScreen = document.querySelector('[data-player-selection]')
const playerSelectionOptions = document.querySelectorAll('[data-player-option]')
const controlsScreen = document.querySelector('[data-player-controls]')
const controlsButton = document.querySelector('[data-player-controls-skip]')

let playerOption

playerSelectionOptions.forEach((element) => {
  element.addEventListener('click', (e) => {
    playerSelectionScreen.classList.add('is-hidden')
    controlsScreen.classList.remove('is-hidden')
    playerOption = element.getAttribute('data-player-option')
  })
})

controlsButton.addEventListener('click', (e) => {
  const game = new Game(document.getElementById('module-buildandbolt'), playerOption)
  controlsScreen.classList.add('is-hidden')
})

// Debug mode
const game = new Game(document.getElementById('module-buildandbolt'), 'single')
controlsScreen.classList.add('is-hidden')
playerSelectionScreen.classList.add('is-hidden')
// end debug mode

api.config({
  sound: ['music_start_village', 'village_start'],
});

api.ready(async () => {
  // do nothing
});

