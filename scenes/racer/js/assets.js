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
  var manifest = SB.Assets.manifest_;
  function load(name, src) {
    var image = new Image();
    image.src = componentDir + 'img/' + src;
    manifest[name] = image;
  }
  load('santa', 'santa-sleigh.png');
  load('rudolf', 'rudolf.png');
  load('tree', 'tree.png');
  load('rock', 'rock.png');
  load('present', 'present.png');
};

/**
 * Store all assets
 * @type {!Object<!Image>}
 * @private
 */
SB.Assets.manifest_ = {};

/**
 * Gets a reference to a loaded asset.
 * @param {string} name The name of the assets to retrieve.
 * @return {!Image}
 */
SB.Assets.get = function(name) {
  return SB.Assets.manifest_[name];
};
