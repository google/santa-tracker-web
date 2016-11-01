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
const through = require('through');
const gutil = require('gulp-util');
const crypto = require('crypto');

const OUTPUT_PATH = 'contents.js';

function hash(contents) {
  const md5 = crypto.createHash('md5');
  md5.update(contents, 'utf8');
  return md5.digest('hex');
}

module.exports = function fileManifest(version, prefix) {
  const out = {
    version,
    'shared': {},
    'scenes': {},
  };

  const pathPrefix = path.resolve(prefix);

  function processFile(file) {
    if (file.isNull()) {
      return;  // ignore, we don't care
    }
    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('file_manifest', 'No stream support'));
    }

    const p = path.normalize(file.path);
    const rel = path.relative(pathPrefix, p);

    if (rel === OUTPUT_PATH) {
      // TODO(samthor): This is a bit ugly. It won't hit in real prod builds (since we build/clean)
      // but will occur over multiple test runs at the same version.
      return;  // nb. ignore ourselves
    }

    let target = {};
    const match = rel.match(/scenes\/(.+?)\//);
    if (match) {
      const scene = match[1];
      if (!(scene in out['scenes'])) {
        out['scenes'][scene] = {};
      }
      target = out['scenes'][scene];
    } else {
      target = out['shared'];
    }

    target[rel] = hash(file.contents);
  }

  function buildManifest() {
    const data = `// Generated at ${new Date().toISOString()}
const contents = ${JSON.stringify(out)};
`;
    const outputFile = new gutil.File({
      base: pathPrefix,
      contents: new Buffer(data),
      path: path.join(pathPrefix, OUTPUT_PATH),
    });

    this.emit('data', outputFile);
    this.emit('end');
  }

  return through(processFile, buildManifest);
};
