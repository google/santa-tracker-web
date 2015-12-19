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
  launchDate: new Date('Dec 1, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  hideDate: true,
  category: "play"
}, {
  module: "traditions",
  iced: true,
  launchDate: new Date('Dec 1, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  hideDate: true,
  category: "learn"
}, {
  module: "codelab",
  iced: true,
  launchDate: new Date('Dec 1, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  hideDate: true,
  category: "learn"
}, {
  module: "app",
  iced: true,
  launchDate: new Date('Dec 1, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  hideDate: true,
  category: "play",
  link: 'https://play.google.com/store/apps/details?id=com.google.android.apps.santatracker'
}, {
  module: "seasonofgiving",
  iced: true,
  launchDate: new Date('Dec 1, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "learn"
}, {
  module: "santasback",
  iced: true,
  launchDate: new Date('Dec 2, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "watch"
}, {
  module: "santaselfie",
  iced: true,
  launchDate: new Date('Dec 3, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "translations",
  iced: true,
  launchDate: new Date('Dec 4, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "learn"
}, {
  module: "carpool",
  iced: true,
  launchDate: new Date('Dec 5, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "watch"
}, {
  module: "presentdrop",
  iced: true,
  launchDate: new Date('Dec 6, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "santasearch",
  iced: true,
  launchDate: new Date('Dec 7, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "windtunnel",
  iced: true,
  launchDate: new Date('Dec 8, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "racer",
  iced: true,
  launchDate: new Date('Dec 9, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "jamband",
  iced: true,
  launchDate: new Date('Dec 10, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "gumball",
  iced: true,
  launchDate: new Date('Dec 11, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "postcard",
  iced: true,
  launchDate: new Date('Dec 12, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "jetpack",
  iced: true,
  launchDate: new Date('Dec 13, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "boatload",
  iced: true,
  launchDate: new Date('Dec 14, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "codeboogie",
  iced: true,
  launchDate: new Date('Dec 15, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "presentbounce",
  iced: true,
  launchDate: new Date('Dec 16, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "mercator",
  iced: true,
  launchDate: new Date('Dec 17, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, [
  {
    // optionally used instead of "briefing" in some regions
    module: "callfromsanta",
    iced: true,
    launchDate: new Date('Dec 18, 2015'),
    portalLaunchDate: new Date('Dec 1, 2015'),
    category: "play"
  }, {
    // optionally used instead of "callfromsanta" in some regions
    module: "briefing",
    iced: true,
    launchDate: new Date('Dec 18, 2015'),
    portalLaunchDate: new Date('Dec 1, 2015'),
    category: "play"
  }
], {
  module: "citylights",
  iced: true,
  launchDate: new Date('Dec 19, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "learn"
}, {
  module: "commandcentre",
  iced: true,
  launchDate: new Date('Dec 20, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "watch"
}, [
  {
    // used in en only
    module: "seasonofcaring",
    iced: true,
    launchDate: new Date('Dec 21, 2015'),
    portalLaunchDate: new Date('Dec 1, 2015'),
    category: "learn"
  }, {
    // fallback for "seasonofcaring"
    module: "factory",
    iced: true,
    launchDate: new Date('Dec 21, 2015'),
    portalLaunchDate: new Date('Dec 1, 2015'),
    category: "play"
  }
], {
  module: "matching",
  iced: true,
  launchDate: new Date('Dec 22, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "play"
}, {
  module: "liftoff",
  iced: true,
  launchDate: new Date('Dec 23, 2015'),
  portalLaunchDate: new Date('Dec 1, 2015'),
  category: "watch"
}];
