
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
