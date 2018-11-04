const re = /^scenes\/(.+?)(?:\/(.*))$/;

/**
 * @param {string} filename to match
 * @return {{sceneName: string, rest: string}}
 */
module.exports = (filename) => {
  const m = re.exec(filename);

  if (m) {
    const sceneName = m[1];
    const rest = m[2];

    if (sceneName[0] !== '_') {
      return {sceneName, rest}
    }
  }

  return {sceneName: '', rest: ''};
}
