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

goog.require('app.Models');

/**
 * Press Scene class
 * Main class responsible for kicking off the scene's additional functionality
 *
 * @constructor
 * @export
 */
app.Scene = function() {
  this.models = app.Models;
};

/**
 * @return {!Array<!Object>} model objects
 */
app.Scene.prototype.getModels = function() {
  return this.models;
};
