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

import '../../src/magic.js';
import api from '../../src/scene/api.js';
import { prepareAnimation } from '../../src/deps/lottie.js';
import { _msg } from '../../src/magic.js';
import Game from './:closure.js';

api.preload.images(
  'img/player-selection-one.svg',
  'img/player-selection-two.svg',
  'img/world-edges-bottom.svg',
  'img/world-edges-top.svg',
  'img/fences/fence_front_left.svg',
  'img/fences/fence_front_middle.svg',
  'img/fences/fence_front_right.svg',
  'img/fences/fence_side_bottom.svg',
  'img/fences/fence_side_roundtop.svg',
  'img/floor/floor_tile.svg',
  'img/ice/shine.svg',
  'img/instructions/hand_instruction.svg',
  'img/instructions/player01_elf.svg',
  'img/instructions/player01_keyboard.svg',
  'img/instructions/player02_elf.svg',
  'img/instructions/player02_keyboard.svg',
  'img/instructions/single_hand_instruction.svg',
  'img/penguin/penguin.svg',
  'img/pit/pit_bottom_left.svg',
  'img/pit/pit_bottom_middle.svg',
  'img/pit/pit_bottom_right.svg',
  'img/pit/pit_middle_left.svg',
  'img/pit/pit_middle_middle.svg',
  'img/pit/pit_middle_right.svg',
  'img/pit/pit_middle1_left.svg',
  'img/pit/pit_middle1_right.svg',
  'img/pit/pit_top_left.svg',
  'img/pit/pit_top_middle.svg',
  'img/pit/pit_top_right.svg',
  'img/platform/platform_bottom_middle.png',
  'img/platform/platform_bottom_side.png',
  'img/platform/platform_middle_side.png',
  'img/platform/platform_middle.png',
  'img/platform/platform_top_side.png',
  'img/players/a/head.svg',
  'img/players/a/lose.svg',
  'img/players/a/player.svg',
  'img/players/a/spawn.svg',
  'img/players/a/win.svg',
  'img/players/b/head.svg',
  'img/players/b/lose.svg',
  'img/players/b/player.svg',
  'img/players/b/spawn.svg',
  'img/players/b/win.svg',
  'img/present-boxes/boxes/a.svg',
  'img/present-boxes/boxes/b.svg',
  'img/present-boxes/front/1.svg',
  'img/present-boxes/front/2.svg',
  'img/present-boxes/front/3.svg',
  'img/present-boxes/presents/a.svg',
  'img/present-boxes/presents/b.svg',
  'img/present-boxes/side/bottom/1.svg',
  'img/present-boxes/side/bottom/2.svg',
  'img/present-boxes/side/bottom/3.svg',
  'img/present-boxes/side/middle/1.svg',
  'img/present-boxes/side/middle/2.svg',
  'img/tables/table03_side.svg',
  'img/tables/table01_front.svg',
  'img/tables/table01_side.svg',
  'img/tables/table02_front.svg',
  'img/tables/table02_side.svg',
  'img/tables/table03_front.svg',
  'img/tables/toys/front/car/1.svg',
  'img/tables/toys/front/car/2.svg',
  'img/tables/toys/front/robot/1.svg',
  'img/tables/toys/front/robot/2.svg',
  'img/tables/toys/front/robot/3.svg',
  'img/tables/toys/front/rocket/1.svg',
  'img/tables/toys/front/rocket/2.svg',
  'img/tables/toys/front/rocket/3.svg',
  'img/tables/toys/front/rocket/4.svg',
  'img/tables/toys/front/teddy/1.svg',
  'img/tables/toys/front/teddy/2.svg',
  'img/tables/toys/front/teddy/3.svg',
  'img/tables/toys/side/car/1.svg',
  'img/tables/toys/side/car/2.svg',
  'img/tables/toys/side/robot/1.svg',
  'img/tables/toys/side/robot/2.svg',
  'img/tables/toys/side/robot/3.svg',
  'img/tables/toys/side/rocket/1.svg',
  'img/tables/toys/side/rocket/2.svg',
  'img/tables/toys/side/rocket/3.svg',
  'img/tables/toys/side/rocket/4.svg',
  'img/tables/toys/side/teddy/1.svg',
  'img/tables/toys/side/teddy/2.svg',
  'img/tables/toys/side/teddy/3.svg',
  'img/toys/car/1.svg',
  'img/toys/car/2.svg',
  'img/toys/car/full.svg',
  'img/toys/robot/1.svg',
  'img/toys/robot/2.svg',
  'img/toys/robot/3.svg',
  'img/toys/robot/full.svg',
  'img/toys/rocket/1.svg',
  'img/toys/rocket/2.svg',
  'img/toys/rocket/3.svg',
  'img/toys/rocket/4.svg',
  'img/toys/rocket/full.svg',
  'img/toys/teddy/1.svg',
  'img/toys/teddy/2.svg',
  'img/toys/teddy/3.svg',
  'img/toys/teddy/full.svg',
  'img/wall/wall_bottom_middle_1.svg',
  'img/wall/wall_bottom_middle_2.svg',
  'img/wall/wall_bottom_side.svg',
  'img/wall/wall_middle_side.svg',
  'img/wall/wall_middle.svg',
  'img/wall/wall_top_middle.svg',
  'img/wall/wall_top_side.svg',
);

api.preload.sounds('buildandbolt_load_sounds');

// Get translated strings for toy prompts
const msg = {
  'car-multiple': _msg`buildandbolt-build-car-multiple`,
  'car-single': _msg`buildandbolt-build-car-single`,
  'robot-multiple': _msg`buildandbolt-build-robot-multiple`,
  'robot-single': _msg`buildandbolt-build-robot-single`,
  'rocket-multiple': _msg`buildandbolt-build-rocket-multiple`,
  'rocket-single': _msg`buildandbolt-build-rocket-single`,
  'teddy-multiple': _msg`buildandbolt-build-teddybear-multiple`,
  'teddy-single': _msg`buildandbolt-build-teddybear-single`,
};

const game = new Game(document.getElementById('module-buildandbolt'), api, prepareAnimation, msg);

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
  game.showGui();
});

