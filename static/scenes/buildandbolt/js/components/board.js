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

goog.provide('app.Board');

goog.require('Constants');

goog.require('app.shared.utils');

class Board {
  constructor() {
    this.height = Constants.GRID_DIMENSIONS.UNIT_SIZE * Constants.GRID_DIMENSIONS.HEIGHT;
    this.width = Constants.GRID_DIMENSIONS.UNIT_SIZE * Constants.GRID_DIMENSIONS.WIDTH;
    this.ratio = Constants.GRID_DIMENSIONS.WIDTH / Constants.GRID_DIMENSIONS.HEIGHT;
    this.paddingTop = app.shared.utils.touchEnabled ? Constants.BOARD_PADDING_TOP_MOBILE : Constants.BOARD_PADDING_TOP;
    this.paddingLeft = Constants.BOARD_PADDING_LEFT_PERCENTAGE;
    this.cells = [...Array(Constants.GRID_DIMENSIONS.WIDTH)].map(
        e => [...Array(Constants.GRID_DIMENSIONS.HEIGHT)].map(
            el => []));
    this.scale = 1;
  }

  init(context) {
    this.context = context;
    this.context.style.height = `${this.height}px`;
    this.context.style.width = `${this.width}px`;

    if (Constants.DEBUG) {
      this.initDebugView();
    }

    this.onResize();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  reset() {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        this.cells[i][j] = [];
      }
    }
  }

  onResize() {
    const maxHeight = window.innerHeight - this.paddingTop * 2;
    const maxWidth = window.innerWidth - window.innerWidth * this.paddingLeft / 100;
    const targetedHeight = Math.min(this.context.offsetHeight * window.innerWidth / this.width, maxHeight);
    const targetedWidth = Math.min(targetedHeight * this.ratio, maxWidth);
    this.scale = targetedWidth / this.context.offsetWidth;

    this.context.style.left = '50%';
    this.context.style.top = '50%';
    if (!app.shared.utils.touchEnabled) {
      this.context.style.transform = `scale(${this.scale.toFixed(2)}) translate(-50%, -50%)`;
    } else {
      this.scale += Constants.ZOOM_TOUCH_DEVICE
      this.context.style.transform = `scale(${this.scale.toFixed(2)}) translate(-50%, -50%) translateY(${this.paddingTop}px)`;
    }
  }

  updateBoardPosition(position) {
    const gridPosX = (position.x - this.context.offsetWidth / 2 / Constants.GRID_DIMENSIONS.UNIT_SIZE);
    const gridPosY = (position.y - this.context.offsetHeight / 2 / Constants.GRID_DIMENSIONS.UNIT_SIZE);

    const offsetX = -gridPosX * Constants.GRID_DIMENSIONS.UNIT_SIZE;
    const offsetY = -gridPosY * Constants.GRID_DIMENSIONS.UNIT_SIZE;

    this.context.style.transform = `scale(${this.scale.toFixed(2)}) translate(-50%, -50%) translateY(${this.paddingTop}px) translate(${offsetX}px, ${offsetY}px)`;
  }

  initDebugView() {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        let debugCell = document.createElement('div');
        debugCell.setAttribute('class', 'debug-cell');
        debugCell.style.transform = `translate(${i * Constants.GRID_DIMENSIONS.UNIT_SIZE}px, ${j * Constants.GRID_DIMENSIONS.UNIT_SIZE}px)`;
        this.context.append(debugCell);
      }
    }
  }

  updateDebugCell(x, y) {
    if (!Constants.DEBUG) {
      return
    }

    const index = x * Constants.GRID_DIMENSIONS.HEIGHT + y;
    const debugCell = this.context.getElementsByClassName('debug-cell')[index];
    let names = '';
    for (const entity of this.cells[x][y]) {
      names += ' ' + entity.elem.classList;
    }
    debugCell.textContent = names;
  }

  updateEntityPosition(entity, oldX, oldY, newX, newY, width = 1, height = 1) {
    if (Math.round(oldX) != Math.round(newX) ||
        Math.round(oldY) != Math.round(newY)) {
      this.removeEntityFromBoard(entity, oldX, oldY, width, height);
      this.addEntityToBoard(entity, newX, newY, width, height);
    }
  }

  addEntityToBoard(entity, x, y, width = 1, height = 1) {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    for (let i = roundedX; i < roundedX + width; i++) {
      for (let j = roundedY; j < roundedY + height; j++) {
        this.cells[i][j].push(entity);
        this.updateDebugCell(i, j);
      }
    }
  }

  removeEntityFromBoard(entity, x, y, width = 1, height = 1) {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    for (let i = roundedX; i < roundedX + width; i++) {
      for (let j = roundedY; j < roundedY + height; j++) {
        let index = this.cells[i][j].indexOf(entity);
        if (index > -1) {
          this.cells[i][j].splice(index, 1);
          this.updateDebugCell(i, j);
        }
      }
    }
  }

  getSurroundingEntities(player) {
    const { x, y } = player.position;
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);

    const playerCell = this.cells[roundedX][roundedY];

    // surrounding cells
    const surroundingEntities = [];

    for (let i = roundedX - 1; i <= roundedX + 1; i++) {
      for (let j = roundedY - 1; j <= roundedY + 1; j++) {
        // get available cells only
        if (!this.cells[i] || !this.cells[i][j]) {
          continue;
        }

        const cell = this.cells[i][j];
        if (cell === playerCell) {
          // if in same cell as player
          for (let k = 0; k < cell.length; k++) {
            const entity = cell[k];
            // get only entities that trigger an action on the player cell
            if (entity.config.checkCell && entity.id !== player.id) {
              surroundingEntities.push(entity);
            }
          }
        } else {
          // if around player cell
          for (let k = 0; k < cell.length; k++) {
            const entity = cell[k];
            // get only entities that trigger an action around the player cell
            if (entity.config.checkBorder && entity.id !== player.id) {
              surroundingEntities.push(entity);
            }
          }
        }
      }
    }

    return surroundingEntities;
  }
}

app.Board = new Board();