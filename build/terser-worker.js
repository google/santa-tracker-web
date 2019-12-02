const {
  isMainThread, parentPort, workerData
} = require('worker_threads');

const Terser = require('terser');

if (isMainThread) {
  throw new Error('Only supports running on worker thread');
}

const result = Terser.minify(workerData);
parentPort.postMessage(result);
