#!/usr/bin/env node
/**
 * @fileoverview Removes notes from Lottie files.
 */

const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');

const j = JSON.parse(raw);

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

cleanupNotes(j);

console.info(JSON.stringify(j));
