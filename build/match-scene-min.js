const matchScene = require('./match-scene.js');

/**
 * @param {string} filename to check
 * @return {?string} sceneName of min file
 */
module.exports = (filename) => {
  const {sceneName, rest} = matchScene(filename);
  if (rest === `${sceneName}-scene.min.js`) {
    return sceneName;
  }
  return null;
}
