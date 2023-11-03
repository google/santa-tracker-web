import api from '../../src/scene/api.js';
import { Game } from './js/game.js';

api.ready(() => initialize());

function initialize() {
  const contentElement = document.querySelector('#content');

  const game = new Game();
  game.start(contentElement);
}
