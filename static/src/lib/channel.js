const withinFrame = window.parent && window.parent != window;

/**
 * @param {string} init data to send to init communication
 * @param {function(*): void} callback to invoke when data is received
 * @return {function(*) void} to send across channel, but does nothing if not in frame
 */
export function parent(init, callback) {
  if (!withinFrame) {
    return () => {};  // literally do nothing
  }

  const {port1, port2} = new MessageChannel();
  window.parent.postMessage(init, '*', [port2]);
  if (callback) {
    port1.onmessage = (ev) => callback(ev.data);
  }
  return port1.postMessage.bind(port1);
}
