
const firebase = window.firebase;
const remoteConfig = firebase.remoteConfig();

export function values() {
  return remoteConfig.getAll();
}

/**
 * @param {string} route to check if locked
 * @return {boolean} if locked
 */
export function isLocked(route) {
  let sceneLock = {};
  try {
    sceneLock = JSON.parse(remoteConfig.getString('sceneLock'))
  } catch (e) {
    // ignore
  }
  if (!(route in sceneLock)) {
    return false;
  }

  const value = sceneLock[route];
  if (!value) {
    return true;  // always locked
  }
  const today = new Date();
  return value <= today.getDate();
}

/**
 * @return {string} the scene to show for "/" or "index"
 */
export function indexScene() {
  return remoteConfig.getString('indexScene');
}
