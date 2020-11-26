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

goog.provide('app.Ice')

goog.require('Constants')
goog.require('Utils')

goog.require('app.Entity')
goog.require('app.shared.pools')

app.Ice = class Ice extends app.Entity {
  onInit(config) {
    super.onInit({...config, checkCell: true});
  }

  render() {
    super.render()
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.ICE]
  }
}

app.Ice.targetHolderId = 'ice';
app.Ice.elemClass = 'ice';

app.shared.pools.mixin(app.Ice)
