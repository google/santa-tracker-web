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

// Note: launch dates need to be parsed in 'Dec 1, 2015' formatted.
// Date('yyyy-mm-dd') produces a UTC date. We want local dates.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#Differences_in_assumed_time-zone

window.HOUSES = [{
  module: "airport",
  iced: true,
  color: '#fdbe27',
  launchDate: new Date('Dec 1, 2015'),
  hideDate: true,
  category: "play"
}, {
  module: "traditions",
  iced: true,
  color: '#fdbe27',
  launchDate: new Date('Dec 1, 2015'),
  hideDate: true,
  category: "learn"
}, {
  module: "codelab",
  iced: true,
  color: '#9a519f',
  launchDate: new Date('Dec 1, 2015'),
  hideDate: true,
  category: "learn"
}, {
  module: "app",
  iced: true,
  color: '#fdbe27',
  launchDate: new Date('Dec 1, 2015'),
  hideDate: true,
  category: "play",
  link: 'https://play.google.com/store/apps/details?id=com.google.android.apps.santatracker'
}, {
  module: "seasonofgiving",
  iced: true,
  color: '#9dca3b',
  launchDate: new Date('Dec 1, 2015'),
  category: "learn"
}, {
  module: "santasback",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 2, 2015'),
  category: "watch"
}, {
  module: "santaselfie",
  iced: true,
  color: '#4172e8',
  launchDate: new Date('Dec 3, 2015'),
  category: "play"
}, {
  module: "translations",
  iced: true,
  color: '#558b2f',
  launchDate: new Date('Dec 4, 2015'),
  category: "learn"
}, {
  module: "carpool",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 5, 2015'),
  category: "watch"
}, {
  module: "presentdrop",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 6, 2015'),
  category: "play"
}, {
  module: "santasearch",
  iced: true,
  launchDate: new Date('Dec 7, 2015'),
  category: "play"
}, {
  module: "windtunnel",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 8, 2015'),
  category: "play"
}, {
  module: "racer",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 9, 2015'),
  category: "play"
}, {
  module: "jamband",
  iced: true,
  color: '#fdbe27',
  launchDate: new Date('Dec 10, 2015'),
  category: "play"
}, {
  module: "gumball",
  iced: true,
  color: '#fdbe27',
  launchDate: new Date('Dec 11, 2015'),
  category: "play"
}, {
  module: "postcard",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 12, 2015'),
  category: "play"
}, {
  module: "jetpack",
  iced: true,
  color: '#9a519f',
  launchDate: new Date('Dec 13, 2015'),
  category: "play"
}, {
  module: "boatload",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 14, 2015'),
  category: "play"
}, {
  module: "mercator",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 15, 2015'),
  category: "play"
}, {
  module: "presentbounce",
  iced: true,
  color: '#4172e8',
  launchDate: new Date('Dec 16, 2015'),
  category: "play"
}, {
  module: "codeboogie",
  iced: true,
  color: '#9a519f',
  launchDate: new Date('Dec 17, 2015'),
  category: "play"
}, {
  // optionally used instead of "briefing" in some regions
  module: "callfromsanta",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 18, 2015'),
  category: "play"
}, {
  // optionally used instead of "callfromsanta" in some regions
  module: "briefing",
  fallback: true,
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 18, 2015'),
  category: "play"
}, {
  module: "citylights",
  iced: true,
  color: '#182a4a',
  launchDate: new Date('Dec 19, 2015'),
  category: "learn"
}, {
  module: "commandcentre",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 20, 2015'),
  category: "watch"
}, {
  module: "seasonofcaring",
  iced: true,
  color: '#9dca3b',
  launchDate: new Date('Dec 21, 2015'),
  category: "learn"
}, {
  module: "matching",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 22, 2015'),
  category: "play"
}, {
  module: "liftoff",
  iced: true,
  color: '#00c6ed',
  launchDate: new Date('Dec 23, 2015'),
  category: "watch"
}];