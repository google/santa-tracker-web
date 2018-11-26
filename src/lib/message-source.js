
const registry = new WeakMap();

self.addEventListener('message', (ev) => {
  const method = registry.get(ev.source);
  if (method) {
    method(ev);
  }
});

export function add(source, method) {
  registry.set(source, method);
}

export function remove(source) {
  registry.delete(source);
}
