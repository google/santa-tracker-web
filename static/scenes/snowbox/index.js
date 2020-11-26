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
