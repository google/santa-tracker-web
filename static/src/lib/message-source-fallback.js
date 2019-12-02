
let active = null;
let savedMethod = null;

self.addEventListener('message', (ev) => {
  if (ev.source === active) {
    savedMethod && savedMethod(ev);
    active = null;
    savedMethod = null;
  } else {
    console.warn('got message for unknown source', ev.source);
  }
});

export function add(source, method) {
  active = source;
  savedMethod = method;
}

export function remove(source) {
  if (source === active) {
    active = null;
    savedMethod = null;
  }
}
