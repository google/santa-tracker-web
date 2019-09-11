
export function resolvable() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return {promise, resolve};
}

export function timeout(delay, value=null) {
  return new Promise((r) => window.setTimeout(() => r(value), delay));
}

export function rAF(value=null) {
  return new Promise((r) => window.requestAnimationFrame(() => r(value)));
}

export function timeoutRace(delay, value) {
  const timeoutPromise = timeout(delay, value);

  return (...other) => {
    other.push(timeoutPromise);
    return Promise.race(other);
  }
}