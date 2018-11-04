
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
export const klangIsLoaded = new Promise((resolve) => {
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

/**
 * Trigger an event on Klang. This should be used for sound preload. While Klang broadly only has
 * a notion of 'events' (playing sound also counts as an 'event'), only preload events will result
 * in this method ever resolving.
 *
 * @param {string} event to load
 */
export async function dispatch(event) {
  await klangIsLoaded;
  await new Promise((resolve, reject) => {
    const empty = () => {};
    Klang.triggerEvent(event, resolve, empty, reject);
  });
};

/**
 * Plays a transient sound. These are skipped if Klang is not yet loaded.
 *
 * @param {SoundDetail} sound
 */
export function play(sound) {
  return localKlang && triggerSound(sound);
}

/**
 * Plays an ambient sound. These are queued if Klang is not yet loaded.
 *
 * @param {SoundDetail} sound
 */
export async function ambient(sound) {
  await klangIsLoaded;
  return triggerSound(sound);
}

/**
 * Internal sound trigger. Assumes Klang is available.
 *
 * @param {SoundDetail} sound
 */
function triggerSound(sound) {
  const soundName = (typeof sound === 'string') ? sound : sound.name;
  const args = [soundName];

  if (Array.isArray(sound['args'])) {
    args.push(...sound['args']);
  }
  localKlang.triggerEvent.apply(localKlang, args);
}
