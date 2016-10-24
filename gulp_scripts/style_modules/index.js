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

/**
 * Generates style modules for all passed .css files. The suffix will be used as part of the
 * filename and generated module ID. Duplicate IDs (e.g. same file, different paths) will throw
 * an error for safety.
 *
 * @param {string} suffix The suffix to apply to the name of the CSS file to create a style module.
 */
module.exports = function styleModules(suffix = '') {
  const found = new Set();

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return stream.push(file);
    }
    if (file.isStream()) {
      throw new gutil.PluginError('style_modules', 'No stream support');
    }
    if (!file.path.endsWith('.css')) {
      this.push(file);  // ignore non-css
      return cb();
    }

    // Prevent duplicate style module IDs based on the basename (i.e., foo/bar/blah.css => blah).
    const moduleName = path.basename(file.path, '.css');
    if (found.has(moduleName)) {
      throw new gutil.PluginError('style_modules', `Duplicate style module found: ${moduleName}`);
    }
    found.add(moduleName);

    const contents = `
<dom-module id="${moduleName}${suffix}">
<template>
<style>
${file.contents.toString('utf8')}
</style>
</template>
</dom-module>`;

    const moduleFile = file.clone();
    moduleFile.path = file.path.replace(/\.css$/, suffix + '.html');
    moduleFile.contents = new Buffer(contents);

    this.push(moduleFile);
    this.push(file);
    return cb();
  });
};

