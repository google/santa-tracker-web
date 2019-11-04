
export const dedupFrame = (fn) => {
  let rAF = 0;
  return () => {
    if (rAF !== 0) {
      return;
    }
    rAF = window.requestAnimationFrame(() => {
      rAF = 0;
      fn();
    });
  };
};
