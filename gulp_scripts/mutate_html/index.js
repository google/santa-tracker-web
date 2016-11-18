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

const jsdom = require('jsdom');
const parser = new (require('jsdom/lib/jsdom/living')).DOMParser();
const through2 = require('through2');
const gutil = require('gulp-util');

/**
 * Loads content as `text/html` and passes it to the callback to be manipulated. This wraps `jsdom`
 * but just uses its `DOMParser`.
 *
 * TODO(samthor): explain how template nodes are also passed since we can't pierce them
 *
 * @param {string} src
 * @param {function(this:Node)} callback
 * @return {string}
 */
function mutateHTML(src, callback) {
  const doc = parser.parseFromString(src, 'text/html');
  const pending = [doc];

  while (pending.length) {
    const next = pending.shift();

    callback.call(next);

    // DOM methods don't pierce into `template`: queue every template up and pass them through to
    // the node callback too.
    const sub = next.querySelectorAll('template');
    for (let i = 0, t; t = sub[i]; ++i) {
      pending.push(t.content);
    }
  }

  return jsdom.serializeDocument(doc);
};

/**
 * Returns a transform that mutates HTML.
 *
 * @param {function(this:Node)}
 * @return {!Object}
 */
mutateHTML.gulp = function(mutator) {
  return through2.obj(function(file, enc, cb) {
    if (file.isNull() || !file.path.match(/\.html$/)) {
      return stream.push(file);
    }
    if (file.isStream()) {
      throw new gutil.PluginError('mutate_html', 'No stream support');
    }

    const replaced = mutateHTML(file.contents.toString(), mutator);

    file.contents = new Buffer(replaced);
    this.push(file);
    cb();
  });
};

module.exports = mutateHTML;