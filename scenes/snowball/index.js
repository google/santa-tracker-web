import './js/snowball-game.js';
import {SceneApi} from '../../src/app/scene-api.js';

const sceneApi = new SceneApi('snowball');
sceneApi.installV1Handlers();
sceneApi.loadStarted();

// TODO: preload

// sceneApi.preloadSounds('snowball_load_sounds');
// sceneApi.preloadImages([
//   'img/sleigh.png',
//   'img/item-frame.png',
//   'img/parachute.png',
//   'img/powerup-1.png',
//   'img/snowball.png',
//   'img/tiles.png',
// ]);
// sceneApi.preloadPaths([
//   'models/elf-animated.bin',
//   'models/elf-animated.gltf',
//   'models/elf-tidy.png',
//   'models/elf.bin',
//   'models/elf.gltf',
//   'models/elf.png',
// ]);

sceneApi.loadCompleted();


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

jumpBtn.addEventListener('click', (ev) => {
  jumpBtn.hidden = true;
  document.body.classList.add('intro');

  // this.$.tutorial.show = false;  // only show before game starts

  awaitAnimation(dropCloud).then(() => startGame());
});

// TODO(cdata): Wire this up to an API event.
function startGame() {
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

// TODO(cdata): Wire this up to an API event.
function onShow() {
  if (splash.parentNode === null) {
    jumpBtn.hidden = false;
    document.body.appendChild(splash);
  }
}

// TODO(cdata): Wire this up to an API event.
function onHide() {
  if (game !== null) {
    game.teardown();
    document.body.removeChild(game);
    game = null;
  }
}