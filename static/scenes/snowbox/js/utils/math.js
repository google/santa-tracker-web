export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomFloat(min, max) {
  return Math.random() * (max - min + 1) + min
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

export function toRadian(degrees) {
  return degrees * Math.PI / 180
}

