

/**
 * Returns a Promise that resolves after requestAnimationFrame with an optional delayed start.
 *
 * @param {number=} ms to sleep for before frame
 */
export function frame(ms = -1) {
  if (ms >= 0) {
    return new Promise((r) => {
      window.setTimeout(() => window.requestAnimationFrame(() => r()), ms);
    });
  }
  return new Promise((r) => window.requestAnimationFrame(() => r()));
}

export function timeout(ms) {
  return new Promise((r) => window.setTimeout(() => r(), ms));
}

async function wrap(fn, args) {
  return fn(...args);
}

/**
 * @template T
 * @param {function(): T|!Promise<T>} method to dedup over a frame
 * @return {function(): !Promise<T>}
 */
export const dedup = (method) => {
  let p = Promise.resolve();
  let lastArguments;

  return (...args) => {
    if (lastArguments === undefined) {
      p = p.catch(() => null).then(() => frame()).then(() => {
        const localArguments = lastArguments;
        lastArguments = undefined;
        return wrap(method, localArguments);
      });
    }

    lastArguments = args;
    return p;
  }
};


/**
 * @return {{promise: !Promise<T>, resolve: function(T): void}}
 */
export function resolvable() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return {promise, resolve};
}

/**
 * @param {number} delay to timeout after
 * @return {function(...!Promise<*>): !Promise<*>}
 */
export function timeoutRace(delay) {
  const timeoutPromise = timeout(delay);

  return (...other) => {
    other.push(timeoutPromise);
    return Promise.race(other);
  }
}