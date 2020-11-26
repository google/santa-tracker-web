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