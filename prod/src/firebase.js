/**
 * @fileoverview Initialize function to prepare Firebase and Remote Config.
 */

import firebase from 'firebase/app';
import 'firebase/remote-config';
import defaults from './remote-config-defaults.js';

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

// Swap for Dev environment.
if (window.location.hostname !== 'santatracker.google.com') {
  firebaseConfig.appId = '1:593146395815:web:54c339298196fd10492f82';
  firebaseConfig.measurementId = 'G-GPEHME4LVG';
}

export function initialize() {
  firebase.initializeApp(firebaseConfig);

  // Fetch RC, with a fetch timeout of 30s and a key expiry of ~1 minute. This is reset later via
  // the config itself.
  const remoteConfig = firebase.remoteConfig();
  remoteConfig.settings = {
    fetchTimeoutMillis: 30 * 1000,
    minimumFetchIntervalMillis: 1000 * 60,
  };

  remoteConfig.defaultConfig = defaults;
  window.firebase = firebase;  // side-effect

  return remoteConfig.fetchAndActivate().catch((err) => {
    console.warn('could not fetch remoteConfig, using defaults', err);
  }).then(() => {
    return remoteConfig;
  });
}