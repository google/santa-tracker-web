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
 * @fileoverview Initialize function to prepare Firebase and Remote Config.
 */

import firebase from 'firebase/app';
import 'firebase/remote-config';
import defaults from './remote-config-defaults.js';
import isAndroidTWA from './android-twa.js';

export const firebaseConfig = {
  apiKey: 'AIzaSyBrNcGcna0TMn2uLRxhMBwxVwXUBjlZqzU',
  authDomain: 'santa-api.firebaseapp.com',
  databaseURL: 'https://santa-api.firebaseio.com',
  projectId: 'santa-api',
  storageBucket: 'santa-api.appspot.com',
  messagingSenderId: '593146395815',
  appId: '1:593146395815:web:d766962076fbbd13492f82',
  measurementId: 'G-EWRYGZS6D3',
};

export function initialize() {
  if (isAndroidTWA()) {
    // Swap for TWA (dev and prod)
    firebaseConfig.appId = '1:593146395815:web:aefb4c5b5e01137f492f82';
    firebaseConfig.measurementId = 'G-0X2VE68GZD';
  } else if (window.location.hostname !== 'santatracker.google.com') {
    // Swap for dev
    firebaseConfig.appId = '1:593146395815:web:54c339298196fd10492f82';
    firebaseConfig.measurementId = 'G-GPEHME4LVG';
  }

  firebase.initializeApp(firebaseConfig);

  // Fetch RC, with a fetch timeout of 30s and a key expiry of ~1 minute. This is reset later via
  // the config itself.
  let minimumFetchIntervalMillis = 1000 * 60;
  if (!navigator.onLine) {
    // If the browser thinks we're offline, then allow a much larger range of cached keys (~12
    // hours, the default).
    minimumFetchIntervalMillis *= (12 * 60);
  }
  const remoteConfig = firebase.remoteConfig();
  remoteConfig.settings = {
    fetchTimeoutMillis: 30 * 1000,
    minimumFetchIntervalMillis,
  };

  remoteConfig.defaultConfig = defaults;
  window.firebase = firebase;  // side-effect

  return remoteConfig.fetchAndActivate().catch((err) => {
    ga('send', 'event', 'config', 'failure', 'firebase', {nonInteraction: true});
    console.warn('could not fetch remoteConfig, using defaults', err);
  }).then(() => {
    return remoteConfig;
  });
}