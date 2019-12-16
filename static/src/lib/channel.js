export const withinFrame = window.parent && window.parent != window;

/**
 * @param {function(*): void} callback to invoke when data is received
 * @return {function(*) void} to send across channel, but does nothing if not in frame
 */
export function parent(callback) {
  if (!withinFrame) {
    return () => {};  // literally do nothing
  }

  const {port1, port2} = new MessageChannel();
  window.parent.postMessage(port2, '*', [port2]);
  port1.onmessage = (ev) => callback(ev.data);
  return port1.postMessage.bind(port1);
}
