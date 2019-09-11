
export const dedupFrame = (method) => {
  let p = null;

  return (...args) => {
    if (p === null) {
      p = new Promise((resolve) => {
        window.requestAnimationFrame(() => resolve(method(...args)));
      });
      p.then(() => p = null);
    }
    return p;
  }
};
