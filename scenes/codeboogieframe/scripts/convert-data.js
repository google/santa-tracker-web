var fs = require('fs');
var lines = fs.readFileSync('info.txt').toString().split("\n");

let output = {};

lines.forEach(line => {
  if (!line) return;

  let [key, value] = line.split(' ');
  let [width, height, offsetX, offsetY] = value.split(/[x+]+/);

  output[key] = {width, height, offsetX, offsetY}
})

console.log(JSON.stringify(output));





