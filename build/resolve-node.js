const fs = require('fs').promises;
const importUtils = require('./import-utils.js');
const path = require('path');


const statOrNull = async (p) => fs.stat(p).catch((err) => null);


/**
 * Finds the nearest named folder (including symlinks).
 *
 * @param {string} id to search from
 * @param {string=} name to find
 * @return {string}
 */
const nearestContainingDirectory = async (id, name='node_modules') => {
  let prev = null;
  for (let check = path.dirname(id); check !== prev; check = path.dirname(check)) {
    prev = check;

    const stat = await statOrNull(path.join(check, name));
    if (stat && stat.isDirectory()) {
      return check;
    }
  }

  return null;
};


module.exports = async (importee, importer) => {
  let target;

  if (importee.startsWith('\0') || !importer) {
    return null;  // not importable
  }
  if (importUtils.alreadyResolved(importee)) {
    // Check if we're importing in a relative fashion while already inside node_modules.
    if (path.isAbsolute(importee)) {
      target = importee;
    } else {
      target = path.join(path.dirname(importer), importee);
    }

    const container = await nearestContainingDirectory(target);
    if (container === null || !target.startsWith(path.join(container, 'node_modules'))) {
      return null;  // not inside node_modules
    }
  } else {
    // This is a traditional "naked" Node import.
    const resolved = path.resolve(importer);  // resolve import self
    const container = await nearestContainingDirectory(resolved);
    if (container === null) {
      return null;
    }
    target = path.join(container, 'node_modules', importee);
  }

  const stat = await statOrNull(target);
  if (stat === null) {
    // Otherwise, try some possible extensions to see if they are real files.
    for (const ext of ['.js', '.json']) {
      const cand = target + ext;
      if (await statOrNull(cand)) {
        return cand;
      }
    }
  } else if (stat.isDirectory()) {
    const cand = path.join(target, 'package.json');
    const packageStat = await statOrNull(cand);
    if (packageStat) {
      const raw = await fs.readFile(cand, 'utf-8');
      const info = JSON.parse(raw);
      const entrypoint = info['module'] || info['esnext:main'] || info['main'] || null;
      if (entrypoint) {
        return path.join(target, entrypoint);
      }
    }

    const indexCand = path.join(target, 'index.js');
    if (await statOrNull(indexCand)) {
      return indexCand;
    }
  }

  return target;
};
