const withinFrame = window.parent && window.parent !== window;

/**
 * @param {string} init data to send to init communication
 * @param {function(*): void} callback to invoke when data is received
 * @return {function(*) void} to send across channel, but does nothing if not in frame
 */
export function parent(init, callback) {
  if (!withinFrame) {
    return (data) => {};  // literally do nothing
  }

  const mc = new MessageChannel();
  window.parent.postMessage(init, '*', [mc.port2]);
  if (callback) {
    mc.port1.onmessage = (ev) => callback(ev.data);
  }
  return (data) => mc.port1.postMessage(data);
}
