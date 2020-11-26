#!/usr/bin/env node
/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Removes notes from Lottie files.
 */

function cleanupNotes(o) {
  if (typeof o !== 'object') {
    return;
  }
  if (Array.isArray(o)) {
    o.forEach(cleanupNotes);
    return;
  }

  delete o['nm'];
  delete o['mn'];
  //delete o['v'];

  for (const key in o) {
    const cand = o[key];
    if (!cand) {
      // Can't remove falsey values (maybe some?)
    } else {
      cleanupNotes(cand);
    }
  }
}

const files = process.argv.slice(2);
if (!files.length) {
  files.push(0);  // read stdin if no files passed
}

const fs = require('fs');
let inputBytes = 0;
let outputBytes = 0;

files.forEach((file) => {
  const raw = fs.readFileSync(file, 'utf-8');
  inputBytes += raw.length;

  let j;
  try {
    j = JSON.parse(raw);
  } catch (e) {
    process.stderr.write(`Skipping ${file}, can't parse JSON\n`);
    return;
  }
  cleanupNotes(j);
  const out = JSON.stringify(j);
  outputBytes += out.length;

  if (file === 0) {
    console.info(out);
  } else {
    fs.writeFileSync(file, out);
  }
});

process.stderr.write(`Output ${(outputBytes / inputBytes * 100).toFixed(2)}% of input\n`);
