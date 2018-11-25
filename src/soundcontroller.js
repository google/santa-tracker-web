
/**
 * Klang path. This is normalized, but shouldn't really be loaded more than once anyway.
 */
const klangPath = _root`third_party/lib/klang`;


/**
 * Local version of `window.Klang` that gets added to the page.
 */
let localKlang;


/**
 * Internal Klang engine. Used for load detection.
 */
let klangEngine;



const zeroAudioContext = new AudioContext();
export const initialSuspend = zeroAudioContext.state === 'suspended';



/**
 * @return {boolean} whether audio is now unsuspended
 */
export function resume() {
  zeroAudioContext.resume();
  localKlang && localKlang.context && localKlang.context.resume();
  return zeroAudioContext.state !== 'suspended';
}


/**
 * @param {!Node=} target to add handlers on
 * @param {boolean=} force install of resume handler
 */
export async function installGestureResume(target=document, force=false) {
  if (!force && zeroAudioContext.state !== 'suspended') {
    return;  // nothing to do
  }

  const events = ['mousedown', 'touchend', 'touchstart', 'scroll', 'wheel'];
  const options = {capture: true, passive: true};

  return new Promise((resolve) => {
    function handler(ev) {
      const resumed = resume();
      console.info('handler for gesturePromise', ev.type, resumed);
      if (resumed) {
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

    // Insert the Klang script. We load this dynamically as it's quite large and can be deferred=
    // until after the page is created.
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${klangPath}/klang.min.js`;
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


/**
 * Internal call to trigger a waitable event on Klang. Assumes Klang is available in `localKlang`.
 * Klang is sometimes (?) unhappy when multiple waitable events are in-flight, so this is intended
 * to be called in a serial manner from `fire`.
 *
 * @param {string} event to fire
 * @return {!Promise<boolean>}
 */
function triggerEvent(event) {
  return new Promise((resolve, reject) => {
    // If Klang retains the progress callback, then wait for the complete callback to resolve,
    // otherwise complete immediately (we don't know what callbacks are wired up in Klang).
    // TODO(samthor): Callbacks only seem to be used for `load` events, which _do_ need to happen
    // in-order. No other events seem to care?

    const progress = () => {};  // used as nonce
    localKlang.triggerEvent(event, resolve, progress, reject);
    if (!klangEngine || klangEngine._progressCallback !== progress) {
      resolve();  // there's no progress, resolve now
    }
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

    if (previousClearEvent) {
      await fire(previousClearEvent);
    }
    await fire(startEvent);
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
