  import api from '../../src/scene/api.js';
  import Game from './:closure.js';
  
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
