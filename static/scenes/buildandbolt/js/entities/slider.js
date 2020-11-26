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

goog.provide('app.Slider');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Board');
goog.require('app.Entity');

app.Slider = class Slider extends app.Entity {
  onInit(config) {
    this.config = { ...config, checkCell: true };
    this.elem.classList.remove('hidden');

    this.position = {
      x: this.config.startPos.x,
      y: this.config.startPos.y,
    };

    this.endPos = {
      x: this.config.isVertical ? this.config.startPos.x : this.config.startPos.x + this.config.movementLength,
      y: this.config.isVertical ? this.config.startPos.y + this.config.movementLength : this.config.startPos.y
    };

    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`;
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`;

    this.reversing = false;

    app.Board.addEntityToBoard(this, this.position.x, this.position.y, this.config.width, this.config.height);
  }

  onFrame() {
    this.prevPosition = Object.assign({}, this.position);

    this.flipped = false;
    if (!this.reversing) {
      if (this.config.isVertical) {
        this.position.y = this.position.y + this.config.stepSize;
        if (this.position.y >= this.endPos.y) {
          this.reversing = true;
          this.position.y = this.endPos.y;
          this.flipped = true;
        }
      } else {
        this.position.x = this.position.x + this.config.stepSize;
        if (this.position.x >= this.endPos.x) {
          this.reversing = true;
          this.position.x = this.endPos.x;
          this.flipped = true;
        }
      }
    } else {
      if (this.config.isVertical) {
        this.position.y = this.position.y - this.config.stepSize;
        if (this.position.y <= this.config.startPos.y) {
          this.reversing = false;
          this.position.y = this.config.startPos.y;
          this.flipped = true;
        }
      } else {
        this.position.x = this.position.x - this.config.stepSize;
        if (this.position.x <= this.config.startPos.x) {
          this.reversing = false;
          this.position.x = this.config.startPos.x;
          this.flipped = true;
        }
      }
    }

    this.render();
    app.Board.updateEntityPosition(this,
        this.prevPosition.x, this.prevPosition.y,
        this.position.x, this.position.y,
        this.config.width, this.config.height);
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.position.x, this.position.y);
  }

  onContact(player) {
    super.onContact(player);
  }
}