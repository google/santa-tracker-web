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
const crisper = require('crisper');

module.exports = function plugin(opts) {
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) { return cb(null, file) }
    if (file.isStream()) { throw new gutil.PluginError('crisper', 'No stream support'); }

    const basename = path.basename(file.path, path.extname(file.path));

    // Match paths in the form 'foo_en.html', and change their vulcanized JS filename to 'foo.js'.
    // The JS is language agnostic. Do nothing if a language isn't matched.
    const match = basename.match(/^(.+)_(\w+(|-\w+))$/);
    let jsFileName = basename;
    if (match) {
      jsFileName = match[1];
    }
    jsFileName += '.js';

    const out = crisper({source: file.contents.toString(), scriptInHead: true, jsFileName});
    for (const ext in out) {
      const contents = out[ext];
      if (!contents) { continue; }

      const n = (ext === 'js' ? jsFileName : `${basename}.${ext}`);
      const f = file.clone();
      f.path = path.join(path.dirname(file.path), n)
      f.contents = new Buffer(contents);
      this.push(f);
    }

    cb();
  });
};
