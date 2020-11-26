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

goog.provide('app.Table');

goog.require('Constants');
goog.require('Utils');

goog.require('app.ControlsManager');
goog.require('app.Entity');
goog.require('app.LevelManager');
goog.require('app.shared.pools');

app.Table = class Table extends app.Entity {
  constructor() {
    super();

    this.lastSoundTime = 0;
  }

  onInit(config) {
    super.onInit({
      ...config,
      width: config.isSideView ? Constants.TABLE_HEIGHT : Constants.TABLE_WIDTH,
      height: config.isSideView ? Constants.TABLE_WIDTH : Constants.TABLE_HEIGHT,
      checkBorder: true
    });

    const { toyType } = app.LevelManager;
    const toyPart = this.config.part;
    let classes = `table table--${toyType.key}--${toyPart} table--${this.config.tableType}${config.isSideView ? ' table--side' : ''}`;
    this.elem.setAttribute('class', classes);
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y);
  }

  onContact(player) {
    let actions = [];

    // if player is close to border, it can do an action
    if (Utils.isTouchingBorder(this.config, player.position)) {
      if (app.ControlsManager.isTouch || app.ControlsManager.isKeyControlActive(player.controls.action)) {
        actions = [Constants.PLAYER_ACTIONS.ADD_TOY_PART];
      }
      if (Constants.DEBUG) {
        this.elem.style.opacity = 0.5;
      }
    } else if (Constants.DEBUG) {
      this.elem.style.opacity = 1;
    }

    this.blockingPosition = Utils.isInBorder(this.config, player.position, player.prevPosition);

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [...actions, Constants.PLAYER_ACTIONS.BLOCK];
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
}

app.Table.targetHolderId = 'tables';
app.Table.elemClass = 'table';

app.shared.pools.mixin(app.Table);
