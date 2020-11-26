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

goog.provide('app.Fence');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Entity');
goog.require('app.shared.pools');

app.Fence = class Fence extends app.Entity {
  constructor() {
    super();

    this.lastSoundTime = 0;
  }

  onInit(config) {
    super.onInit({...config, checkCell: true, checkBorder: true});

    const { cells, row, column } = config;
    const cell = cells[row][column];
    const type = this.setType(cells, row, column);

    if (cell.top) {
      this.addChild('top', type.top);
    }

    if (cell.right) {
      this.addChild('right', type.right);
    }

    if (cell.bottom) {
      this.addChild('bottom', type.bottom);
    }

    if (cell.left) {
      this.addChild('left', type.left);
    }
  }

  onDispose() {
    super.onDispose();

    Utils.removeAllChildren(this.elem);
  }

  addChild(side, type = false) {
    const div = document.createElement('div');
    div.classList.add('fence__background');
    div.classList.add(`fence__background--${side}`);
    if (type) {
      div.classList.add(`fence__background--${type}`);
    }
    this.elem.appendChild(div);
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y);
  }

  onContact(player) {
    let actions = [];

    // if player is in the border, he is blocked
    this.blockingPosition = Utils.isInFence(this.config, player.position, player.prevPosition, this.elem);

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [Constants.PLAYER_ACTIONS.BLOCK];
      this.playSound();
    }

    return actions;
  }

  playSound() {
    if (performance.now() - this.lastSoundTime > 700) {
      window.santaApp.fire('sound-trigger', 'buildandbolt_thud');
      this.lastSoundTime = performance.now();
    }
  }

  setType(cells, row, column) {
    const cell = cells[row][column];
    const type = {
      top: false,
      right: false,
      bottom: false,
      left: false,
    };

    // if previous
    // if previous is not top/bottom and this one has top/bottom, make it start
    if (cell.top || cell.bottom) {
      if (column === 0) {
        if (cell.top) {
          type.top = 'start';
        }
        if (cell.bottom) {
          type.bottom = 'start';
        }
      }
      if (cells[row][column - 1]) {
        if (!cells[row][column - 1].top && !cells[row][column - 1].bottom) {
          if (cell.top) {
            type.top = 'start';
          }
          if (cell.bottom) {
            type.bottom = 'start';
          }
        }
      }
      if (cells[row][column + 1]) {
        if (!cells[row][column + 1].top && !cells[row][column + 1].bottom) {
          if (cell.top) {
            type.top = 'end';
          }
          if (cell.bottom) {
            type.bottom = 'end';
          }
        }
      }
      if (column === cells[row].length - 1) {
        if (cell.top) {
          type.top = 'end';
        }
        if (cell.bottom) {
          type.bottom = 'end';
        }
      }
    }

    // check if previous row has a left/right border or no
    if (cell.left || cell.right) {
      // if previous row
      if (cells[row - 1]) {
        if (cell.left && !cell.top && cells[row - 1][column] && !cells[row - 1][column].left && !cells[row - 1][column].bottom) {
          type.left = 'end-side';
        }

        if (cell.right && !cell.top && cells[row - 1][column] && !cells[row - 1][column].right && !cells[row - 1][column].bottom) {
          type.right = 'end-side';
        }
      }
    }

    return type;
  }
}

app.Fence.targetHolderId = 'fences';
app.Fence.elemClass = 'fence';

app.shared.pools.mixin(app.Fence);
