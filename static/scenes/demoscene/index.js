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

import '../../src/polyfill/css.js';
import api from '../../src/scene/api.js';
import '../../src/elements/santa-weather.js';
import '../../src/elements/santa-card.js';
import '../../src/elements/santa-tutorial.js';
import '../../src/elements/santa-image-mask.js';
import './elements/easteregg-balloon.js';
import './elements/easteregg-reindeer.js';
import './elements/easteregg-snowmobile.js';
import './elements/easteregg-tictactoe.js';
import '../../src/magic.js';
import {rectify} from '../../src/scene/route.js';


// const tutorial = document.querySelector('santa-tutorial');
// tutorial.queue('elfski.mp4', 'matching.svg', 'codeboogie.gif');


const offset = {x: 0, y: 0};
let previousPointer = null;

const container = document.getElementById('village-container');
const scroll = document.getElementById('village-scroll');

function updateOffset(delta) {
  const scrollSize = scroll.getBoundingClientRect();
  const containerSize = container.getBoundingClientRect();

  if (delta) {
    const factor = 2.2;
    offset.x += delta.x / factor;
    offset.y += delta.y / factor;
  }

  const allowed = {
    x: (scrollSize.width - containerSize.width) >> 1,
    y: (scrollSize.height - containerSize.height) >> 1,
  };
  if (Math.abs(offset.x) > allowed.x) {
    offset.x = Math.sign(offset.x) * allowed.x;
  }
  if (Math.abs(offset.y) > allowed.y) {
    offset.y = Math.sign(offset.y) * allowed.y;
  }

  scroll.style.transform = `translate(-50%, -50%) translate(${~~offset.x}px, ${~~offset.y}px)`;
}

function resetPointer() {
  previousPointer = null;
}

scroll.addEventListener('pointermove', (ev) => {
  if (ev.buttons !== 1) {
    return;
  }

  const heldPointer = previousPointer;
  previousPointer = {x: ev.screenX, y: ev.screenY};

  if (heldPointer) {
    const delta = {x: ev.screenX - heldPointer.x, y: ev.screenY - heldPointer.y};
    updateOffset(delta);
  }
});
['pointerup', 'pointerout', 'pointerleave'].forEach((eventName) => {
  scroll.addEventListener(eventName, resetPointer);
});

window.addEventListener('resize', (ev) => updateOffset());

api.preload.images(
  'img/mountain.svg',
  'img/road.svg',
  'img/ground.svg',
  'img/easteregg-tree.svg',
);

api.preload.sounds('village_load_sounds');

api.config({
  scroll: true,
  sound: ['music_start_village', 'village_start'],
});

rectify(document.querySelector('.quilt'));

api.ready(async () => {
  // do nothing now?
});

