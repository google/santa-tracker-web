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

goog.provide('app.Pit');

goog.require('Constants');
goog.require('Utils');

goog.require('app.Entity');
goog.require('app.TileManager');
goog.require('app.shared.pools');

app.Pit = class Pit extends app.Entity {
  onInit(config) {
    super.onInit({...config, checkCell: true});

    app.TileManager.renderEntity('pit', config.width, config.height,
        this.elem);
  }

  onDispose() {
    super.onDispose();
    Utils.removeAllChildren(this.elem);
  }

  addTile(position) {
    let tile = document.createElement('div');
    tile.classList.add('pit__tile');

    if (position) {
      tile.classList.add(`pit__tile--${position}`);
    }

    this.elem.appendChild(tile);
  }

  render() {
    super.render();
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`;
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`;
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y);
  }

  onContact(player) {
    if (Utils.isTouchingBorder(this.config, player.position)) {
      return [Constants.PLAYER_ACTIONS.PIT_FALL];
    }

    return [];
  }
}

app.Pit.targetHolderId = 'pits';
app.Pit.elemClass = 'pit';

app.shared.pools.mixin(app.Pit);
