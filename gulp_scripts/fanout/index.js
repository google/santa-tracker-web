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

/* jshint node: true */

const path = require('path');
const through = require('through2');
const gutil = require('gulp-util');

module.exports = function fanout(sceneNames) {
  return through.obj(function(file, enc, cb) {
    if (file.isStream()) { throw new gutil.PluginError('fanout', 'No stream support'); }
    if (file.isNull() || path.basename(file.path) !== 'index.html') {
      // Only fanout if the file is index.html.
      return cb(null, file);
    }

    const dir = path.dirname(file.path);
    sceneNames.forEach(sceneName => {
      const clone = file.clone();
      clone.path = path.join(dir, 'scenes', `${sceneName}.html`);
      this.push(clone);
    });

    this.push(file);  // always push original file
    cb();
  });
};