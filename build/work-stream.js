
const emptyFunc = () => {};

/**
 * @template K
 * @template O
 */
module.exports = class WorkStream {

  /**
   * @param {function(K): (!O|!Promise<O>)} fn
   * @param {function(K, O, number): void=} log
   */
  constructor(fn, log=emptyFunc) {
    this._fn = async (arg) => fn(arg);  // always returns Promise
    this._log = log;

    this._pending = null;
    this._run = Promise.resolve();
  }

  /**
   * @param {K} key
   * @return {!Promise<O>}
   */
  run(key) {
    let startRun = false;
    if (this._pending === null) {
      this._pending = new Map();
      startRun = true;
    } else {
      const prev = this._pending.get(key);
      if (prev !== undefined) {
        return prev.p;  // already requested
      }
    }

    let localResolve;
    const p = new Promise((resolve) => localResolve = resolve);
    this._pending.set(key, {resolve: localResolve, p});

    if (startRun) {
      // If this is the first run, then it's going to start runner and the work now. The relevant
      // part is that the class allows more tasks to be queued while the first is still in-flight.
      this._run = this._run.then(() => this._runner());
    }
    return p;
  }

  async _runner() {
    // grab all pending tasks and run them
    const work = this._pending;
    this._pending = null;
    for (const [key, data] of work) {
      const {resolve} = data;
      const start = +new Date;

      // run the handler for this key
      const p = this._fn(key);
      resolve(p.then((out) => {
        const duration = (+new Date) - start;
        this._log(key, out, duration);
        return out;
      }));

      // eat error and wait (error is returned via resolve, but the runner doesn't care)
      await p.catch(() => {});
    }
  }
};
