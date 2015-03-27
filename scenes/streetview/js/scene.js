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

goog.provide('app.Scene');

goog.require('app.Constants');
goog.require('app.Viewport');



/**
 * Main scene class.
 * @param {!Element} el DOM element containing the scene.
 * @constructor
 * @export
 */
app.Scene = function(el) {
  this.elem = $(el);
  this.blocksElem = this.elem.find(app.Constants.SELECTOR_BLOCKS);
  this.blocksContainerElem = this.elem.find(app.Constants.SELECTOR_BLOCKS_CONTAINER);
  this.viewport = new app.Viewport(this.elem, this.blocksElem, this.blocksContainerElem);
  this.viewport.init();
};


/**
 * Move the scene and viewport to the left.
 */
app.Scene.prototype.moveLeft = function() {
  this.viewport.handlePaginate(1);
};


/**
 * Move the scene and viewport to the right.
 */
app.Scene.prototype.moveRight = function() {
  this.viewport.handlePaginate(-1);
};


/**
 * Clean up
 * @export
 */
app.Scene.prototype.destroy = function() {
  this.viewport.destroy();
  this.blocksElem = null;
  this.blocksContainerElem = null;
};
