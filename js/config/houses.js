/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

// Note: launch dates need to be parsed in 'Dec 1, 2017' formatted.
// Date('yyyy-mm-dd') produces a UTC date. We want local dates.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#Differences_in_assumed_time-zone

window.HOUSES = [{
  module: 'wrapbattle',
  launchDate: new Date('Dec 1, 2017'),
  portalLaunchDate: new Date('Dec 1, 2017'),
  hideDate: true,
  category: 'play',
}, {
  module: 'traditions',
  launchDate: new Date('Dec 1, 2017'),
  portalLaunchDate: new Date('Dec 1, 2017'),
  hideDate: true,
  category: 'learn',
  edu: true,
}, {
  module: 'codelab',
  launchDate: new Date('Dec 1, 2017'),
  portalLaunchDate: new Date('Dec 1, 2017'),
  hideDate: true,
  category: 'learn',
  edu: true,
}, {
  module: 'airport',
  launchDate: new Date('Dec 1, 2017'),
  portalLaunchDate: new Date('Dec 1, 2017'),
  hideDate: true,
  category: 'explore',
}, {
  module: 'app',
  launchDate: new Date('Dec 1, 2017'),
  category: 'play',
  link: 'https://play.google.com/store/apps/details?id=com.google.android.apps.santatracker',
}, {
  module: 'snowflake',
  launchDate: new Date('Dec 2, 2017'),
  portalLaunchDate: new Date('Dec 2, 2017'),
  category: 'learn',
  edu: true,
}, {
  module: 'translations',
  launchDate: new Date('Dec 3, 2017'),
  category: 'learn',
  edu: true,
}, {
  module: 'museum',
  launchDate: new Date('Dec 4, 2017'),
  category: 'watch',
}, {
  module: 'santascanvas',
  launchDate: new Date('Dec 5, 2017'),
  category: 'play',
}, {
  module: 'codeboogie',
  launchDate: new Date('Dec 6, 2017'),
  portalLaunchDate: new Date('Dec 6, 2017'),
  category: 'play',
  edu: true,
}, {
  module: 'presentbounce',
  launchDate: new Date('Dec 7, 2017'),
  portalLaunchDate: new Date('Dec 7, 2017'),
  category: 'play',
}, {
  module: 'penguindash',
  launchDate: new Date('Dec 8, 2017'),
  portalLaunchDate: new Date('Dec 8, 2017'),
  category: 'play',
}, {
  module: 'seasonofgiving',
  launchDate: new Date('Dec 9, 2017'),
  portalLaunchDate: new Date('Dec 9, 2017'),
  category: 'learn',
  edu: true,
}, {
  module: 'gumball',
  launchDate: new Date('Dec 10, 2017'),
  portalLaunchDate: new Date('Dec 10, 2017'),
  category: 'play',
}, {
  module: 'jamband',
  launchDate: new Date('Dec 11, 2017'),
  portalLaunchDate: new Date('Dec 11, 2017'),
  category: 'play',
}, {
  module: 'speedsketch',
  launchDate: new Date('Dec 12, 2017'),
  portalLaunchDate: new Date('Dec 12, 2017'),
  category: 'play',
}, {
  module: 'santaselfie',
  launchDate: new Date('Dec 13, 2017'),
  portalLaunchDate: new Date('Dec 13, 2017'),
  category: 'play',
}, {
  module: 'santasearch',
  launchDate: new Date('Dec 14, 2017'),
  portalLaunchDate: new Date('Dec 14, 2017'),
  category: 'play',
}, {
  module: 'carpool',
  launchDate: new Date('Dec 15, 2017'),
  category: 'watch',
}, {
  module: 'snowball',
  launchDate: new Date('Dec 16, 2017'),
  portalLaunchDate: new Date('Dec 16, 2017'),
  category: 'play',
}, {
  module: 'boatload',
  launchDate: new Date('Dec 17, 2017'),
  portalLaunchDate: new Date('Dec 17, 2017'),
  category: 'play',
}, {
  module: 'jetpack',
  launchDate: new Date('Dec 18, 2017'),
  portalLaunchDate: new Date('Dec 18, 2017'),
  category: 'play',
}, {
  module: 'runner',
  launchDate: new Date('Dec 19, 2017'),
  portalLaunchDate: new Date('Dec 19, 2017'),
  category: 'play',
}, {
  module: 'mercator',
  launchDate: new Date('Dec 20, 2017'),
  portalLaunchDate: new Date('Dec 20, 2017'),
  category: 'learn',
  edu: true,
}, {
  module: 'elfski',
  launchDate: new Date('Dec 21, 2017'),
  portalLaunchDate: new Date('Dec 21, 2017'),
  category: 'play',
}, {
  module: 'presentdrop',
  launchDate: new Date('Dec 22, 2017'),
  portalLaunchDate: new Date('Dec 22, 2017'),
  category: 'play',
}, {
  module: 'liftoff',
  launchDate: new Date('Dec 23, 2017'),
  portalLaunchDate: new Date('Dec 23, 2020'),
  category: 'watch',
}];
