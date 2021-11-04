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


import createStore from 'unistore';
import {dedup} from './src/lib/promises.js';

const g = createStore({
  mini: false,
  audioSuspended: undefined,  // undefined until we observe it
  muted: undefined,

  orientation: null,

  hidden: false,

  route: null,

  status: '',  // '', paused, gameover

  sceneOrientation: null,
  sceneTilt: false,
  sceneHasPause: false,

  score: {},

  playNextRoute: '',

  shareUrl: null,

  trackerOffset: 0,
});

export default g;

const startup = (fn) => {
  const call = fn(g);
  call && call();
};

/**
 * Listen for changes in portrait/landscape mode.
 */
startup((global) => {
  const portraitMedia = window.matchMedia('(min-device-width: 1px) and (max-device-width: 600px) and (orientation: portrait)');
  const landscapeMedia = window.matchMedia('(min-device-height: 1px) and (max-device-height: 600px) and (orientation: landscape)');

  const update = () => {
    let orientation = null;
  
    if (portraitMedia.matches) {
      orientation = 'portrait';
    } else if (landscapeMedia.matches) {
      orientation = 'landscape';
    }
  
    global.setState({orientation});
  };

  const d = dedup(update);
  portraitMedia.addListener(d);
  landscapeMedia.addListener(d);

  return update;
});

/**
 * Listen for global visibility changes.
 */
startup((global) => {
  const handler = () => {
    global.setState({hidden: document.hidden || false});
  };
  document.addEventListener('visibilitychange', handler);
  return handler;
});

/**
 * Listen for touch or mouse events to determine the input mode.
 */
startup((global) => {
  const pointerMedia = window.matchMedia('(any-pointer: fine)');  // mouse, but also stylus
  const hoverMedia = window.matchMedia('(any-hover: hover)');     // mouse, but also devices with a virtual pointer

  // TODO(samthor): If we see a gamepad, we should advertise it too, but this seems independent
  // from touch vs. mouse.

  const update = () => {
    // If the media queries don't match but we don't have the Touch constructor either, then
    // assume the user is using a mouse.
    const hasMouse = (pointerMedia.matches && hoverMedia.matches) || !window.Touch;
    global.setState({
      inputMode: hasMouse ? 'keys' : 'touch',
    });
  };

  const d = dedup(update);
  pointerMedia.addListener(d);
  hoverMedia.addListener(d);

  return update;
});

