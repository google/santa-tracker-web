export const combine = (...fns) => (...args) => fns.forEach(fn => fn(...args));
