const fs = require('fs');
const util = require('util');
const mkdirp = require('mkdirp');

module.exports = {
  copyFile: util.promisify(fs.copyFile),
  readdir: util.promisify(fs.readdir),
  readFile: util.promisify(fs.readFile),
  writeFile: util.promisify(fs.writeFile),
  mkdirp: util.promisify(mkdirp),
};
