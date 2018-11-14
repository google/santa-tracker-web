
/**
 * Returns whether the given string is a URL or URL-like.
 *
 * @param {string} cand
 * @return {boolean}
 */
module.exports = (cand) => {
  if (cand.startsWith('//')) {
    return true;
  }
  try {
    new URL(cand);
    return true;
  } catch (e) {
    // ignore
  }
  return false;
}
