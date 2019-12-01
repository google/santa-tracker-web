import api from '../../src/scene/api.js'
import Game from './js/snowglobe-game.js'

const game = new Game(document.getElementById('module-snowglobe'))

api.preload.sounds('snowbox_load_sounds')

api.addEventListener('pause', ev => game.pause())
api.addEventListener('resume', ev => game.resume())
api.addEventListener('restart', ev => game.restart())

api.config({
  sound: ['snowbox_music_start']
})

api.ready(async () => {})
