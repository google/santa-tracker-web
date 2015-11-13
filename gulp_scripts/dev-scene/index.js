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

/* jshint node: true */

var fs = require('fs');
var path = require('path');
var through = require('through2');
var format = require('sprintf-js').sprintf;

var REGEX = /<script src="[^-"]*-scene.min.js"><\/script>/gm;

var TEMPLATES = {
  closureScripts: fs.readFileSync(path.join(__dirname, 'closure-scripts.tpl'), 'utf-8'),
  sceneWrap: fs.readFileSync(path.join(__dirname, 'scene-wrap.tpl'), 'utf-8')
};

module.exports = function devScene(sceneName, config) {
  config = config || {};

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) return this.push(file);
    if (file.isStream()) error('No support for streams');
    if (!file.path.match(/\.html$/)) {
      // Don't do work if the file isn't HTML.
      warn('skipping non-html: %s', file.path);
      return this.push(file);
    }

    var wrapTemplate = config.isFrame ? '%(content)s' : TEMPLATES.sceneWrap;
    var scriptsTemplate = TEMPLATES.closureScripts;
    var data = {
      sceneName: sceneName,
      content: file.contents.toString()
    };

    // Replace minified js reference with actual source files.
    if (config.entryPoint) {
      data.entryPoint = config.entryPoint;
      var scripts = format(TEMPLATES.closureScripts, data);
      data.content = data.content.replace(REGEX, scripts);
    }

    // Create the output file.
    var output = format(wrapTemplate, data);
    var devfile = file.clone();
    devfile.path = path.join(path.dirname(file.path), 'index.html');
    devfile.contents = new Buffer(output);

    this.push(devfile);
    cb();
  });
};
