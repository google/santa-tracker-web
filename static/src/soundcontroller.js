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


import {_static} from './magic.js';


/**
 * Klang path. This is normalized, but shouldn't really be loaded more than once anyway.
 */
const klangPath = _static`third_party/lib/klang`;


/**
 * Local version of `window.Klang` that gets added to the page.
 */
let localKlang;


/**
 * Internal Klang engine. Used for load detection.
 */
let klangEngine;



self.AudioContext = self.AudioContext || self.webkitAudioContext;

const zeroAudioContext = new AudioContext();
export const initialSuspend = zeroAudioContext.state === 'suspended';  // needs browser gesture



/**
 * @return {boolean} whether audio is now unsuspended
 */
export function resume() {
  zeroAudioContext.resume();
  localKlang && localKlang.context.resume();
  console.info('resumed context', zeroAudioContext.state, localKlang && localKlang.context.state)
  return zeroAudioContext.state !== 'suspended';
}


/**
 * @param {!Node=} target to add handlers on
 * @param {boolean=} force install of resume handler
 */
export function installGestureResume(target=document, force=false) {
  if (!force && zeroAudioContext.state !== 'suspended') {
    return;  // nothing to do
  }

  // nb. Not all of these are user gestures, but try aggressively anyway.
  const events = ['mousedown', 'touchend', 'touchstart', 'scroll', 'wheel', 'keydown'];
  const options = {capture: true, passive: true};

  return new Promise((resolve) => {
    function handler(ev) {
      const resumed = resume();
      if (resumed) {
        // great, we can remove everything!
        events.forEach((event) => target.removeEventListener(event, handler, options));
        resolve();
      }
    }
    events.forEach((event) => target.addEventListener(event, handler, options));
  });
}


/**
 * Resolved with the loaded Klang object.
 */
export const klang = new Promise((resolve) => {
  const fn = async () => {
    // only load Klang once the viewport is visible
    await new Promise((r) => window.requestAnimationFrame(r))
    // TODO(samthor): only load if we want to play sound.
    if (window.requestIdleCallback) {
      await new Promise((r) => window.requestIdleCallback(r));
    }

    // Insert the Klang script. We load this dynamically as it's quite large and can be deferred
    // until after the page is created. It's traditional ES5 code.
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${klangPath}/klang.js`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // Init with the Klang config.
    const success = await new Promise((r) => Klang.init(`${klangPath}/config.js`, r));
    if (!success) {
      throw new Error('Klang failed to load config');
    }

    // Save Klang, and return it here anyway.
    localKlang = window.Klang;
    klangEngine = localKlang.audioTagHandler || localKlang.getCoreInstance();

    return window.Klang;
  };
  resolve(fn());
});


const klangIsLoaded = klang.then(() => null);
let klangEventTask = klangIsLoaded;
let klangAmbientTask = klangIsLoaded;


let preloadTask = klangIsLoaded;


/**
 * Build helpers which estimate the total number of assets loadable by Klang.
 *
 * Klang only gives us % complete over time, not asset count. This takes a wild guess at the total
 * number of parts to load.
 */
export function buildProgressReady(callback, resolve) {
  if (callback) {
    let totalParts = 0;
    let lastValue = -1;
    return {
      progress(percent) {
        if (!totalParts && percent) {
          totalParts = Math.ceil(100.0 / percent);
        }
        if (totalParts) {
          const value = Math.round(percent * totalParts / 100.0);
          if (lastValue !== value && value < totalParts) {
            lastValue = value;
            callback(lastValue, totalParts);
          }
        }
      },
      ready() {
        callback(totalParts, totalParts);
        resolve(true);
      },
    };
  }
  return {
    progress() {},
    ready() {
      resolve(true);
    },
  };
}


/**
 * Preloads the given Klang collection.
 *
 * @param {string} event to preload
 * @param {?function(number, number): void=} callback to indicate progress
 * @return {!Promise<boolean>} whether this succeeded (true) or was superceded (false)
 */
export function preload(event, callback=null) {
  const localPreloadTask = preloadTask.catch(() => null).then(() => {
    if (preloadTask !== localPreloadTask) {
      return false;  // nothing to do, we got superceded
    }

    // As of 2018, Klang stores _progressCallback on both Core and AudioTagHandler engines for
    // preload events, which only work in serial (since they use global state). We set a known
    // function, and if it isn't saved, this is actually an error case.
    return new Promise((resolve, reject) => {
      const {progress, ready} = buildProgressReady(callback, resolve);
      localKlang.triggerEvent(event, ready, progress, reject);
      if (klangEngine._progressCallback !== progress) {
        throw new Error(`non-preload event requested by scene: ${event}`);
      }
    });
  });

  preloadTask = localPreloadTask;
  return localPreloadTask;
}


/**
 * Internal call to trigger a waitable event on Klang. Assumes Klang is available in `localKlang`.
 * Klang is sometimes (?) unhappy when multiple waitable events are in-flight, so this is intended
 * to be called in a serial manner from `fire`.
 *
 * @param {string} event to fire
 * @return {!Promise<boolean>}
 */
function triggerEvent(event, arg) {
  return new Promise((resolve, reject) => {
    // If Klang retains the progress callback, then wait for the complete callback to resolve,
    // otherwise complete immediately (we don't know what callbacks are wired up in Klang).
    // The callback is also not retained if the event is _invalid_.
    // TODO(samthor): Callbacks only seem to be used for `load` events, which _do_ need to happen
    // in-order. No other events seem to care?

    const progress = (...args) => {
      console.info('got progress for Klang event', event, arg, args);
    };  // used as nonce
    localKlang.triggerEvent(event, resolve, progress, reject);
    if (!klangEngine || klangEngine._progressCallback !== progress) {
      resolve();  // there's no progress, resolve now
    }
  });
}


/**
 * Triggers an event inline with klangEventTask.
 *
 * @param {function(): *} cb 
 */
function withEventTask(cb) {
  const localTask = klangEventTask.then(async () => {
    await cb();
    await Promise.resolve(true);  // wait microtask
  });
  klangEventTask = localTask;
  return localTask;

}


/**
 * Trigger an event on Klang. This is used for sound preload and ambient sounds. Events are
 * rate-limited so at most one event is dispatched per frame.
 *
 * @param {string} event to fire
 * @return {!Promise<void>}
 */
export function fire(event) {
  return withEventTask(async () => {
    await triggerEvent(event);
  });
}


/**
 * Plays ambient sound via Klang. Fires the most recent `clearEvent` before allowing another fire
 * of a new `startEvent` to occur.
 *
 * @param {string} startEvent to fire on start
 * @param {string} clearEvent to fire on cleanup
 * @return {!Promise<void>} when this audio starts
 */
export function ambient(startEvent, clearEvent) {
  // TODO(samthor): If the startEvent is already running, do nothing.
  // TODO(samthor): There are a bunch of odd ways games use sound that probably don't mesh with
  // this model.

  const localTask = klangAmbientTask.then(async (previousClearEvent) => {
    if (localTask !== klangAmbientTask) {
      return previousClearEvent;  // allow the next task to clean up, we're superceded
    }

    if (previousClearEvent) {
      await fire(previousClearEvent);
    }
    if (startEvent) {
      await fire(startEvent);
    }
    return clearEvent;
  });
  klangAmbientTask = localTask;
  return localTask.then(() => undefined);
}


/**
 * Plays a transient sound. Skipped if Klang is not yet loaded.
 *
 * @param {SoundDetail} sound
 * @param {*=} arg to pass
 */
export function play(sound, arg=undefined) {
  if (!localKlang) {
    return;
  }

  const soundName = (typeof sound === 'string') ? sound : sound.name;
  const args = [soundName];
  if (arg) {
    args.push(arg);
  }

  if (Array.isArray(sound['args'])) {
    args.push(...sound['args']);
  }
  localKlang.triggerEvent.apply(localKlang, args);
}


function getPlayingLoop(tracks) {
  let playingLoop = undefined;
  for (let i = 0; i < tracks.length; ++i) {
    if (tracks[i].playing && tracks[i].position >= 0) {
      if (!playingLoop || tracks[i].position < playingLoop.position) {
        playingLoop = tracks[i];
      }
    }
  }
  return playingLoop;
}


/**
 * Used by Code Boogie to transition smoothly between music.
 *
 * @param {string} collection
 * @param {number} index
 * @param {number} bpm
 * @param {number} arg0
 * @param {number} arg1
 */
export function transition(collection, index, bpm, arg0, arg1) {
  // nb. Waiting for the event task is fraught with peril because we're probably going to delay
  // this audio transition, which effects games like Code Boogie or Wrap Battle.
  return withEventTask(async () => {
    const klangUtil = localKlang.getUtil();
    const tracks = Klang.engineVersion === 'webaudio' ? Klang.$(collection)._content : [];
    const track = tracks[index];
    if (!track) {
      console.warn('no track to transition to', collection, index);
      return;
    }
    const playingLoop = getPlayingLoop(tracks);
    klangUtil.transition(playingLoop, track, bpm, arg0, arg1);
  });
}
