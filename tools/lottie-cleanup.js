#!/usr/bin/env node
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

  const j = JSON.parse(raw);
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
