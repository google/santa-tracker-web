
import {urlToStatic} from './lib/location.js';


/**
 * Klang script source URL.
 */
const klangSrc = urlToStatic('third_party/lib/klang/klang.js');


/**
 * Klang config file URL.
 */
const klangConfigSrc = urlToStatic('third_party/lib/klang/config.js');


/**
 * Local version of `window.Klang` that gets added to the page.
 */
let localKlang;


/**
 * Resolved when a user gesture has completed (or if a user gesture isn't required to play).
 */
const gesturePromise = new Promise((resolve, reject) => {
  // TODO(samthor): play a zero-length Audio to check for rejection
  function handler() {
    document.removeEventListener('mousedown', handler);
    document.removeEventListener('touchend', handler);
    resolve();
  }
  document.addEventListener('mousedown', handler);
  document.addEventListener('touchend', handler);
});


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

    // Insert the Klang script.
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = klangSrc;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // Init with the Klang config.
    const success = await new Promise((r) => Klang.init(klangConfigSrc, r))
    if (!success) {
      throw new Error('Klang failed to load config');
    }

    // This isn't really for iOS, but for environments where sound won't play until a gesture.
    gesturePromise.then(() => Klang.initIOS());

    // Save Klang, and return it here anyway.
    localKlang = window.Klang;
    return window.Klang;
  };
  resolve(fn());
});


const klangIsLoaded = klang.then(() => null);
let klangEventTask = klangIsLoaded;
let klangAmbientTask = klangIsLoaded;


/**
 * Internal call to trigger a waitable event on Klang. Assumes Klang is available in `localKlang`.
 * Klang is unhappy when multiple waitable events are in-flight, so this is intended to be called
 * in a serial manner from `fire`.
 *
 * @param {string} event to fire
 * @return {!Promise<boolean>}
 */
function triggerEvent(event) {
  return new Promise((resolve, reject) => {
    // If Klang invokes the progress callback, then wait for the complete callback to resolve,
    // otherwise complete immediately (we don't know what callbacks are wired up in Klang).
    const timeout = window.setTimeout(() => resolve(), 0);
    const progress = () => {
      window.clearTimeout(timeout);  // progress called, expect later resolve()
    };
    localKlang.triggerEvent(event, resolve, progress, reject);
  });
}


/**
 * Trigger an event on Klang. This is used for sound preload and ambient sounds. Events are
 * rate-limited so at most one event is dispatched per frame.
 *
 * @param {string} event to fire
 * @return {!Promise<void>}
 */
export function fire(event) {
  const localTask = klangEventTask.then(async () => {
    await triggerEvent(event);
    await Promise.resolve(true);  // wait microtask
  });
  klangEventTask = localTask;
  return localTask;
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

    if (previousClearEvent !== null) {
      await triggerEvent(previousClearEvent);
    }
    await triggerEvent(startEvent);
    return clearEvent;
  });
  klangAmbientTask = localTask;
  return localTask.then(() => undefined);
}


/**
 * Plays a transient sound. Skipped if Klang is not yet loaded.
 *
 * @param {SoundDetail} sound
 */
export function play(sound) {
  if (!localKlang) {
    return;
  }

  const soundName = (typeof sound === 'string') ? sound : sound.name;
  const args = [soundName];

  if (Array.isArray(sound['args'])) {
    args.push(...sound['args']);
  }
  localKlang.triggerEvent.apply(localKlang, args);
}
