const fs = require('fs');
const util = require('util');
const mkdirp = require('mkdirp');

const stat = util.promisify(fs.stat);
const exists = async (path) => {
  try {
    await stat(path);
  } catch (e) {
    return false;
  }
  return true;
};

module.exports = {
  copyFile: util.promisify(fs.copyFile),
  exists,
  readdir: util.promisify(fs.readdir),
  readFile: util.promisify(fs.readFile),
  stat,
  writeFile: util.promisify(fs.writeFile),
  mkdirp: util.promisify(mkdirp),
};
