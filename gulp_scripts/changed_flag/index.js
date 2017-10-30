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

/**
 * @fileoverview Checks whether flags match previous flags for a specified file path, and nukes
 * the file otherwise.
 */

/* jshint node: true */

const fs = require('fs');
const path = require('path');
const through = require('through2');

function mkdirpSync(to) {
  const parts = to.split(path.sep);
  let i = 1;

  for (let i = 1; i <= parts.length; ++i) {
    const segment = parts.slice(0, i).join(path.sep);
    try {
      fs.mkdirSync(segment);
    } catch (err) {
      // ignore
    }
  }
}

/**
 * @param {string} cand path of file to remove if flags change
 * @param {*} config to serialize to JSON and compare
 * @return {boolean} whether the file was removed
 */
module.exports = function(cand, config) {
  // TODO(samthor): This is awkwardly an entirely synchronous operation.

  if (config === undefined) {
    config = {};
  }
  const flagPath = '.changedFlag/' + cand;
  const raw = JSON.stringify(config);

  let data;
  try {
    data = fs.readFileSync(flagPath);
  } catch (err) {
    // nb. we ignore err, in case it's file not found
  }
  if (data && data.toString('utf8') === raw) {
    return false;
  }

  try {
    fs.unlinkSync(cand);
  } catch (err) {
    // do nothing
  }

  // write the changed flag file
  mkdirpSync(path.dirname(flagPath));
  fs.writeFileSync(flagPath, raw);
  return true;
};
