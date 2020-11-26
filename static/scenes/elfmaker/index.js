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
import './elements/maker-chooser.js';
import './elements/maker-control.js';
import './elements/maker-elf.js';
import './elements/maker-photo.js';
import '../../src/elements/santa-button.js';
import * as defs from './defs.js';

api.preload.sounds('elfmaker_load_sounds', 40);

api.preload.images(
  'img/backgrounds/air.png',
  'img/backgrounds/airport.png',
  'img/backgrounds/beach.png',
  'img/backgrounds/dock.png',
  'img/backgrounds/gingerbread.png',
  'img/backgrounds/iceberg.png',
  'img/backgrounds/livingroom.png',
  'img/backgrounds/night.png',
  'img/backgrounds/snow.png',
  'img/backgrounds/underwater.png',
  'img/btn_accessories.svg',
  'img/btn_body.svg',
  'img/btn_suit.svg',
  'img/btn_ears.svg',
  'img/btn_glasses.svg',
  'img/btn_hair.svg',
  'img/btn_hats.svg',
  'img/btn_left.svg',
  'img/btn_redo.svg',
  'img/btn_right.svg',
  'img/btn_share.svg',
  'img/btn_backgrounds.svg',
  'img/tray_lg.svg',
  'img/tray_ornament_lg.svg',
);

const control = document.getElementById('control');
control.addEventListener('change', (ev) => {
  api.data({elf: control.serializeState()});

  elf.categoryChoice = control.categoryChoice;
  elf.svgStyle = control.svgStyle;

  const backgrounds = defs.categories['backgrounds'];
  const bgUrl = backgrounds[control.categoryChoice['backgrounds']];
  main.style.backgroundImage = `url(${bgUrl})`;
});

share.addEventListener('click', (ev) => {
  // if there's a selfie image hovering, share that instead (which should always be true in embed)
  const recentImage = photo.recentImage;
  (recentImage || elf.draw()).then((result) => {
    api.gameover({share: true, image: result});
  });
  window.santaApp.fire('sound-trigger', 'generic_button_click');
});

random.addEventListener('click', (ev) => {
  window.santaApp.fire('sound-trigger', 'elfmaker_switch_item');
  control.chooseRandom();
  window.ga('send', 'event', 'game', 'random', 'elfmaker');
});

downloadButton.addEventListener('click', (ev) => {
  download.click();
});

camera.addEventListener('click', (ev) => {
  const image = elf.draw();
  photo.capture(image);
  image.then((src) => {
    download.setAttribute('href', src);
    downloadButton.disabled = false;
  });
  window.ga('send', 'event', 'game', 'photo', 'elfmaker');
});

photo.addEventListener('hide', (ev) => {
  download.removeAttribute('href');
  downloadButton.disabled = true;
});

download.addEventListener('click', (ev) => {
  window.ga('send', 'event', 'game', 'download', 'elfmaker');
  window.setTimeout(() => {
    // dismiss clears href, so delay it
    photo.dismiss();
  }, 0);
});


const defaultStep = {className: '', left: {target: 140, range: 5, rate: 1.25}, right: {target: 140, range: 5, rate: 1.5}};
const moves = {
  'leftWave': [
    {duration: Math.PI, left: {target: 60, range: 20, rate: 4}},
  ],
  'leftWaveHigh': [
    {duration: Math.PI, left: {target: 30, range: 2, rate: 10}},
  ],
  'rightWave': [
    {duration: Math.PI, right: {target: 60, range: 20, rate: 4}},
  ],
  'rightWaveHigh': [
    {duration: Math.PI, right: {target: 30, range: 2, rate: 10}},
  ],
  'dance': [
    {duration: 0.8, left: 30, right: 140},
    {duration: 0.8, left: 140, right: 30},
    {duration: 0.8, left: 80, right: 180},
    {duration: 0.8, left: 180, right: 80},
    {duration: 0.8, left: 40, right: 40},
  ],
  'dance2': [
    {duration: 1.5, left: {target: 70, rate: 6}, right: {target: 100, rate: 6}},
    {duration: 1.5, left: {target: 100, rate: 6}, right: {target: 70, rate: 6}},
  ],
  'floss': [
    {duration: 1.5, left: {target: 180, rate: 6}, right: {target: 100, rate: 6}},
    {duration: 1.5, left: {target: 100, rate: 6}, right: {target: 180, rate: 6}},
    {duration: 1.5, left: {target: 180, rate: 6}, right: {target: 100, rate: 6}},
    {duration: 1.5, left: {target: 100, rate: 6}, right: {target: 180, rate: 6}},
  ],
  'stretch': [
    {duration: 2.2, left: 90, right: 90},
    {duration: 0.5, left: 70, right: 70},
  ],
};

const applyStep = (step) => {
  step.left && elf.targetArm(false, step.left);
  step.right && elf.targetArm(true, step.right);
  if ('className' in step) {
    elf.elfClass = step.className;
  }
};

let activeMove = null;
let moveTask = Promise.resolve();
const applyMove = (name) => {
  const localMoveTask = moveTask.then(async () => {
    activeMove = name;
    const steps = moves[name] || [];
    for (let i = 0; i < steps.length; ++i) {
      const step = steps[i];
      applyStep(step);

      if (step.duration) {
        // TODO: could clear early if we change somehow
        await new Promise((r) => window.setTimeout(r, step.duration * 1000));
      }
      if (moveTask !== localMoveTask) {
        // we've been superceded
        return false;
      }
    }

    // nothing after us, reapply default
    if (localMoveTask === moveTask) {
      applyStep(defaultStep);
      activeMove = null;
    }
  });
  moveTask = localMoveTask;
  return localMoveTask;
};

api.config({
  orientation: 'portrait',
});

api.ready(async (data) => {
  applyStep(defaultStep);

  let timeout;

  const applyRandomMove = (choice=undefined) => {
    window.clearTimeout(timeout);

    if (!activeMove) {
      if (choice === undefined) {
        const choices = Object.keys(moves);
        choice = choices[~~(Math.random() * choices.length)];
      }
      applyMove(choice);
    }

    timeout = window.setTimeout(applyRandomMove, (10 + 10 * Math.random()) * 1000);
  };
  applyRandomMove((Math.random() < 0.5 ? 'left' : 'right') + 'Wave');  // kicks off random timer
  elf.addEventListener('click', (ev) => {
    window.ga('send', 'event', 'game', 'poke', 'elfmaker');
    applyRandomMove();
  });

  control.deserializeState(data && data.elf);
  window.santaApp.fire('sound-ambient', 'music_start_scene');
});