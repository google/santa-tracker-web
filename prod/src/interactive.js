
let done = (document.readyState === 'interactive' || document.readyState === 'complete');
let all;

if (!done) {
  all = [];
  window.addEventListener('DOMContentLoaded', () => {
    done = true;
    all.forEach((fn) => fn());
    all = undefined;
  });
}

export default function onInteractive(fn) {
  if (!done) {
    all.push(fn);
  } else {
    fn();
  }
}
