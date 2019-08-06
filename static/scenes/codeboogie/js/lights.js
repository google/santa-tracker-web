/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

goog.provide('app.Lights');

const numberOfTiles = 9;
const numberOfLights = 4;

app.Lights = class {
  constructor(el) {
    this.ceilingActive = false;
    this.floorActive = false;

    this.whiteBeams = goog.array.toArray(
      el.querySelectorAll('.ceilingLight__beam--white'));
    this.redBeams = goog.array.toArray(
      el.querySelectorAll('.ceilingLight__beam--red'));
    this.greenBeams = goog.array.toArray(
      el.querySelectorAll('.ceilingLight__beam--green'));

    this.tiles = [];

    let tileEl = el.querySelector('.scene__tiles');

    for (let i = 0; i < numberOfTiles; i++) {
      let light = document.createElement('div');
      light.classList.add('scene__light');
      light.style.backgroundImage =
          `url(img/lights/disco_${i + 1}.svg)`;
      light.style.opacity = 0;
      tileEl.appendChild(light);
      this.tiles.push(light);
    }
  }

  setLevel(level) {
    this.ceilingActive = level.ceilingLights;
    this.floorActive = level.floorLights;
  }

  onBeat(beat, bpm, isPlaying) {
    if (this.floorActive) {
      this.shuffle_(this.tiles);

      this.tiles.forEach((light, index) => {
        light.style.opacity = index < numberOfLights ? 1 : 0;
      });
    }

    if (this.ceilingActive) {
      this.whiteBeams.forEach(beam => {
        beam.style.opacity = !isPlaying ? 1 : 0;
      });

      let lightOrder = [
        this.redBeams[0],
        this.greenBeams[1],
        this.greenBeams[0],
        this.redBeams[1]
      ];

      lightOrder.forEach((beam, index) => {
        beam.style.opacity = isPlaying && beat % 4 === index ? 1 : 0;
      });
    }
  }

  shuffle_(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
};
