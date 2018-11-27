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
  category: 'play',
}, {
  module: 'traditions',
  category: 'learn',
  edu: true,
}, {
  module: 'codelab',
  category: 'learn',
  edu: true,
}, {
  module: 'airport',
  category: 'explore',
}, {
  module: 'app',
  category: 'play',
  link: 'https://play.google.com/store/apps/details?id=com.google.android.apps.santatracker',
}, {
  module: 'snowflake',
  category: 'learn',
  edu: true,
}, {
  module: 'translations',
  category: 'learn',
  edu: true,
}, {
  module: 'museum',
  category: 'watch',
}, {
  module: 'santascanvas',
  category: 'play',
}, {
  module: 'codeboogie',
  category: 'play',
  edu: true,
}, {
  module: 'presentbounce',
  category: 'play',
}, {
  module: 'penguindash',
  category: 'play',
}, {
  module: 'seasonofgiving',
  category: 'learn',
  edu: true,
}, {
  module: 'gumball',
  category: 'play',
}, {
  module: 'jamband',
  category: 'play',
}, {
  module: 'speedsketch',
  category: 'play',
}, {
  module: 'santaselfie',
  category: 'play',
}, {
  module: 'santasearch',
  category: 'play',
}, {
  module: 'carpool',
  category: 'watch',
}, {
  module: 'elfski',
  category: 'play',
}, {
  module: 'boatload',
  category: 'play',
}, {
  module: 'jetpack',
  category: 'play',
}, {
  module: 'runner',
  category: 'play',
}, {
  module: 'mercator',
  category: 'learn',
  edu: true,
}, {
  module: 'snowball',
  category: 'play',
}, {
  module: 'presentdrop',
  category: 'play',
}, {
  module: 'liftoff',
  launchDate: new Date('Dec 23, 2018'),
  category: 'watch',
}];
