/**
 * @fileoverview Initialize function to prepare Firebase and Remote Config.
 */

import firebase from 'firebase/app';
import 'firebase/remote-config';
import defaults from './remote-config-defaults.js';

export var firebaseConfig = {
  apiKey: 'AIzaSyDdDYk51KwSIJ-vyBI01V3h87DaGYJ9DxQ',
  authDomain: 'santaweb-demo.firebaseapp.com',
  databaseURL: 'https://santaweb-demo.firebaseio.com',
  projectId: 'santaweb-demo',
  storageBucket: 'santaweb-demo.appspot.com',
  messagingSenderId: '405945309789',
  appId: '1:405945309789:web:beebb797c697146e9c0bb4',
  measurementId: 'G-4CXCGE4LE6',
};

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

  return remoteConfig.fetchAndActivate().catch(function(err) {
    console.warn('could not fetch remoteConfig, using defaults', err);
  }).then(function() {
    return remoteConfig.getAll();
  });
}