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

const fs = require('fs');
const path = require('path');
const through = require('through2');
const gutil = require('gulp-util');
const mutate = require('../mutate_html');

module.exports = function fanout(sceneConfig) {
  return through.obj(function(file, enc, cb) {
    if (file.isStream()) { throw new gutil.PluginError('fanout', 'No stream support'); }
    if (file.isNull() || path.basename(file.path) !== 'index.html') {
      // Only fanout if the file is index.html.
      return cb(null, file);
    }

    const dir = path.dirname(file.path);
    const src = file.contents.toString();

    const missingOgImages = [];

    const sceneNames =
        Object.keys(sceneConfig).filter(sceneName => sceneConfig[sceneName].fanout !== false);
    sceneNames.forEach(sceneName => {
      const clone = file.clone();
      const config = sceneConfig[sceneName];

      const replaced = mutate(src, function() {
        const ogImagePath = `images/scenes/${sceneName}_2x.png`;
        if (fs.existsSync(ogImagePath)) {
          const ogImage = this.head.querySelector('[property="og:image"]');
          ogImage.content = `https://santatracker.google.com/images/scenes/${sceneName}_2x.png`;
        } else {
          missingOgImages.push(sceneName);
        }

        if (config.msgid) {
          // TODO(samthor): Include site name?
          const ogTitle = this.head.querySelector('[property="og:title"]');
          ogTitle.msgid = config.msgid;
        }
      });

      clone.contents = new Buffer(replaced);
      clone.path = path.join(dir, `${sceneName}.html`);
      this.push(clone);
    });

    if (missingOgImages.length) {
      gutil.log('WARNING[fanout]:', `missing og images: ${missingOgImages}`);
    }

    this.push(file);  // always push original file
    cb();
  });
};