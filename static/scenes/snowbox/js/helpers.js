export function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function toRadian(degrees) {
  return degrees * Math.PI / 180
}
