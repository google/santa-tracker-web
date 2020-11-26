/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Provides defaults for Firebase Remote Config.
 * 
 * This is a sensible, low-key fallback configuration in case the RC service fails for new users
 * (existing users will always use cached values, as there's no real way to indicate that they
 * could be fundamentally out-of-date).
 */

var defaults = {
  featured: {},
  nav: ['@cityquiz','@rocketsleigh','@dasherdancer','@snowballrun','@presenttoss','@penguinswim','santaselfie','codeboogie','jetpack','jamband','snowball','elfmaker','codelab','wrapbattle','penguindash','build','matching','museum','boatload','takeoff','gumball','presentbounce','glider','speedsketch','santascanvas','seasonofgiving','penguinproof','traditions','wheressanta','santasearch','translations','runner','snowbox','mercator','windtunnel'],
  fallbackIndexScene: 'retro',
  indexScene: 'modvil',
  switchOff: false,
  upgradeToVersion: '',
  sceneRedirect: {'educators':'familyguide','press':'familyguide','tracker':'','village':''},
  routeUrl: 'https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_|LANG|.json?alt=media&2018b',
  sceneLock: {},
  videos: ['carpool','comroom','jingle','liftoff','museum','office','onvacation','penguinproof','reindeerworries','reload','santasback','satellite','selfies','slackingoff','takeoff','temptation','tired','wheressanta','workshop','likealight','yulelog'],
  refreshEvery: 60,  // this is low, _because_ we're offline
  useGeoIP: true,
  showTracker: false,
  routeJitter: 10,
};

var now = new Date();
if (now.getMonth() === 9 || now.getMonth() === 10) {
  // Oct-Nov

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