

const closedNonce = {__CLOSED: true};


/**
 * @param {!MessagePort} port
 * @return {{iter: !Iterator<!Promise<*>>, close: function(): void}}
 */
export function portIterator(port) {
  const queue = [];
  const nextResolve = [];
  let closed = false;

  const push = (data) => {
    if (closed) {
      throw new Error('port closed');
    }
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

        if (value === closedNonce) {
          return {done: true, value: null};
        }
      } else if (closed) {
        return {done: true, value: null};
      } else {
        value = new Promise((resolve) => {
          nextResolve.push(resolve);
        });
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
      push(closedNonce);
      closed = true;
    },
  };
}
