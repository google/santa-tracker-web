
import {build} from '../lib/params.js';

const isEndorsed = (['santatracker.google.com', 'maps.gstatic.com'].indexOf(location.hostname) !== -1);

const mapsClient = isEndorsed ? 'google-santa-tracker' : '';
const apiKey = isEndorsed ? '' : 'AIzaSyCd10wMb551oDwcH7tVZRBPifMh6MQpnpU';  // for localhost, testing

const mapsApiURLBase = 'https://maps.googleapis.com/maps/api/js';
const callbackName = '__$global_santa_maps_callback_' + Math.random().toString(16).slice(2);

function mapsApiURL() {
  const params = {
    'callback': callbackName,
    'v': '3.exp',
    'libraries': 'drawing,geometry',
    'use_slippy': true,
  };
  if (document.documentElement.lang) {
    params['language'] = document.documentElement.lang;
  }
  if (mapsClient) {
    params['client'] = mapsClient;
  }
  if (apiKey) {
    params['key'] = apiKey;
  }
  return mapsApiURLBase + build(params);
}

let mapsPromise = null;

export default function load() {
  if (mapsPromise === null) {
    mapsPromise = internalLoad();
  }
  return mapsPromise;
}

async function internalLoad() {
  const p = new Promise((resolve, reject) => {
    window[callbackName] = resolve;
    const script = document.createElement('script');
    script.src = mapsApiURL();
    script.onerror = reject;
    document.head.appendChild(script);
  });

  try {
    await p;
    return window['google']['maps'];
  } finally {
    delete window[callbackName];
  }
}
