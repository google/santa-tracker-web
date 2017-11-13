export const combine = (...fns) => (...args) => fns.forEach(fn => fn(...args));
export const randomElement = array => array[Math.floor(Math.random() * array.length)];
export const randomValue = object => {
  const keys = Object.keys(object);
  return object[keys[Math.floor(Math.random() * keys.length)]];
};
