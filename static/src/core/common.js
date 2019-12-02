
/**
 * Play the audio globally.
 *
 * @param {string} audio
 */
export function play(audio, args) {
  let array = Array.prototype.slice.call(arguments);
  const ce = new CustomEvent('santa-play', {
    detail: array,
  });
  window.dispatchEvent(ce);
}

/**
 * Request that the given Promise be added to any current preload.
 *
 * @param {!Promise<*>} promise
 */
export function preload(promise) {
  const ce = new CustomEvent('santa-preload', {
    detail: promise,
  });
  window.dispatchEvent(ce);
}
