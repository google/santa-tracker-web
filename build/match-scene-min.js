const matchSceneMin = /^scenes\/(\w+)\/\1-scene\.min\.js$/;

module.exports = (cand) => {
  const m = matchSceneMin.exec(cand);
  if (!m) {
    return null;
  }
  return m[1];
}
