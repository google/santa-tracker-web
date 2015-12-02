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

goog.provide('app.MoveTiles');

goog.require('app.Step');

const tilewidth = 124;
const maxTiles = 4;

app.MoveTiles = class {
  constructor(el) {
    this.el = el;
    this.fadeTiles = true;
  }

  setLevel(level) {
    this.fadeTiles = level.fadeTiles;
    this.setLength(level.steps.length)
  }

  setLength(length) {
    let tiles = Math.min(length, maxTiles);

    this.el.style.width = `${tiles * tilewidth / 10}em`;
    this.el.style.left = `calc(50% + ${tiles / 2 * tilewidth / 10}em)`
  }

  add(move) {
    let tile = document.createElement('div');
    tile.classList.add('scene__moves-move', 'fade-in', `move__${move}`);

    this.el.appendChild(tile);

    let moveTiles = Array.from(this.el.querySelectorAll('.scene__moves-move'));
    let numTiles = moveTiles.length;

    goog.style.setStyle(this.el, {
      transform: `translate3d(-${(numTiles * tilewidth) / 10}em, 0, 0)`,
      transitionDuration: numTiles === 1 ? '0s' : ''
    });

    if (numTiles > maxTiles) {
      moveTiles.slice(0, numTiles - maxTiles).forEach(tile => {
        tile.classList.add('fade-out');
      });
    }
  }

  reset() {
    this._removeTiles();
  }

  clear() {
    if (this.fadeTiles) {
      this._removeTiles();
    };
  }

  _removeTiles() {
    let moveTiles = Array.from(this.el.querySelectorAll('.scene__moves-move'));
    moveTiles.forEach(tile => {
      tile.classList.add('fade-out');
    });

    setTimeout(() => {
      while (this.el.hasChildNodes()) {
        this.el.removeChild(this.el.lastChild);
      }
    }, 200);
  }
}
