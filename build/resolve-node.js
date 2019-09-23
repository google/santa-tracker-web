const fs = require('fs').promises;
const path = require('path');


const statOrNull = async (p) => fs.stat(p).catch((err) => null);

// TODO(samthor): Used in a few places.
const alreadyResolvedMatch = /^(\.{0,2}\/|[a-z]\w*\:)/;  // matches start of './' or 'https:' etc


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
  if (!importer || alreadyResolvedMatch.exec(importee)) {
    return null;  // not importable
  }

  const resolved = path.resolve(importer);  // resolve import self
  const container = await nearestContainingDirectory(resolved);
  if (container === null) {
    return null;
  }

  const direct = path.join(container, 'node_modules', importee);
  const stat = await statOrNull(direct);

  if (stat === null) {
    // Otherwise, try some possible extensions to see if they are real files.
    for (const ext of ['.js', '.json']) {
      const cand = direct + ext;
      if (await statOrNull(cand)) {
        return cand;
      }
    }
  } else if (stat.isDirectory()) {
    const cand = path.join(direct, 'package.json');
    const packageStat = await statOrNull(cand);
    if (packageStat) {
      const raw = await fs.readFile(cand, 'utf-8');
      const info = JSON.parse(raw);
      const entrypoint = info['module'] || info['esnext:main'] || info['main'] || null;
      if (entrypoint) {
        return path.join(direct, entrypoint);
      }
    }

    const indexCand = path.join(direct, 'index.js');
    if (await statOrNull(indexCand)) {
      return indexCand;
    }
  }

  return direct;
};
