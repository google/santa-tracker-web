import '../../src/magic.js';
import api from '../../src/scene/api.js';

import {loadAnimation, prepareAnimation} from '../../src/deps/lottie.js';
import Game from './:closure.js';

api.preload.images(
  'img/car-body.svg',
  'img/car-wheel.svg',
  'img/fence.svg',
  'img/tree.svg',
);

api.preload.sounds('village_load_sounds');

const playerSelectionScreen = document.querySelector('[data-player-selection]')
const playerSelectionOptions = document.querySelectorAll('[data-player-option]')
const controlsScreen = document.querySelector('[data-player-controls]')
const controlsButton = document.querySelector('[data-player-controls-skip]')

let playerOption
let animations = {}

const initAnimation = (path, entity, side) => {
  const p = prepareAnimation(path, {
    loop: false,
    autoplay: false,
    rendererSettings: {
      className: `animation animation--${side}`
    },
  }).then((anim) => {
    if (!animations[entity]) {
      animations[entity] = {}
    }

    animations[entity][side] = anim
  });

  api.preload.wait(p);
}

initAnimation('img/players/a/front.json', 'player-a', 'front')
initAnimation('img/players/a/back.json', 'player-a', 'back')
initAnimation('img/players/a/side.json', 'player-a', 'side')
initAnimation('img/players/death-pow.json', 'player-a', 'death')
initAnimation('img/players/b/front.json', 'player-b', 'front')
initAnimation('img/players/b/back.json', 'player-b', 'back')
initAnimation('img/players/b/side.json', 'player-b', 'side')
initAnimation('img/players/death-pow.json', 'player-b', 'death')
initAnimation('img/penguin/front.json', 'penguin', 'front')
initAnimation('img/penguin/back.json', 'penguin', 'back')
initAnimation('img/penguin/side.json', 'penguin', 'side')

playerSelectionOptions.forEach((element) => {
  element.addEventListener('click', (e) => {
    playerSelectionScreen.classList.add('is-hidden')
    controlsScreen.classList.remove('is-hidden')
    playerOption = element.getAttribute('data-player-option')
  })
})

controlsButton.addEventListener('click', (e) => {
  const game = new Game(document.getElementById('module-buildandbolt'), playerOption, animations)
  controlsScreen.classList.add('is-hidden')
})

// Debug mode
// const game = new Game(document.getElementById('module-buildandbolt'), 'single')
// controlsScreen.classList.add('is-hidden')
// playerSelectionScreen.classList.add('is-hidden')
// end debug mode

api.config({
  sound: ['music_start_village', 'village_start'],
});

api.ready(async () => {
  // do nothing
});

