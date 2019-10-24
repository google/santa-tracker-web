/**
 * @fileoverview Provides defaults for Firebase Remote Config.
 * 
 * This is a sensible, low-key fallback configuration in case the RC service fails for new users
 * (existing users will always use cached values, as there's no real way to indicate that they
 * could be fundamentally out-of-date).
 */

var defaults = {
  videos: [],
  sceneLock: {},
  routeUrl: 'https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_|LANG|.json?alt=media&2018b',
  sceneRedirect: {'educators': 'grownup'},
  upgradeToVersion: '',
  switchOff: false,
  indexScene: 'index',
};

var now = new Date();
if (now.getMonth() === 9 || now.getMonth() === 10) {
  // Oct-Nov
  defaults.indexScene = 'underconstruction';

} else if (now.getMonth() !== 11) {
  // Jan-Sep

} else {
  // Dec 

}

// Firebase Remote Config only returns strings, so wrap everything.
for (const key in defaults) {
  const v = defaults[key];
  if (typeof v !== 'string') {
    defaults[key] = JSON.stringify(defaults[key]);
  }
}

export default defaults;