/*
 * Copyright 2016 Google Inc. All rights reserved.
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

goog.provide('app.Board');

goog.require('app.Constants');

const TABINDEX_BASE = 10000;

/**
 * Board for a gem matcher game.
 */
app.Board = class Board {

  constructor(elem) {
    this.elem_ = elem;
    this.dim_ = 0;
    this.board_ = [];
    this.cellToPos_ = new Map();

    this.size = 6;  // set default size

    /** @type {function(number, number, number, number)} */
    this.ongesture = function(x, y, ox, oy) {};

    this.elem_.addEventListener('keydown', ev => {
      let x = 0;
      let y = 0;

      switch (ev.keyCode) {
      case 37:
        x = -1;
        break;
      case 38:
        y = -1;
        break;
      case 39:
        x = +1;
        break;
      case 40:
        y = +1;
        break;
      default:
        return;  // unhandled key
      }

      const prev = this.cellToPos_.get(ev.target);
      if (!prev) {
        return;  // for some reason, we can't find the cell
      }

      this.ongesture(prev.x, prev.y, prev.x + x, prev.y + y);
    });
  }

  /**
   * Sets the size of the board. Used for width and height. Clears the board.
   *
   * @param {number} dim
   */
  set size(dim) {
    this.dim_ = dim;
    this.elem_.style.width = `${dim * app.Constants.CELL_SIZE}px`;
    this.elem_.style.height = `${dim * app.Constants.CELL_SIZE}px`;

    this.board_ = new Array(dim * dim);
    this.cellToPos_.clear();
  }

  /**
   * @return {number} the dimension of the board
   */
  get size() {
    return this.dim_;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @return {*}
   */
  get_(x, y) {
    if (x < 0 || x >= this.dim_ || y < 0 || y >= this.dim_) {
      return undefined;
    }
    return this.board_[y * this.dim_ + x];
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {*} value
   * @return {*}
   */
  set_(x, y, value) {
    if (x < 0 || x >= this.dim_ || y < 0 || y >= this.dim_) {
      return null;
    }
    const idx = y * this.dim_ + x;
    const prev = this.board_[idx];
    this.board_[idx] = value;
    return prev;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} ox
   * @param {number} oy
   */
  swap(x, y, ox, oy) {
    const first = this.get_(x, y);
    const second = this.get_(ox, oy);

    if (first === undefined || second === undefined) {
      return;  // the cells are out of bounds, ignore
    }

    this.set_(x, y, second);
    this.set_(ox, oy, first);

    if (first) {
      this.placeCell_(ox, oy, first.cell);
    }
    if (second) {
      this.placeCell_(x, y, second.cell);
    }
  }

  /**
   * @param {number} x
   * @param {string} mode
   * @param {string=} opt_color
   * @return {number}
   */
  drop(x, mode, opt_color) {
    if (x < 0 || x >= this.dim_) {
      throw new TypeError(`can\'t drop outside dim: ${x} vs ${this.dim_}`);
    }

    let y;
    for (y = 0; y < this.dim_; ++y) {
      if (!this.get_(x, y)) { break; }
    }
    if (y == this.dim_) {
      return -1;  // can't find space
    }

    const cell = this.placeCell_(x, -this.dim_ + y);  // place above board

    const present = document.createElement('div');
    present.className = 'present';
    present.style.color = opt_color || '';
    cell.appendChild(present);

    this.set_(x, y, {mode, cell, color: opt_color || ''});
    window.requestAnimationFrame(() => {
      // double-rAF: the first one ensures the first placement, second animates.
      window.requestAnimationFrame(() => {
        this.placeCell_(x, y, cell);
      });
    });

    return y;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {!Element=} opt_prev
   */
  placeCell_(x, y, opt_prev) {
    const cell = opt_prev || document.createElement('div');
    cell.className = 'cell';
    cell.tabIndex = 0;

    if (cell.parentNode != this.elem_) {
      this.elem_.appendChild(cell);
    }

    cell.tabIndex = TABINDEX_BASE + (y * this.dim_) + x;
    cell.style.transform =
        `translate(${x * app.Constants.CELL_SIZE}px, ${y * app.Constants.CELL_SIZE}px)`;

    this.cellToPos_.set(cell, {x, y});

    return cell;
  }

  /**
   * @return {number} the number of cells matched and removed
   */
  doMatch() {
    // find matches
    let found = [];

    for (let x = 0; x < this.dim_; ++x) {
      for (let y = 0; y < this.dim_; ++y) {
        const at = this.get_(x, y);
        if (!at) {
          continue;
        }

        [{x: 1, y: 0}, {x: 0, y: 1}].forEach(delta => {
          const run = [];
          let ox = x, oy = y;

          for (;;) {
            const cand = this.get_(ox, oy);
            if (!cand || cand.color != at.color) { break; }
            run.push({x: ox, y: oy});
            ox += delta.x;
            oy += delta.y;
          }
          if (run.length >= 3) {
            // TODO(samthor): For e.g., [12345], this generates values for [12345], [2345], [345]
            // TODO(samthor): something explosive if the run is >4, >5 etc
            found = found.concat(run);
          }
        });
      }
    }

    const cleanup = [];
    found.forEach(pos => {
      const o = this.get_(pos.x, pos.y);
      if (!o) { return; }  // found contains lots of dups

      if (document.activeElement == o.cell) {
      // TODO(samthor): If the removed cell had focus, then focus on the new cell behind it.
      }
      o.cell.blur();

      o.cell.classList.add('fadeout');
      cleanup.push(o.cell);
      this.set_(pos.x, pos.y, null);
      this.cellToPos_.delete(o.cell);
    });

    // TODO(samthor): This is a bit ugly, but remove the cells when their animation is done.
    window.setTimeout(() => {
      cleanup.forEach(el => el.remove());
    }, 1000);

    return cleanup.length;  // this many cells removed
  }

  /**
   */
  doFall() {
    // fall all cells
    for (let x = 0; x < this.dim_; ++x) {
      const col = [];

      for (let y = 0; y < this.dim_; ++y) {
        const prev = this.get_(x, y);
        prev && col.push(prev);
      }
      while (col.length < this.dim_) {
        col.unshift(null);
      }

      col.forEach((data, y) => {
        if (data) {
          this.set_(x, y, data);
          this.placeCell_(x, y, data.cell);
        } else {
          this.set_(x, y, null);
        }
      });
    }
  }

}
