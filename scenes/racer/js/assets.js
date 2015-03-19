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

goog.provide('SB.Assets');

/**
 * Handles the asset loading for the game.
 * @param {string} componentDir path to the scene static files.
 */
SB.Assets.init = function(componentDir) {
  if (SB.Assets.manifest_ != null) {
    return;
  }
  var manifest = SB.Assets.manifest_ = {};
  manifest.santa = new Image();
  manifest.santa.src = componentDir + 'img/santa-sleigh.png';
  manifest.rudolf = new Image();
  manifest.rudolf.src = componentDir + 'img/rudolf.png';
  manifest.tree = new Image();
  manifest.tree.src = componentDir + 'img/tree.png';
  manifest.rock = new Image();
  manifest.rock.src = componentDir + 'img/rock.png';
  manifest.present = new Image();
  manifest.present.src = componentDir + 'img/present.png';
};

/**
 * Store all assets
 * @type {{}}
 * @private
 */
SB.Assets.manifest_ = null;


/**
 * Gets a reference to a loaded asset.
 * @param {string} name The name of the assets to retrieve.
 * @return {Image}
 */
SB.Assets.get = function(name) {
  return SB.Assets.manifest_[name];
};
