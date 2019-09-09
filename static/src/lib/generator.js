

const done = Symbol('done');


/**
 * @param {!MessagePort} port
 * @return {{iter: !Iterator<!Promise<*>>, close: function(): void}}
 */
export function portIterator(port) {
  const queue = [];
  const nextResolve = [];

  const push = (data) => {
    if (nextResolve.length) {
      const r = nextResolve.shift();
      r(data);
    } else {
      queue.push(data);
    }
  };

  const iter = {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      let value;
      if (queue.length) {
        value = queue.shift();
      } else {
        value = new Promise((resolve) => {
          nextResolve.push(resolve);
        });
      }
      if (value === done) {
        return {done: true, value: null};
      }
      return {done: false, value};
    },
  };

  port.onmessage = (ev) => push(ev.data);

  return {
    iter,
    push,
    close() {
      port.close();
      push(done);
    },
  };
}
