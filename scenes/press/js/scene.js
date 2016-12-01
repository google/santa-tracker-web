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
goog.require('app.AndroidModels');

/**
 * Press Scene class. Provides access to models.
 *
 * @struct
 * @constructor
 * @export
 */
app.Scene = function() {
};

/**
 * @param {function(string): boolean|undefined} opt_locked
 * @return {!Array<!Object>} model objects
 */
app.Scene.prototype.getModels = function(opt_locked) {
  const out = app.Models;
  if (opt_locked) {
    out.forEach(model => model.locked = opt_locked(model.key));
  }
  return out;
};

/**
 * @return {!Array<!Object>} model objects
 */
app.Scene.prototype.getAndroidModels = function() {
  return app.AndroidModels;
};
