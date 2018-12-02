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
  module: 'elfmaker',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'wrapbattle',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'translations',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
  edu: true,
}, {
  module: 'codelab',
  category: 'learn',
  edu: true,
}, {
  module: 'traditions',
  category: 'learn',
  launchDate: new Date('Dec 4, 2018'),
  edu: true,
}, {
  module: 'poseboogie',
  category: 'play',
  launchDate: new Date('Dec 14, 2018'),
}, {
  module: 'snowflake',
  category: 'learn',
  edu: true,
}, {
  module: 'presentbounce',
  category: 'learn',
  launchDate: new Date('Dec 4, 2018'),
  edu: true,
}, {
  module: 'museum',
  category: 'watch',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'santascanvas',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'codeboogie',
  category: 'play',
  edu: true,
}, {
  module: 'app',
  category: 'play',
  link: 'https://play.google.com/store/apps/details?id=com.google.android.apps.santatracker',
  launchDate: new Date('Dec 10, 2018'),
}, {
  module: 'seasonofgiving',
  category: 'learn',
  launchDate: new Date('Dec 4, 2018'),
  edu: true,
}, {
  module: 'gumball',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'penguindash',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'speedsketch',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'santaselfie',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'santasearch',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'carpool',
  category: 'watch',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'elfski',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'boatload',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'jamband',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'jetpack',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'runner',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'mercator',
  category: 'learn',
  launchDate: new Date('Dec 4, 2018'),
  edu: true,
}, {
  module: 'snowball',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'presentdrop',
  category: 'play',
  launchDate: new Date('Dec 4, 2018'),
}, {
  module: 'liftoff',
  launchDate: new Date('Dec 23, 2018'),
  category: 'watch',
}];
