const fs = require('fs');
const util = require('util');
const mkdirp = require('mkdirp');

module.exports = {
  readFile: util.promisify(fs.readFile),
  writeFile: util.promisify(fs.writeFile),
  mkdirp: util.promisify(mkdirp),
};
