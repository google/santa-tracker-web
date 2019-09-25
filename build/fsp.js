const fs = require('fs').promises;
const rimraf = require('rimraf');

module.exports = Object.assign({}, fs, {
  async statOrNull(f) {
    return fs.stat(f).catch((err) => null);
  },
  async exists(f) {
    return this.statOrNull(f).then((out) => out !== null);
  },
  mkdirp(f) {
    return fs.mkdir(f, {recursive: true});
  },
  unlinkAll(f) {
    // don't use util.promisify as we disable glob
    return new Promise((resolve, reject) => {
      rimraf(f, {glob: false}, (err) => {
        err ? reject(err) : resolve();
      });
    });
  },
});
