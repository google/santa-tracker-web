/*
 * Copyright 2017 Google Inc. All rights reserved.
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

/**
 * @fileoverview Gulp plugin to merge streams. Finishes automatically if not used in the next tick.
 */

/* jshint node: true */

'use strict';

const PassThrough = require('readable-stream/passthrough')

module.exports = function(...initial) {
  let touched = false;
  const sources = new Set();
  const merged  = new PassThrough({objectMode: true});

  function remove(source) {
    sources.delete(source);
    if (sources.size === 0) {
      merged.end();
    }
  }

  process.nextTick(() => {
    if (!touched) {
      merged.end();
    }
  });

  merged.setMaxListeners(0);
  merged.add = function(source) {
    if (sources.has(source)) { return; }

    touched = true;
    sources.add(source);
    source.once('end', () => remove(source));
    source.once('error', () => merged.emit('error'));
    source.pipe(merged, {end: false});

    return this;
  };

  merged.finished = new Promise((resolve, reject) => {
    merged.on('end', resolve);    // technically for stream.Readable
    merged.on('finish', resolve); // technically for stream.Wrtiable
    merged.on('error', reject); 
  });

  merged.on('unpipe', remove);
  Array.from(initial).forEach((s) => merged.add(s));
  return merged;
};